"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { LiveMapInnerProps } from "@/components/map/live-map-inner";

const LiveMapInner = dynamic(
  () => import("@/components/map/live-map-inner").then((m) => m.LiveMapInner),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full min-h-[280px] w-full rounded-xl" />,
  },
);

export function LiveMap(props: LiveMapInnerProps) {
  return <LiveMapInner {...props} />;
}
