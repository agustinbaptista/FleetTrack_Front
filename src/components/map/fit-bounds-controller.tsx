"use client";

import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import type { MapMarkerPoint } from "@/components/map/vehicle-cluster-layer";

export function FitBoundsController({
  markers,
  focusVehicleId,
}: {
  markers: MapMarkerPoint[];
  focusVehicleId?: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (focusVehicleId) {
      const m = markers.find((x) => x.vehicleId === focusVehicleId);
      if (m) {
        map.setView([m.lat, m.lng], 14, { animate: true });
        return;
      }
    }
    const coords = markers.map((p) => [p.lat, p.lng] as L.LatLngExpression);
    if (coords.length === 0) return;
    const b = L.latLngBounds(coords);
    if (b.isValid()) map.fitBounds(b.pad(0.12), { animate: true });
  }, [map, markers, focusVehicleId]);

  return null;
}
