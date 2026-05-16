import { create } from "zustand";
import type { VehicleAlert } from "@/types/alert";

const MAX = 400;

function normalizeAlert(raw: Record<string, unknown>): VehicleAlert {
  return {
    id: String(raw.id ?? crypto.randomUUID()),
    vehicleId: String(raw.vehicleId ?? ""),
    type: String(raw.type ?? "UNKNOWN"),
    message: String(raw.message ?? ""),
    createdAt:
      typeof raw.createdAt === "string"
        ? raw.createdAt
        : new Date().toISOString(),
  };
}

type AlertsState = {
  items: VehicleAlert[];
  pushFromSocket: (raw: unknown) => void;
  setFromHistory: (list: VehicleAlert[]) => void;
  clear: () => void;
};

export const useAlertsStore = create<AlertsState>((set, get) => ({
  items: [],

  pushFromSocket: (raw) => {
    const alert = normalizeAlert(raw as Record<string, unknown>);
    const cur = get().items;
    if (cur.some((a) => a.id === alert.id)) return;
    set({ items: [alert, ...cur].slice(0, MAX) });
  },

  setFromHistory: (list) => {
    const merged = [...list, ...get().items];
    const seen = new Set<string>();
    const dedup: VehicleAlert[] = [];
    for (const a of merged) {
      if (seen.has(a.id)) continue;
      seen.add(a.id);
      dedup.push(a);
    }
    set({ items: dedup.slice(0, MAX) });
  },

  clear: () => set({ items: [] }),
}));
