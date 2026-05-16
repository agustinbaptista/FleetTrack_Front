import { create } from "zustand";
import type { Location } from "@/types/location";

function normalizeLocationPayload(raw: Record<string, unknown>): Location {
  return {
    id: String(raw.id ?? ""),
    vehicleId: String(raw.vehicleId ?? ""),
    latitude: Number(raw.latitude),
    longitude: Number(raw.longitude),
    speed: Number(raw.speed ?? 0),
    fuelLevel: Number(raw.fuelLevel ?? 0),
    engineStatus: Boolean(raw.engineStatus),
    createdAt:
      typeof raw.createdAt === "string"
        ? raw.createdAt
        : new Date(String(raw.createdAt ?? Date.now())).toISOString(),
  };
}

type LocationsState = {
  byVehicleId: Record<string, Location>;
  lastSeenMs: Record<string, number>;
  offlineVehicleIds: Record<string, true>;
  applyLocation: (raw: unknown) => void;
  markVehicleOffline: (vehicleId: string) => void;
  seedLatest: (vehicleId: string, loc: Location | null) => void;
  reset: () => void;
};

export const useLocationsStore = create<LocationsState>((set) => ({
  byVehicleId: {},
  lastSeenMs: {},
  offlineVehicleIds: {},

  applyLocation: (raw) => {
    const loc = normalizeLocationPayload(raw as Record<string, unknown>);
    const now = Date.now();
    set((s) => {
      const offline = { ...s.offlineVehicleIds };
      delete offline[loc.vehicleId];
      return {
        byVehicleId: { ...s.byVehicleId, [loc.vehicleId]: loc },
        lastSeenMs: { ...s.lastSeenMs, [loc.vehicleId]: now },
        offlineVehicleIds: offline,
      };
    });
  },

  markVehicleOffline: (vehicleId) =>
    set((s) => ({
      offlineVehicleIds: { ...s.offlineVehicleIds, [vehicleId]: true },
    })),

  seedLatest: (vehicleId, loc) => {
    if (!loc) return;
    set((s) => ({
      byVehicleId: { ...s.byVehicleId, [vehicleId]: loc },
      lastSeenMs: { ...s.lastSeenMs, [vehicleId]: Date.now() },
    }));
  },

  reset: () =>
    set({
      byVehicleId: {},
      lastSeenMs: {},
      offlineVehicleIds: {},
    }),
}));
