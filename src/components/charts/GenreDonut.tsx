"use client";

import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { GENRES } from "@/lib/genres";
import type { GenreSlice } from "@/lib/stats";
import type { GenreId } from "@/types/music";

type Props = {
  data: GenreSlice[];
  selected: GenreId | null;
  onSelect: (genre: GenreId | null) => void;
  size?: number;
};

/** Interactive donut: arcs grow on hover, click to filter the rest of the dashboard. */
export function GenreDonut({ data, selected, onSelect, size = 280 }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const total = useMemo(() => d3.sum(data, (d) => d.count), [data]);

  useEffect(() => {
    if (!ref.current) return;
    const r = size / 2;
    const svg = d3.select(ref.current);
    const g = svg
      .selectAll<SVGGElement, null>("g.root")
      .data([null])
      .join("g")
      .attr("class", "root")
      .attr("transform", `translate(${r},${r})`);

    const pie = d3
      .pie<GenreSlice>()
      .value((d) => d.count)
      .sort(null)
      .padAngle(0.02);
    const arc = d3.arc<d3.PieArcDatum<GenreSlice>>().cornerRadius(6);
    const inner = r * 0.62;
    const outer = (d: d3.PieArcDatum<GenreSlice>, hover = false) =>
      selected === d.data.genre || hover ? r : r - 10;

    const paths = g
      .selectAll<SVGPathElement, d3.PieArcDatum<GenreSlice>>("path")
      .data(pie(data), (d) => d.data.genre)
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("fill", (d) => GENRES[d.data.genre].colors[0])
            .attr("tabindex", 0)
            .attr("role", "button")
            .style("cursor", "pointer")
            .each(function (d) {
              (this as SVGPathElement & { _current?: d3.PieArcDatum<GenreSlice> })._current = {
                ...d,
                endAngle: d.startAngle,
              };
            }),
        (update) => update,
        (exit) => exit.remove(),
      )
      .attr("aria-label", (d) => `${GENRES[d.data.genre].label}: ${d.data.count} plays`)
      .attr("data-genre", (d) => d.data.genre);

    paths
      .transition()
      .duration(700)
      .ease(d3.easeCubicOut)
      .attr("opacity", (d) => (selected && selected !== d.data.genre ? 0.35 : 1))
      .attrTween("d", function (d) {
        const node = this as SVGPathElement & { _current?: d3.PieArcDatum<GenreSlice> };
        const from = node._current ?? d;
        const i = d3.interpolate(from, d);
        const ro = d3.interpolate(r - 10, outer(d));
        node._current = d;
        return (t) => arc.innerRadius(inner).outerRadius(ro(t))(i(t)) ?? "";
      });

    paths
      .on("mouseenter", function (_e, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc.innerRadius(inner).outerRadius(r)(d) ?? "");
      })
      .on("mouseleave", function (_e, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc.innerRadius(inner).outerRadius(outer(d))(d) ?? "");
      })
      .on("click", (_e, d) => onSelect(selected === d.data.genre ? null : d.data.genre))
      .on("keydown", (e: KeyboardEvent, d) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(selected === d.data.genre ? null : d.data.genre);
        }
      });
  }, [data, selected, onSelect, size]);

  const focus = selected ? data.find((d) => d.genre === selected) : data[0];

  return (
    <div className="relative mx-auto" style={{ width: size, maxWidth: "100%" }}>
      <svg
        ref={ref}
        viewBox={`0 0 ${size} ${size}`}
        className="h-auto w-full"
        role="group"
        aria-label="Plays by genre"
        data-testid="genre-donut"
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        {focus ? (
          <>
            <span className="font-display text-3xl font-bold">
              {Math.round(focus.share * 100)}%
            </span>
            <span className="text-sm text-muted-foreground">{GENRES[focus.genre].label}</span>
            <span className="text-xs text-muted-foreground">
              {selected ? `${focus.count} plays` : `of ${total} plays`}
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">No plays yet</span>
        )}
      </div>
    </div>
  );
}
