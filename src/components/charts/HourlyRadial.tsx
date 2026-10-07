"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

/** Radial bar chart of plays by hour of day — a 24h clock face. */
export function HourlyRadial({
  hours,
  size = 240,
  color = "var(--chart-2)",
}: {
  hours: number[];
  size?: number;
  color?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const r = size / 2;
    const inner = r * 0.3;
    const svg = d3.select(ref.current);
    const g = svg
      .selectAll<SVGGElement, null>("g.root")
      .data([null])
      .join("g")
      .attr("class", "root")
      .attr("transform", `translate(${r},${r})`);

    const x = d3
      .scaleBand<number>()
      .domain(d3.range(24))
      .range([0, Math.PI * 2])
      .padding(0.15);
    const y = d3
      .scaleRadial()
      .domain([0, d3.max(hours) || 1])
      .range([inner, r - 18]);
    const arc = d3
      .arc<number>()
      .innerRadius(inner)
      .startAngle((_d, i) => x(i)!)
      .endAngle((_d, i) => x(i)! + x.bandwidth())
      .padRadius(inner)
      .cornerRadius(3);

    g.selectAll<SVGPathElement, number>("path")
      .data(hours)
      .join("path")
      .attr("fill", color)
      .attr("opacity", 0.85)
      .attr("aria-label", (d, i) => `${i}:00 — ${d} plays`)
      .transition()
      .duration(900)
      .delay((_d, i) => i * 25)
      .attrTween("d", function (d, i) {
        const interp = d3.interpolate(inner, y(d));
        return (t) => arc.outerRadius(interp(t))(d, i) ?? "";
      });

    g.selectAll<SVGTextElement, number>("text")
      .data([0, 6, 12, 18])
      .join("text")
      .attr("class", "fill-muted-foreground text-[10px]")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("x", (h) => Math.sin((h / 24) * Math.PI * 2) * (r - 8))
      .attr("y", (h) => -Math.cos((h / 24) * Math.PI * 2) * (r - 8))
      .text((h) => `${h}h`);
  }, [hours, size, color]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-auto w-full max-w-60"
      role="img"
      aria-label="Plays by hour of day"
    />
  );
}
