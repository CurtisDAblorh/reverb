import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlayerBar } from "./PlayerBar";
import { PlayerControls } from "./PlayerControls";

const meta: Meta<typeof PlayerBar> = {
  title: "Player/PlayerBar",
  component: PlayerBar,
};
export default meta;

export const Docked: StoryObj<typeof PlayerBar> = {};

export const Empty: StoryObj<typeof PlayerBar> = { parameters: { playing: false } };

export const Controls: StoryObj<typeof PlayerControls> = {
  render: () => (
    <div className="grid gap-10">
      <PlayerControls />
      <PlayerControls size="lg" />
    </div>
  ),
};
