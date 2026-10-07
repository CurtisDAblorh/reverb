"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { DayCell } from "@/lib/stats";

const CELL = 14;
const GAP = 3;
const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

/** GitHub-style calendar heatmap of daily plays with a hover tooltip. */
export function ActivityHeatmap({
  cells,
  color = "var(--chart-1)",
}: {
  cells: DayCell[];
  color?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ cell: DayCell; x: number; y: number } | null>(null);
  const weeks = Math.ceil(cells.length / 7);
  const width = 28 + weeks * (CELL + GAP);
  const height = 18 + 7 * (CELL + GAP);

  useEffect(() => {
    if (!ref.current || !cells.length) return;
    const max = d3.max(cells, (c) => c.count) ?? 1;
    const opacity = d3.scaleSqrt().domain([0, max]).range([0.08, 1]);
    const svg = d3.select(ref.current);
    const start = cells[0].date;
    const weekOf = (d: Date) => d3.timeWeek.count(d3.timeWeek.floor(start), d);

    svg
      .selectAll<SVGTextElement, string>("text.day")
      .data(DAYS)
      .join("text")
      .attr("class", "day fill-muted-foreground text-[9px]")
      .attr("x", 0)
      .attr("y", (_d, i) => 18 + i * (CELL + GAP) + CELL - 3)
      .text((d) => d);

    const months = cells.filter((c) => c.date.getDate() === 1 || c === cells[0]);
    svg
      .selectAll<SVGTextElement, DayCell>("text.month")
      .data(months, (d) => d.key)
      .join("text")
      .attr("class", "month fill-muted-foreground text-[10px]")
      .attr("x", (d) => 28 + weekOf(d.date) * (CELL + GAP))
      .attr("y", 10)
      .text((d) => d3.timeFormat("%b")(d.date));

    svg
      .selectAll<SVGRectElement, DayCell>("rect")
      .data(cells, (d) => d.key)
      .join("rect")
      .attr("x", (d) => 28 + weekOf(d.date) * (CELL + GAP))
      .attr("y", (d) => 18 + d.date.getDay() * (CELL + GAP))
      .attr("width", CELL)
      .attr("height", CELL)
      .attr("rx", 3)
      .attr("fill", color)
      .attr("data-count", (d) => d.count)
      .on("mouseenter", (e: MouseEvent, d) => {
        const r = (e.target as SVGRectElement).getBoundingClientRect();
        const host = ref.current!.getBoundingClientRect();
        setHover({ cell: d, x: r.left - host.left + CELL / 2, y: r.top - host.top });
      })
      .on("mouseleave", () => setHover(null))
      .attr("opacity", 0)
      .transition()
      .delay((_d, i) => i * 4)
      .duration(400)
      .attr("opacity", (d) => opacity(d.count));
  }, [cells, color]);

  return (
    <div className="relative overflow-x-auto">
      <svg
        ref={ref}
        width={width}
        height={height}
        role="img"
        aria-label="Daily listening activity"
        data-testid="activity-heatmap"
      />
      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-foreground px-2 py-1 text-xs whitespace-nowrap text-background"
          style={{ left: hover.x, top: hover.y - 6 }}
        >
          <strong>{hover.cell.count} plays</strong> · {d3.timeFormat("%a %d %b")(hover.cell.date)}
        </div>
      )}
    </div>
  );
}
