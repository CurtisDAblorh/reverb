import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithStore } from "@/test/render";
import { DEMO_TRACKS } from "@/lib/mock/catalog";
import { TrackList } from "./tracks/TrackList";
import { LikeButton } from "./tracks/LikeButton";
import { PlayerControls } from "./player/PlayerControls";
import { CoverArt } from "./visualizer/CoverArt";
import { GenreDonut } from "./charts/GenreDonut";

jest.mock("sonner", () => ({
  toast: Object.assign(jest.fn(), { success: jest.fn(), info: jest.fn() }),
}));

const tracks = DEMO_TRACKS.slice(0, 3);

describe("TrackList", () => {
  it("plays a track and sets the list as the queue", async () => {
    const { store } = renderWithStore(<TrackList tracks={tracks} />);
    await userEvent.click(screen.getByRole("button", { name: `Play ${tracks[1].title}` }));
    const { player } = store.getState();
    expect(player.isPlaying).toBe(true);
    expect(player.queue.map((t) => t.id)).toEqual(tracks.map((t) => t.id));
    expect(player.index).toBe(1);
  });

  it("shows an empty state", () => {
    renderWithStore(<TrackList tracks={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});

describe("LikeButton", () => {
  it("toggles the liked state", async () => {
    const { store } = renderWithStore(<LikeButton track={tracks[0]} />);
    const button = screen.getByRole("button", { name: `Like ${tracks[0].title}` });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    expect(store.getState().library.likedIds).toContain(tracks[0].id);
    expect(screen.getByRole("button", { name: `Unlike ${tracks[0].title}` })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

describe("PlayerControls", () => {
  it("is disabled until something is queued", () => {
    renderWithStore(<PlayerControls />);
    expect(screen.getByRole("button", { name: "Play" })).toBeDisabled();
  });

  it("toggles playback, shuffle and repeat", async () => {
    const { store } = renderWithStore(<PlayerControls />, {
      player: {
        queue: tracks,
        index: 0,
        isPlaying: false,
        positionMs: 0,
        volume: 1,
        muted: false,
        shuffle: false,
        repeat: "off",
      },
    });
    await userEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(store.getState().player.isPlaying).toBe(true);
    await userEvent.click(screen.getByRole("button", { name: "Shuffle" }));
    expect(store.getState().player.shuffle).toBe(true);
    await userEvent.click(screen.getByRole("button", { name: "Repeat off" }));
    expect(store.getState().player.repeat).toBe("all");
    await userEvent.click(screen.getByRole("button", { name: "Next track" }));
    expect(store.getState().player.index).not.toBe(0);
  });
});

describe("CoverArt", () => {
  it("renders an image when a URL is provided", () => {
    renderWithStore(<CoverArt seed={1} genre="pop" src="https://example.com/a.jpg" alt="Album" />);
    expect(screen.getByRole("img", { name: "Album" })).toHaveAttribute(
      "src",
      "https://example.com/a.jpg",
    );
  });

  it("renders deterministic generative art otherwise", () => {
    const { container, rerender } = renderWithStore(<CoverArt seed={42} genre="jazz" alt="Gen" />);
    const first = container.innerHTML.replace(/id="[^"]+"|url\(#[^)]+\)/g, "");
    rerender(<CoverArt seed={42} genre="jazz" alt="Gen" />);
    expect(container.innerHTML.replace(/id="[^"]+"|url\(#[^)]+\)/g, "")).toBe(first);
    expect(container.querySelectorAll("rect[height^='-']")).toHaveLength(0);
  });
});

describe("GenreDonut", () => {
  it("renders an arc per genre and selects on click", async () => {
    const onSelect = jest.fn();
    renderWithStore(
      <GenreDonut
        data={[
          { genre: "pop", count: 3, share: 0.75 },
          { genre: "rock", count: 1, share: 0.25 },
        ]}
        selected={null}
        onSelect={onSelect}
      />,
    );
    const arcs = screen.getAllByRole("button");
    expect(arcs).toHaveLength(2);
    expect(screen.getByText("75%")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Rock: 1 plays" }));
    expect(onSelect).toHaveBeenCalledWith("rock");
  });
});
