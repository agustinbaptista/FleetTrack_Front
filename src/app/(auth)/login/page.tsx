import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-950">
          <Skeleton className="mb-4 h-8 w-48" />
          <Skeleton className="h-10 w-full" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
