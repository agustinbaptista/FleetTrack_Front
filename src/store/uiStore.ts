import { create } from "zustand";

type UiState = {
  mapFocusVehicleId: string | null;
  mapShowHeatmap: boolean;
  alertsFilterVehicleId: string | null;
  setMapFocusVehicleId: (id: string | null) => void;
  setMapShowHeatmap: (v: boolean) => void;
  setAlertsFilterVehicleId: (id: string | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  mapFocusVehicleId: null,
  mapShowHeatmap: false,
  alertsFilterVehicleId: null,
  setMapFocusVehicleId: (id) => set({ mapFocusVehicleId: id }),
  setMapShowHeatmap: (v) => set({ mapShowHeatmap: v }),
  setAlertsFilterVehicleId: (id) => set({ alertsFilterVehicleId: id }),
}));
