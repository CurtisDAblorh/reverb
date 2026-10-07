"use client";

import { useEffect, useId, useRef } from "react";
import * as d3 from "d3";
import { getAudioEngine, logBin } from "@/lib/audio/engine";
import type { VisualizerMode } from "@/lib/genres";

type Props = {
  mode: VisualizerMode;
  colors: [string, string, string];
  /** Rendered size in px; the SVG scales to its container. */
  size?: number;
  bins?: number;
  className?: string;
  /** Supplies frequency data. Defaults to the shared audio engine. */
  source?: (out: Uint8Array<ArrayBuffer>, timeMs: number) => void;
};

const defaultSource = (out: Uint8Array<ArrayBuffer>, t: number) => {
  getAudioEngine().getFrequencyData(out, t);
};

/**
 * Genre-aware audio visualiser drawn with D3. Three modes:
 * - bars: radial frequency bars around a pulsing core
 * - wave: layered closed waveforms (radial area curves)
 * - orbit: frequency bands as orbiting particles
 */
export function Visualizer({
  mode,
  colors,
  size = 320,
  bins = 64,
  className,
  source = defaultSource,
}: Props) {
  const ref = useRef<SVGSVGElement>(null);
  // Unique per instance so several visualisers on one page don't share gradients.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    const svg = d3.select(ref.current);
    if (!ref.current) return;
    svg.selectAll("*").remove();

    const c = size / 2;
    const inner = size * 0.18;
    const outer = size * 0.48;
    const data = new Uint8Array(new ArrayBuffer(bins * 2));
    const values = new Array<number>(bins).fill(0);
    const color = d3
      .scaleLinear<string>()
      .domain([0, 0.5, 1])
      .range(colors)
      .interpolate(d3.interpolateHcl);
    const angle = d3
      .scaleLinear()
      .domain([0, bins])
      .range([0, Math.PI * 2]);
    const radius = d3.scaleLinear().domain([0, 255]).range([inner, outer]);

    const defs = svg.append("defs");
    const grad = defs.append("radialGradient").attr("id", `core-${uid}`);
    grad
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colors[0])
      .attr("stop-opacity", 0.9);
    grad
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colors[2])
      .attr("stop-opacity", 0);
    const glow = defs.append("filter").attr("id", `glow-${uid}`);
    glow
      .append("feGaussianBlur")
      .attr("stdDeviation", size / 80)
      .attr("result", "blur");
    const merge = glow.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    const g = svg.append("g").attr("transform", `translate(${c},${c})`);
    const core = g.append("circle").attr("r", inner).attr("fill", `url(#core-${uid})`);
    const layer = g.append("g").attr("filter", `url(#glow-${uid})`);

    const bars = layer
      .selectAll<SVGLineElement, number>("line")
      .data(mode === "bars" ? values : [])
      .join("line")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", Math.max(2, (Math.PI * 2 * inner) / bins / 1.6))
      .attr("stroke", (_d, i) => color(i / bins));

    const waveLine = d3
      .lineRadial<number>()
      .angle((_d, i) => angle(i))
      .radius((d) => radius(d))
      .curve(d3.curveCardinalClosed.tension(0.3));
    const waves = layer
      .selectAll<SVGPathElement, number>("path")
      .data(mode === "wave" ? [0, 1, 2] : [])
      .join("path")
      .attr("fill", (_d, i) => colors[i])
      .attr("fill-opacity", 0.22)
      .attr("stroke", (_d, i) => colors[i])
      .attr("stroke-width", 1.5);

    const dots = layer
      .selectAll<SVGCircleElement, number>("circle")
      .data(mode === "orbit" ? values : [])
      .join("circle")
      .attr("fill", (_d, i) => color(i / bins));

    let frame = 0;
    const render = (t: number) => {
      source(data, t);
      // Mirror a log-scaled spectrum around the circle so it reads symmetrically.
      const half = bins / 2;
      for (let i = 0; i < half; i++) {
        const v = data[logBin(i, half, data.length)];
        values[i] = v;
        values[bins - 1 - i] = v;
      }
      const bass = d3.mean(values.slice(0, 6)) ?? 0;
      core.attr("r", inner * (0.85 + (bass / 255) * 0.45));

      if (mode === "bars") {
        bars.data(values).each(function (d, i) {
          const a = angle(i) - Math.PI / 2;
          const r2 = radius(d);
          d3.select(this)
            .attr("x1", Math.cos(a) * inner)
            .attr("y1", Math.sin(a) * inner)
            .attr("x2", Math.cos(a) * r2)
            .attr("y2", Math.sin(a) * r2);
        });
      } else if (mode === "wave") {
        waves.attr("d", (layerIdx) =>
          waveLine(
            values.map(
              (v, i) => v * (1 - layerIdx * 0.22) + Math.sin(t / 600 + i / 3 + layerIdx) * 12,
            ),
          ),
        );
        waves.attr("transform", (layerIdx) => `rotate(${(t / (80 + layerIdx * 40)) % 360})`);
      } else {
        dots.data(values).each(function (d, i) {
          const a = angle(i) + t / (2400 + (i % 5) * 600);
          const r2 = inner + ((i % 8) / 8) * (outer - inner) * 0.8 + (d / 255) * size * 0.06;
          d3.select(this)
            .attr("cx", Math.cos(a) * r2)
            .attr("cy", Math.sin(a) * r2)
            .attr("r", 1 + (d / 255) * size * 0.022);
        });
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [mode, colors, size, bins, source, uid]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label={`${mode} audio visualiser`}
      data-testid="visualizer"
      data-mode={mode}
    />
  );
}
