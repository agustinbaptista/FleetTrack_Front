"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950/40">
      <h2 className="text-lg font-semibold text-rose-900 dark:text-rose-100">Algo salió mal</h2>
      <p className="mt-2 text-sm text-rose-800/90 dark:text-rose-200/90">{error.message}</p>
      <Button type="button" variant="secondary" className="mt-4" onClick={() => reset()}>
        Reintentar
      </Button>
    </div>
  );
}
