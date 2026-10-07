"use client";

import { useEffect, useRef } from "react";
import { getAudioEngine, logBin } from "@/lib/audio/engine";
import { cn } from "@/lib/utils";

/** Compact linear spectrum for the player bar, drawn to a canvas for cheap 60fps updates. */
export function SpectrumBars({
  colors,
  className,
  bars = 28,
}: {
  colors: string[];
  className?: string;
  bars?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const data = new Uint8Array(new ArrayBuffer(128));
    let frame = 0;
    const draw = (t: number) => {
      const dpr = window.devicePixelRatio || 1;
      const { clientWidth: w, clientHeight: h } = canvas;
      if (canvas.width !== w * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      getAudioEngine().getFrequencyData(data, t);
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
      ctx.fillStyle = grad;
      const bw = w / bars;
      for (let i = 0; i < bars; i++) {
        const v = data[logBin(i, bars, data.length)] / 255;
        const bh = Math.max(2, v * h);
        ctx.beginPath();
        ctx.roundRect(i * bw + 1, h - bh, bw - 2, bh, 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [colors, bars]);

  return <canvas ref={ref} aria-hidden className={cn("h-8 w-full", className)} />;
}
