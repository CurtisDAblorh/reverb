import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GENRES, GENRE_IDS } from "@/lib/genres";
import { proceduralSpectrum } from "@/lib/audio/engine";
import { DEMO_TRACKS } from "@/lib/mock/catalog";
import type { GenreId } from "@/types/music";
import { Visualizer } from "./Visualizer";
import { CoverArt } from "./CoverArt";

// Stories feed the visualiser a tempo-synced procedural spectrum so it animates without audio.
const sourceFor = (genre: GenreId) => {
  const track = DEMO_TRACKS.find((t) => t.genre === genre);
  return (out: Uint8Array<ArrayBuffer>, t: number) => proceduralSpectrum(out, t, track, true);
};

const meta: Meta<typeof Visualizer> = {
  title: "Visualizer/Visualizer",
  component: Visualizer,
  argTypes: {
    mode: { control: "inline-radio", options: ["bars", "wave", "orbit"] },
  },
  args: {
    mode: "bars",
    colors: GENRES.electronic.colors,
    size: 360,
    source: sourceFor("electronic"),
  },
  render: (args) => <Visualizer {...args} className="w-full max-w-md" />,
};
export default meta;

type Story = StoryObj<typeof Visualizer>;

export const Bars: Story = {};
export const Wave: Story = {
  args: { mode: "wave", colors: GENRES.ambient.colors, source: sourceFor("ambient") },
};
export const Orbit: Story = {
  args: { mode: "orbit", colors: GENRES.jazz.colors, source: sourceFor("jazz") },
};

export const EveryGenre: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {GENRE_IDS.map((g) => (
        <figure key={g} className="text-center">
          <Visualizer
            mode={GENRES[g].mode}
            colors={GENRES[g].colors}
            size={220}
            source={sourceFor(g)}
            className="w-full"
          />
          <figcaption className="text-sm text-muted-foreground">{GENRES[g].label}</figcaption>
        </figure>
      ))}
    </div>
  ),
};

export const GenerativeCovers: StoryObj<typeof CoverArt> = {
  render: () => (
    <div className="grid max-w-3xl grid-cols-4 gap-3 sm:grid-cols-8">
      {DEMO_TRACKS.slice(0, 16).map((t) => (
        <CoverArt key={t.id} seed={t.coverSeed} genre={t.genre} alt={t.album} />
      ))}
    </div>
  ),
};
