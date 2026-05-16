"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LiveMap } from "@/components/map/live-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore, canDeleteVehicle } from "@/store/authStore";
import { vehicleService } from "@/services/vehicleService";
import { trackingService } from "@/services/trackingService";
import { alertService } from "@/services/alertService";
import type { Vehicle } from "@/types/vehicle";
import type { Location } from "@/types/location";
import type { VehicleAlert } from "@/types/alert";
import { useLocationsStore } from "@/store/locationsStore";
import { ONLINE_THRESHOLD_MS } from "@/lib/constants";
import { buildMapMarkers } from "@/lib/map-markers";

export default function VehicleDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const canDel = canDeleteVehicle(user?.role);
  const byVehicleId = useLocationsStore((s) => s.byVehicleId);
  const lastSeenMs = useLocationsStore((s) => s.lastSeenMs);
  const offlineVehicleIds = useLocationsStore((s) => s.offlineVehicleIds);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [history, setHistory] = useState<Location[]>([]);
  const [alerts, setAlerts] = useState<VehicleAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [v, h, a, latest] = await Promise.all([
          vehicleService.get(id),
          trackingService.getHistory(id),
          alertService.listByVehicle(id),
          trackingService.getLatest(id),
        ]);
        if (cancelled) return;
        setVehicle(v);
        setHistory(h);
        setAlerts(a);
        if (latest) useLocationsStore.getState().seedLatest(id, latest);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const liveLoc = byVehicleId[id];
  const seen = lastSeenMs[id];
  const t = Date.now();
  const offline =
    Boolean(offlineVehicleIds[id]) || !seen || t - seen > ONLINE_THRESHOLD_MS;

  const markers = useMemo(() => {
    if (!vehicle) return [];
    return buildMapMarkers([vehicle], byVehicleId, lastSeenMs, offlineVehicleIds);
  }, [vehicle, byVehicleId, lastSeenMs, offlineVehicleIds]);

  const route = useMemo(() => {
    const sorted = [...history].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    return sorted.map((l) => [l.latitude, l.longitude] as [number, number]);
  }, [history]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[320px] w-full rounded-xl" />
      </div>
    );
  }

  if (err || !vehicle) {
    return (
      <p className="text-sm text-rose-600">
        {err ?? "No encontrado"}{" "}
        <Link href="/vehicles" className="text-sky-600 underline">
          Volver
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/vehicles" className="text-sm text-sky-600 hover:underline dark:text-sky-400">
            ← Flota
          </Link>
          <h1 className="text-2xl font-semibold">{vehicle.plate}</h1>
          <p className="text-sm text-slate-500">
            {vehicle.model} · {vehicle.driverName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={offline ? "muted" : "success"}>{offline ? "Offline" : "Online"}</Badge>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/vehicles/${id}/history`)}
          >
            Historial / Replay
          </Button>
          {canDel && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={deleting}
              onClick={async () => {
                if (!window.confirm("¿Eliminar este vehículo de forma permanente?")) return;
                setDeleting(true);
                try {
                  await vehicleService.remove(id);
                  router.replace("/vehicles");
                } catch (e) {
                  alert(e instanceof Error ? e.message : "Error al eliminar");
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {deleting ? "Eliminando…" : "Eliminar"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mapa individual</CardTitle>
            <p className="text-sm font-normal text-slate-500">Últimos puntos y recorrido reciente</p>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <LiveMap
              height="min(50vh, 400px)"
              markers={markers}
              routeLatLngs={route.length > 1 ? route : undefined}
              showGeofence
            />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Telemetría</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Velocidad" value={liveLoc ? `${Math.round(liveLoc.speed)} km/h` : "—"} />
              <Row label="Combustible" value={liveLoc ? `${Math.round(liveLoc.fuelLevel)}%` : "—"} />
              <Row label="Motor" value={liveLoc ? (liveLoc.engineStatus ? "Encendido" : "Apagado") : "—"} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Alertas recientes</CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 space-y-2 overflow-y-auto text-xs">
              {alerts.slice(0, 30).map((a) => (
                <div key={a.id} className="rounded border border-slate-100 p-2 dark:border-slate-800">
                  <Badge variant="warning" className="mb-1">
                    {a.type}
                  </Badge>
                  <p>{a.message}</p>
                  <p className="text-slate-400">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
              ))}
              {alerts.length === 0 && <p className="text-slate-500">Sin alertas registradas.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 border-b border-slate-100 py-1 last:border-0 dark:border-slate-800">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
