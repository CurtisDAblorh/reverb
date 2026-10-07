"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { GENRES } from "@/lib/genres";
import type { ArtistLink, ArtistNode } from "@/lib/stats";

type SimNode = ArtistNode & d3.SimulationNodeDatum;
type SimLink = d3.SimulationLinkDatum<SimNode> & { weight: number };

/**
 * Force-directed graph of top artists. Node size = plays, links = artists
 * played in the same session. Nodes can be dragged; hovering highlights neighbours.
 */
export function ArtistGraph({
  nodes,
  links,
  width = 640,
  height = 380,
}: {
  nodes: ArtistNode[];
  links: ArtistLink[];
  width?: number;
  height?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    if (!nodes.length) return;

    const simNodes: SimNode[] = nodes.map((n) => ({ ...n }));
    const simLinks: SimLink[] = links.map((l) => ({ ...l }));
    const radius = d3
      .scaleSqrt()
      .domain([0, d3.max(nodes, (n) => n.plays) ?? 1])
      .range([8, 34]);
    const maxWeight = d3.max(links, (l) => l.weight) ?? 1;

    const link = svg
      .append("g")
      .attr("stroke", "currentColor")
      .attr("class", "text-muted-foreground")
      .selectAll("line")
      .data(simLinks)
      .join("line")
      .attr("stroke-opacity", (d) => 0.1 + (d.weight / maxWeight) * 0.4)
      .attr("stroke-width", (d) => 1 + (d.weight / maxWeight) * 3);

    const node = svg
      .append("g")
      .selectAll<SVGGElement, SimNode>("g")
      .data(simNodes)
      .join("g")
      .attr("class", "cursor-grab")
      .attr("tabindex", 0)
      .attr("aria-label", (d) => `${d.name}, ${d.plays} plays`);

    node
      .append("circle")
      .attr("r", 0)
      .attr("fill", (d) => GENRES[d.genre].colors[0])
      .attr("fill-opacity", 0.85)
      .attr("stroke", (d) => GENRES[d.genre].colors[1])
      .attr("stroke-width", 2)
      .transition()
      .duration(800)
      .delay((_d, i) => i * 40)
      .attr("r", (d) => radius(d.plays));

    node
      .append("text")
      .text((d) => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => radius(d.plays) + 13)
      .attr(
        "class",
        "fill-foreground stroke-background text-[11px] font-medium pointer-events-none",
      )
      .attr("stroke-width", 3)
      .attr("paint-order", "stroke");

    const neighbours = new Set(simLinks.map((l) => `${l.source}|${l.target}`));
    const connected = (a: SimNode, b: SimNode) =>
      a.id === b.id || neighbours.has(`${a.id}|${b.id}`) || neighbours.has(`${b.id}|${a.id}`);

    node
      .on("mouseenter focus", (_e, d) => {
        node
          .transition()
          .duration(150)
          .style("opacity", (o) => (connected(d, o) ? 1 : 0.2));
        link
          .transition()
          .duration(150)
          .style("opacity", (l) =>
            (l.source as SimNode).id === d.id || (l.target as SimNode).id === d.id ? 1 : 0.05,
          );
      })
      .on("mouseleave blur", () => {
        node.transition().duration(150).style("opacity", 1);
        link.transition().duration(150).style("opacity", 1);
      });

    const sim = d3
      .forceSimulation(simNodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(90)
          .strength((l) => 0.1 + (l.weight / maxWeight) * 0.4),
      )
      .force("charge", d3.forceManyBody().strength(-220))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collide",
        d3.forceCollide<SimNode>().radius((d) => radius(d.plays) + 14),
      )
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.08));

    node.call(
      d3
        .drag<SVGGElement, SimNode>()
        .on("start", (e, d) => {
          if (!e.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (e, d) => {
          d.fx = e.x;
          d.fy = e.y;
        })
        .on("end", (e, d) => {
          if (!e.active) sim.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }),
    );

    sim.on("tick", () => {
      simNodes.forEach((d) => {
        const r = radius(d.plays);
        d.x = Math.max(r, Math.min(width - r, d.x ?? 0));
        d.y = Math.max(r, Math.min(height - r - 14, d.y ?? 0));
      });
      link
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      sim.stop();
    };
  }, [nodes, links, width, height]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full touch-none select-none"
      role="img"
      aria-label="Artist listening graph"
      data-testid="artist-graph"
    />
  );
}
