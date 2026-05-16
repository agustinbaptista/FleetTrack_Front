"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, MapPin, History, Eye } from "lucide-react";
import { useVehiclesStore } from "@/store/vehiclesStore";
import { useLocationsStore } from "@/store/locationsStore";
import { useAuthStore, canManageVehicles } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ONLINE_THRESHOLD_MS } from "@/lib/constants";

export default function VehiclesPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const items = useVehiclesStore((s) => s.items);
  const loading = useVehiclesStore((s) => s.loading);
  const error = useVehiclesStore((s) => s.error);
  const fetchAll = useVehiclesStore((s) => s.fetchAll);
  const byVehicleId = useLocationsStore((s) => s.byVehicleId);
  const lastSeenMs = useLocationsStore((s) => s.lastSeenMs);
  const offlineVehicleIds = useLocationsStore((s) => s.offlineVehicleIds);
  const setMapFocus = useUiStore((s) => s.setMapFocusVehicleId);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const canCreate = canManageVehicles(user?.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vehículos</h1>
          <p className="text-sm text-slate-500">Patente, conductor, telemetría en vivo y acciones rápidas.</p>
        </div>
        {canCreate && (
          <Button type="button" onClick={() => router.push("/vehicles/new")} className="gap-2 self-start">
            <Plus className="h-4 w-4" />
            Nuevo vehículo
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flota</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <SkeletonTable rows={6} />}
          {error && (
            <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
              {error}
            </p>
          )}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
                  <tr>
                    <th className="pb-3 pr-4 font-medium">Patente</th>
                    <th className="pb-3 pr-4 font-medium">Conductor</th>
                    <th className="pb-3 pr-4 font-medium">Velocidad</th>
                    <th className="pb-3 pr-4 font-medium">Combustible</th>
                    <th className="pb-3 pr-4 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((v) => {
                    const loc = byVehicleId[v.id];
                    const seen = lastSeenMs[v.id];
                    const t = Date.now();
                    const offline =
                      Boolean(offlineVehicleIds[v.id]) ||
                      !seen ||
                      t - seen > ONLINE_THRESHOLD_MS;
                    const statusLabel = offline ? "offline" : "online";
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                        <td className="py-3 pr-4 font-medium">{v.plate}</td>
                        <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{v.driverName}</td>
                        <td className="py-3 pr-4 tabular-nums">
                          {loc ? `${Math.round(loc.speed)} km/h` : "—"}
                        </td>
                        <td className="py-3 pr-4 tabular-nums">
                          {loc ? `${Math.round(loc.fuelLevel)}%` : "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={offline ? "muted" : "success"}>{statusLabel}</Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="gap-1"
                              onClick={() => router.push(`/vehicles/${v.id}`)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Detalle
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="gap-1"
                              onClick={() => router.push(`/vehicles/${v.id}/history`)}
                            >
                              <History className="h-3.5 w-3.5" />
                              Historial
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              onClick={() => {
                                setMapFocus(v.id);
                                router.push("/map");
                              }}
                            >
                              <MapPin className="h-3.5 w-3.5" />
                              Mapa
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {items.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">No hay vehículos registrados.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
