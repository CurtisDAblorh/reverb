import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { DEMO_TRACKS } from "@/lib/mock/catalog";
import { TrackList } from "./TrackList";
import { TrackCard } from "./TrackCard";
import { LikeButton } from "./LikeButton";

const meta: Meta<typeof TrackList> = {
  title: "Tracks/TrackList",
  component: TrackList,
  args: { tracks: DEMO_TRACKS.slice(0, 8) },
};
export default meta;

type Story = StoryObj<typeof TrackList>;

export const Default: Story = {};

export const Reorderable: Story = {
  args: { onReorder: () => {} },
  parameters: {
    docs: { description: { story: "Drag rows by the grip handle to reorder a playlist." } },
  },
};

export const Empty: Story = { args: { tracks: [], emptyMessage: "This playlist is empty." } };

export const PlayOnClick: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const play = canvas.getByRole("button", { name: `Play ${DEMO_TRACKS[2].title}` });
    await userEvent.click(play);
    await expect(
      canvas.getByRole("button", { name: `Pause ${DEMO_TRACKS[2].title}` }),
    ).toBeInTheDocument();
  },
};

export const Cards: StoryObj<typeof TrackCard> = {
  render: () => (
    <div className="grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
      {DEMO_TRACKS.slice(0, 8).map((t) => (
        <TrackCard key={t.id} track={t} queue={DEMO_TRACKS} />
      ))}
    </div>
  ),
};

export const Like: StoryObj<typeof LikeButton> = {
  render: () => <LikeButton track={DEMO_TRACKS[0]} />,
};
