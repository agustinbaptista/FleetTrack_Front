import { create } from "zustand";
import type { Vehicle } from "@/types/vehicle";
import { vehicleService } from "@/services/vehicleService";

type VehiclesState = {
  items: Vehicle[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (body: Parameters<typeof vehicleService.create>[0]) => Promise<Vehicle>;
  update: (id: string, body: Parameters<typeof vehicleService.update>[1]) => Promise<Vehicle>;
  remove: (id: string) => Promise<void>;
};

export const useVehiclesStore = create<VehiclesState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const items = await vehicleService.list();
      set({ items, loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Error al cargar vehículos",
      });
    }
  },

  create: async (body) => {
    const v = await vehicleService.create(body);
    set({ items: [v, ...get().items] });
    return v;
  },

  update: async (id, body) => {
    const v = await vehicleService.update(id, body);
    set({
      items: get().items.map((x) => (x.id === id ? v : x)),
    });
    return v;
  },

  remove: async (id) => {
    await vehicleService.remove(id);
    set({ items: get().items.filter((x) => x.id !== id) });
  },
}));
