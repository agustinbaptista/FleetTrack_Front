import { httpRequest } from "@/services/httpClient";
import type { CreateLocationBody, Location } from "@/types/location";

function normalizeLocation(raw: Record<string, unknown>): Location {
  return {
    id: String(raw.id),
    vehicleId: String(raw.vehicleId),
    latitude: Number(raw.latitude),
    longitude: Number(raw.longitude),
    speed: Number(raw.speed),
    fuelLevel: Number(raw.fuelLevel),
    engineStatus: Boolean(raw.engineStatus),
    createdAt:
      raw.createdAt instanceof Date
        ? raw.createdAt.toISOString()
        : String(raw.createdAt ?? ""),
  };
}

export const trackingService = {
  async postLocation(body: CreateLocationBody) {
    const data = (await httpRequest<Record<string, unknown>>("/tracking/location", {
      method: "POST",
      body,
    })) as Record<string, unknown>;
    return normalizeLocation(data);
  },

  async getHistory(vehicleId: string) {
    const list = await httpRequest<Record<string, unknown>[]>(
      `/tracking/history/${vehicleId}`,
    );
    return list.map((row) => normalizeLocation(row));
  },

  async getLatest(vehicleId: string) {
    const data = await httpRequest<Record<string, unknown> | null>(
      `/tracking/latest/${vehicleId}`,
    );
    if (!data) return null;
    return normalizeLocation(data);
  },
};
