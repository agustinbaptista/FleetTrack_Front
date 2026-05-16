"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { LiveMap } from "@/components/map/live-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVehiclesStore } from "@/store/vehiclesStore";
import { useLocationsStore } from "@/store/locationsStore";
import { useAlertsStore } from "@/store/alertsStore";
import { useSocketStore } from "@/store/socketStore";
import { trackingService } from "@/services/trackingService";
import { buildMapMarkers } from "@/lib/map-markers";
import { ONLINE_THRESHOLD_MS } from "@/lib/constants";
import { apiBaseUrl } from "@/lib/env";

export default function DashboardPage() {
  const items = useVehiclesStore((s) => s.items);
  const fetchAll = useVehiclesStore((s) => s.fetchAll);
  const byVehicleId = useLocationsStore((s) => s.byVehicleId);
  const lastSeenMs = useLocationsStore((s) => s.lastSeenMs);
  const offlineVehicleIds = useLocationsStore((s) => s.offlineVehicleIds);
  const seedLatest = useLocationsStore((s) => s.seedLatest);
  const alerts = useAlertsStore((s) => s.items);
  const connected = useSocketStore((s) => s.connected);
  const reconnecting = useSocketStore((s) => s.reconnecting);
  const lastEventAt = useSocketStore((s) => s.lastEventAt);
  const transport = useSocketStore((s) => s.transport);

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

  const markers = useMemo(
    () => buildMapMarkers(items, byVehicleId, lastSeenMs, offlineVehicleIds),
    [items, byVehicleId, lastSeenMs, offlineVehicleIds],
  );

  const onlineCount = useMemo(() => {
    const t = Date.now();
    return items.filter((v) => {
      const seen = lastSeenMs[v.id];
      if (!seen) return false;
      if (offlineVehicleIds[v.id]) return false;
      return t - seen <= ONLINE_THRESHOLD_MS;
    }).length;
  }, [items, lastSeenMs, offlineVehicleIds]);

  const avgSpeed = useMemo(() => {
    const speeds = items
      .map((v) => byVehicleId[v.id]?.speed)
      .filter((s): s is number => typeof s === "number" && !Number.isNaN(s));
    if (speeds.length === 0) return 0;
    return speeds.reduce((a, b) => a + b, 0) / speeds.length;
  }, [items, byVehicleId]);

  const activeAlerts = useMemo(() => {
    const t = Date.now();
    return alerts.filter((a) => {
      const ts = new Date(a.createdAt).getTime();
      return t - ts < 10 * 60 * 1000;
    }).length;
  }, [alerts]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Vista operativa estilo flota — datos en vivo
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Vehículos online</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{onlineCount}</p>
            <p className="text-xs text-slate-500">Ventana {ONLINE_THRESHOLD_MS / 1000}s desde última posición</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Alertas recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{activeAlerts}</p>
            <p className="text-xs text-slate-500">Últimos 10 min (cliente)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Velocidad media</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{avgSpeed.toFixed(1)}</p>
            <p className="text-xs text-slate-500">km/h sobre últimos puntos en mapa</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Estado sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Estado de conexión</span>
              <Badge variant={connected ? "success" : reconnecting ? "warning" : "danger"}>
                {connected ? "Conectado" : reconnecting ? "Reconectando" : "Desconectado"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Transporte: {transport ?? "—"} · Último evento: {lastEventAt ? new Date(lastEventAt).toLocaleTimeString() : "—"}
            </p>
            <Link href="/alerts" className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400">
              Ver panel de alertas
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mapa en vivo</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <LiveMap height="min(55vh, 420px)" markers={markers} showGeofence />
        </CardContent>
      </Card>
    </div>
  );
}
