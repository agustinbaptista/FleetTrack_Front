"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore, canManageVehicles } from "@/store/authStore";
import { vehicleService } from "@/services/vehicleService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/types/api";

export default function NewVehiclePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [driverName, setDriverName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canManageVehicles(user?.role)) router.replace("/vehicles");
  }, [user?.role, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const v = await vehicleService.create({ plate, model, driverName, status: "offline" });
      router.replace(`/vehicles/${v.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear");
    } finally {
      setLoading(false);
    }
  }

  if (!canManageVehicles(user?.role)) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/vehicles" className="text-sm text-sky-600 hover:underline dark:text-sky-400">
          ← Volver a vehículos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Nuevo vehículo</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="plate">Patente</Label>
              <Input id="plate" required value={plate} onChange={(e) => setPlate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input id="model" required value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver">Conductor</Label>
              <Input id="driver" required value={driverName} onChange={(e) => setDriverName(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando…" : "Crear vehículo"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
