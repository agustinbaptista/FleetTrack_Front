"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useAlertsStore } from "@/store/alertsStore";
import { useVehiclesStore } from "@/store/vehiclesStore";
import { alertService } from "@/services/alertService";
import type { VehicleAlert } from "@/types/alert";
import { useUiStore } from "@/store/uiStore";

export default function AlertsPage() {
  const items = useAlertsStore((s) => s.items);
  const vehicles = useVehiclesStore((s) => s.items);
  const fetchVehicles = useVehiclesStore((s) => s.fetchAll);
  const filterId = useUiStore((s) => s.alertsFilterVehicleId);
  const setFilter = useUiStore((s) => s.setAlertsFilterVehicleId);
  const [historical, setHistorical] = useState<VehicleAlert[]>([]);
  const [loadingHist, setLoadingHist] = useState(false);

  useEffect(() => {
    void fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (!filterId) {
      setHistorical([]);
      return;
    }
    let cancelled = false;
    setLoadingHist(true);
    void alertService.listByVehicle(filterId).then((list) => {
      if (!cancelled) setHistorical(list);
      if (!cancelled) setLoadingHist(false);
    });
    return () => {
      cancelled = true;
    };
  }, [filterId]);

  const merged = useMemo(() => {
    const live = filterId ? items.filter((a) => a.vehicleId === filterId) : items;
    const byId = new Map<string, VehicleAlert>();
    for (const a of historical) byId.set(a.id, a);
    for (const a of live) byId.set(a.id, a);
    return [...byId.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [items, historical, filterId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Alertas en tiempo real</h1>
        <p className="text-sm text-slate-500">
          Eventos por vehículo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtro por vehículo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 flex-col gap-1">
            <Label htmlFor="veh">Vehículo</Label>
            <select
              id="veh"
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-900"
              value={filterId ?? ""}
              onChange={(e) => setFilter(e.target.value || null)}
            >
              <option value="">Todos (buffer en vivo)</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate} — {v.driverName}
                </option>
              ))}
            </select>
          </div>
          {loadingHist && <p className="text-xs text-slate-500">Cargando histórico…</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[560px] space-y-2 overflow-y-auto">
            {merged.length === 0 && <p className="text-sm text-slate-500">Sin alertas en el buffer.</p>}
            {merged.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-1 rounded-lg border border-slate-100 p-3 text-sm dark:border-slate-800"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      a.type === "SPEED" ? "danger" : a.type === "GEOFENCE" ? "warning" : "muted"
                    }
                  >
                    {a.type}
                  </Badge>
                  <span className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
                <p>{a.message}</p>
                <p className="text-xs text-slate-400">Vehículo: {a.vehicleId.slice(0, 8)}…</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
