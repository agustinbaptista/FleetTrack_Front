"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RootError({
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
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">Error de aplicación</h1>
      <p className="max-w-md text-center text-sm text-slate-600 dark:text-slate-400">{error.message}</p>
      <Button type="button" variant="secondary" onClick={() => reset()}>
        Reintentar
      </Button>
    </div>
  );
}
