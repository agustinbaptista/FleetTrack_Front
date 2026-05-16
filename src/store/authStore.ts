import { create } from "zustand";
import { STORAGE_KEYS } from "@/lib/constants";
import { getBrowserAccessToken } from "@/lib/tokenStorage";
import { clearAuthCookieClient, setAuthCookieClient } from "@/lib/cookies";
import { decodeAccessToken } from "@/lib/jwt";
import { authService } from "@/services/authService";
import { websocketService } from "@/services/websocketService";
import { useAlertsStore } from "@/store/alertsStore";
import { useLocationsStore } from "@/store/locationsStore";
import type { JwtClaims } from "@/types/auth";
import type { Role } from "@/types/role";
import { ApiError } from "@/types/api";

type AuthState = {
  user: JwtClaims | null;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  hydrateFromStorage: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: Role) => Promise<void>;
  logout: () => void;
};

function persistToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(STORAGE_KEYS.accessToken, token);
    setAuthCookieClient(token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    clearAuthCookieClient();
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,

  setHydrated: (v) => set({ hydrated: v }),

  hydrateFromStorage: () => {
    if (typeof window === "undefined") return;
    const token = getBrowserAccessToken();
    if (token) {
      try {
        const user = decodeAccessToken(token);
        if (user.exp != null && Date.now() / 1000 >= user.exp - 30) {
          persistToken(null);
          set({ user: null, hydrated: true });
          return;
        }
        set({ user, hydrated: true });
        return;
      } catch {
        localStorage.removeItem(STORAGE_KEYS.accessToken);
        clearAuthCookieClient();
      }
    }
    set({ user: null, hydrated: true });
  },

  login: async (email, password) => {
    const { accessToken } = await authService.login({ email, password });
    persistToken(accessToken);
    set({ user: decodeAccessToken(accessToken) });
  },

  register: async (email, password, role) => {
    const { accessToken } = await authService.register({
      email,
      password,
      ...(role ? { role } : {}),
    });
    persistToken(accessToken);
    set({ user: decodeAccessToken(accessToken) });
  },

  logout: () => {
    websocketService.disconnect();
    useLocationsStore.getState().reset();
    useAlertsStore.getState().clear();
    persistToken(null);
    set({ user: null });
  },
}));

export function getAccessToken(): string | null {
  return getBrowserAccessToken();
}

export function canManageVehicles(role: Role | undefined): boolean {
  return role === "admin" || role === "operator";
}

export function canDeleteVehicle(role: Role | undefined): boolean {
  return role === "admin";
}

export function authErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Error inesperado";
}
