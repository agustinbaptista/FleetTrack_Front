"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import "leaflet.heat";

export function HeatmapLayer({ points, enabled }: { points: [number, number][]; enabled: boolean }) {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!enabled || points.length === 0) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }
    const heatLayer = (
      L as unknown as {
        heatLayer: (
          latlngs: [number, number][],
          opts: { radius?: number; blur?: number; maxZoom?: number; max?: number },
        ) => L.Layer;
      }
    ).heatLayer(points, { radius: 22, blur: 18, maxZoom: 17, max: 1 });
    if (layerRef.current) map.removeLayer(layerRef.current);
    layerRef.current = heatLayer;
    map.addLayer(heatLayer);
    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, points, enabled]);

  return null;
}
