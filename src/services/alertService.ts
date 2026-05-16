import { httpRequest } from "@/services/httpClient";
import type { VehicleAlert } from "@/types/alert";

function normalizeAlert(raw: Record<string, unknown>): VehicleAlert {
  return {
    id: String(raw.id),
    vehicleId: String(raw.vehicleId),
    type: String(raw.type),
    message: String(raw.message ?? ""),
    createdAt:
      raw.createdAt instanceof Date
        ? raw.createdAt.toISOString()
        : String(raw.createdAt ?? ""),
  };
}

export const alertService = {
  async listByVehicle(vehicleId: string) {
    const list = await httpRequest<Record<string, unknown>[]>(`/alerts/${vehicleId}`);
    return list.map((row) => normalizeAlert(row));
  },
};
