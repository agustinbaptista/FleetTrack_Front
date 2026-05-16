"use client";

import { useEffect, useMemo, useState } from "react";
import { LiveMap } from "@/components/map/live-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useVehiclesStore } from "@/store/vehiclesStore";
import { useLocationsStore } from "@/store/locationsStore";
import { useUiStore } from "@/store/uiStore";
import { useAlertsStore } from "@/store/alertsStore";
import { trackingService } from "@/services/trackingService";
import { buildMapMarkers } from "@/lib/map-markers";

export default function FleetMapPage() {
  const items = useVehiclesStore((s) => s.items);
  const fetchAll = useVehiclesStore((s) => s.fetchAll);
  const byVehicleId = useLocationsStore((s) => s.byVehicleId);
  const lastSeenMs = useLocationsStore((s) => s.lastSeenMs);
  const offlineVehicleIds = useLocationsStore((s) => s.offlineVehicleIds);
  const seedLatest = useLocationsStore((s) => s.seedLatest);
  const mapFocusVehicleId = useUiStore((s) => s.mapFocusVehicleId);
  const mapShowHeatmap = useUiStore((s) => s.mapShowHeatmap);
  const setMapShowHeatmap = useUiStore((s) => s.setMapShowHeatmap);
  const alerts = useAlertsStore((s) => s.items);

  const [heatPoints, setHeatPoints] = useState<[number, number][]>([]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    void (async () => {
      const chunk = items.slice(0, 20);
      await Promise.all(
        chunk.map(async (v) => {
          const loc = await trackingService.getLatest(v.id);
          if (!cancelled) seedLatest(v.id, loc);
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [items, seedLatest]);

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    void (async () => {
      const pts: [number, number][] = [];
      const chunk = items.slice(0, 15);
      await Promise.all(
        chunk.map(async (v) => {
          const hist = await trackingService.getHistory(v.id);
          if (cancelled) return;
          hist.slice(0, 120).forEach((h) => pts.push([h.latitude, h.longitude]));
        }),
      );
      if (!cancelled) setHeatPoints(pts);
    })();
    return () => {
      cancelled = true;
    };
  }, [items]);

  const markers = useMemo(
    () => buildMapMarkers(items, byVehicleId, lastSeenMs, offlineVehicleIds),
    [items, byVehicleId, lastSeenMs, offlineVehicleIds],
  );

  const alertTypes = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of alerts) {
      m.set(a.type, (m.get(a.type) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [alerts]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mapa en vivo</h1>
          <p className="text-sm text-slate-500">Clustering, geocerca, heatmap opcional por historial reciente.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              id="heatmap"
              type="checkbox"
              checked={mapShowHeatmap}
              onChange={(e) => setMapShowHeatmap(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-sky-600"
            />
            <Label htmlFor="heatmap" className="cursor-pointer text-sm">
              Heatmap
            </Label>
          </div>
          {mapFocusVehicleId && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => useUiStore.getState().setMapFocusVehicleId(null)}
            >
              Quitar foco
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Tipos de alerta (buffer WS)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {alertTypes.length === 0 && <span className="text-xs text-slate-500">Sin datos aún</span>}
          {alertTypes.map(([t, n]) => (
            <Badge key={t} variant="muted">
              {t}: {n}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <LiveMap
        height="min(70vh, 640px)"
        markers={markers}
        showGeofence
        focusVehicleId={mapFocusVehicleId}
        showHeatmap={mapShowHeatmap}
        heatPoints={heatPoints}
      />
    </div>
  );
}
