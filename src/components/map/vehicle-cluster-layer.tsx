"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { useMap } from "react-leaflet";

export type MapMarkerPoint = {
  vehicleId: string;
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
};

export function VehicleClusterLayer({ markers }: { markers: MapMarkerPoint[] }) {
  const map = useMap();
  const groupRef = useRef<
    | (L.Layer & {
        clearLayers(): void;
        addLayer(layer: L.Layer): unknown;
      })
    | null
  >(null);

  useEffect(() => {
    const Cluster = (
      L as unknown as {
        markerClusterGroup: (opts?: Record<string, unknown>) => L.Layer & {
          clearLayers(): void;
          addLayer(layer: L.Layer): unknown;
        };
      }
    ).markerClusterGroup;
    const group = Cluster({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      chunkedLoading: true,
    });
    groupRef.current = group;
    map.addLayer(group);
    return () => {
      map.removeLayer(group);
      groupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();
    for (const m of markers) {
      const icon = L.divIcon({
        className: "fleet-marker",
        html: `<div style="width:11px;height:11px;border-radius:9999px;background:#0284c7;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      const mk = L.marker([m.lat, m.lng], { icon });
      mk.bindPopup(`<div style="min-width:140px"><strong>${escapeHtml(m.title)}</strong><br/><span style="font-size:12px;color:#444">${escapeHtml(m.subtitle)}</span></div>`);
      group.addLayer(mk);
    }
  }, [markers]);

  return null;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
