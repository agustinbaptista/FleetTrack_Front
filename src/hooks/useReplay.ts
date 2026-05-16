"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Interpolates along path; `progress` in [0,1]. */
export function useReplay(path: [number, number][], durationMs = 18000) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);

  let pos: [number, number] | null = null;
  if (path.length === 1) {
    pos = path[0]!;
  } else if (path.length > 1) {
    const idx = progress * (path.length - 1);
    const i0 = Math.floor(idx);
    const i1 = Math.min(path.length - 1, i0 + 1);
    const t = idx - i0;
    const [lat0, lon0] = path[i0]!;
    const [lat1, lon1] = path[i1]!;
    pos = [lat0 + (lat1 - lat0) * t, lon0 + (lon1 - lon0) * t];
  }

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing || path.length < 2) return;
    const started = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - started) / durationMs);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPlaying(false);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, durationMs, path.length]);

  const play = useCallback(() => {
    setProgress(0);
    setPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setPlaying(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const scrub = useCallback((p: number) => {
    setPlaying(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setProgress(Math.max(0, Math.min(1, p)));
  }, []);

  return { progress, pos, playing, play, pause, scrub };
}
