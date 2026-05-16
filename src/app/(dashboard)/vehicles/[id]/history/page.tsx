"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LiveMap } from "@/components/map/live-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trackingService } from "@/services/trackingService";
import { vehicleService } from "@/services/vehicleService";
import type { Location } from "@/types/location";
import type { Vehicle } from "@/types/vehicle";
import { pathLengthKm } from "@/lib/geo";
import { useReplay } from "@/hooks/useReplay";
import type { MapMarkerPoint } from "@/components/map/vehicle-cluster-layer";

export default function VehicleHistoryPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [history, setHistory] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const [v, h] = await Promise.all([vehicleService.get(id), trackingService.getHistory(id)]);
        if (!cancelled) {
          setVehicle(v);
          setHistory(h);
        }
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

  const pathAsc = useMemo(() => {
    const sorted = [...history].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    return sorted.map((l) => [l.latitude, l.longitude] as [number, number]);
  }, [history]);

  const distKm = useMemo(() => pathLengthKm(pathAsc), [pathAsc]);

  const { progress, pos, playing, play, pause, scrub } = useReplay(pathAsc, 20000);

  const markers: MapMarkerPoint[] = useMemo(() => {
    if (!vehicle || !pos) return [];
    return [
      {
        vehicleId: vehicle.id,
        lat: pos[0],
        lng: pos[1],
        title: `${vehicle.plate} (replay)`,
        subtitle: `Progreso ${(progress * 100).toFixed(0)}%`,
      },
    ];
  }, [vehicle, pos, progress]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[360px] w-full rounded-xl" />
      </div>
    );
  }

  if (err || !vehicle) {
    return (
      <p className="text-sm text-rose-600">
        {err ?? "No encontrado"}{" "}
        <Link href="/vehicles" className="underline">
          Volver
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/vehicles/${id}`} className="text-sm text-sky-600 hover:underline dark:text-sky-400">
          ← {vehicle.plate}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Historial de recorrido</h1>
        <p className="text-sm text-slate-500">
          {history.length} puntos · Distancia estimada {distKm.toFixed(2)} km (Haversine en cliente)
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Replay animado</CardTitle>
            <p className="text-sm font-normal text-slate-500">Interpolación lineal entre puntos del historial</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!playing ? (
              <Button type="button" size="sm" onClick={play} disabled={pathAsc.length < 2}>
                Reproducir
              </Button>
            ) : (
              <Button type="button" variant="secondary" size="sm" onClick={pause}>
                Pausar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(progress * 100)}
              onChange={(e) => scrub(Number(e.target.value) / 100)}
              className="w-full accent-sky-600"
              disabled={pathAsc.length < 2}
            />
          </div>
          <LiveMap
            height="min(55vh, 440px)"
            markers={markers}
            routeLatLngs={pathAsc.length > 1 ? pathAsc : undefined}
            showGeofence
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registro (más reciente primero)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-80 overflow-y-auto text-xs">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white text-slate-500 dark:bg-slate-950">
                <tr>
                  <th className="py-2">Fecha</th>
                  <th className="py-2">Vel.</th>
                  <th className="py-2">Comb.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[...history]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 80)
                  .map((row) => (
                    <tr key={row.id}>
                      <td className="py-1.5 pr-2">{new Date(row.createdAt).toLocaleString()}</td>
                      <td className="py-1.5 pr-2 tabular-nums">{Math.round(row.speed)}</td>
                      <td className="py-1.5 tabular-nums">{Math.round(row.fuelLevel)}%</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
