import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "muted";
  className?: string;
};

const map: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  warning: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  danger: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-100",
  muted: "bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        map[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
