import type { Vehicle } from "@/types/vehicle";
import type { Location } from "@/types/location";
import { ONLINE_THRESHOLD_MS } from "@/lib/constants";
import type { MapMarkerPoint } from "@/components/map/vehicle-cluster-layer";

export function buildMapMarkers(
  vehicles: Vehicle[],
  byVehicleId: Record<string, Location>,
  lastSeenMs: Record<string, number>,
  offlineVehicleIds: Record<string, true>,
): MapMarkerPoint[] {
  const now = Date.now();
  const out: MapMarkerPoint[] = [];
  for (const v of vehicles) {
    const loc = byVehicleId[v.id];
    if (!loc) continue;
    const seen = lastSeenMs[v.id] ?? 0;
    const offline = Boolean(offlineVehicleIds[v.id]) || now - seen > ONLINE_THRESHOLD_MS;
    out.push({
      vehicleId: v.id,
      lat: loc.latitude,
      lng: loc.longitude,
      title: v.plate,
      subtitle: `${offline ? "Offline" : "Online"} · ${Math.round(loc.speed)} km/h · Comb. ${Math.round(loc.fuelLevel)}%`,
    });
  }
  return out;
}
