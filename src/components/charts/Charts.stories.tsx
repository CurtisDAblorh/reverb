import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { DEMO_ARTISTS, seedHistory } from "@/lib/mock/catalog";
import { artistGraph, dailyActivity, genreBreakdown, hourlyActivity } from "@/lib/stats";
import type { GenreId } from "@/types/music";
import { GenreDonut } from "./GenreDonut";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { ArtistGraph } from "./ArtistGraph";
import { HourlyRadial } from "./HourlyRadial";

const NOW = Date.UTC(2026, 9, 1);
const history = seedHistory(NOW);
const names = Object.fromEntries(DEMO_ARTISTS.map((a) => [a.id, a.name]));

const meta: Meta = { title: "Charts/D3" };
export default meta;

function DonutDemo() {
  const [selected, setSelected] = useState<GenreId | null>(null);
  return <GenreDonut data={genreBreakdown(history)} selected={selected} onSelect={setSelected} />;
}

export const Donut: StoryObj = {
  render: () => <DonutDemo />,
  parameters: {
    docs: { description: { story: "Hover to grow an arc, click to select a genre." } },
  },
};

export const Heatmap: StoryObj = {
  render: () => <ActivityHeatmap cells={dailyActivity(history, new Date(NOW))} />,
};

export const ForceGraph: StoryObj = {
  render: () => {
    const g = artistGraph(history, names);
    return (
      <div className="max-w-3xl">
        <ArtistGraph nodes={g.nodes} links={g.links} />
      </div>
    );
  },
};

export const HourOfDay: StoryObj = {
  render: () => <HourlyRadial hours={hourlyActivity(history)} />,
};
