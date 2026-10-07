import reducer, {
  addToQueue,
  cycleRepeat,
  initialPlayerState,
  next,
  playTrack,
  previous,
  removeFromQueue,
  seek,
  setVolume,
  togglePlay,
  trackEnded,
  type PlayerState,
} from "./playerSlice";
import { DEMO_TRACKS } from "@/lib/mock/catalog";

const [a, b, c] = DEMO_TRACKS;
const queue = [a, b, c];

const playing = (overrides: Partial<PlayerState> = {}): PlayerState => ({
  ...reducer(initialPlayerState, playTrack({ track: a, queue })),
  ...overrides,
});

// `next` and `trackEnded` get a random value from `prepare`; pin it for determinism.
const nextWith = (rand: number) => ({ type: next.type, payload: { rand } });
const endedWith = (rand: number) => ({ type: trackEnded.type, payload: { rand } });

describe("playerSlice", () => {
  it("plays a track and replaces the queue", () => {
    const state = reducer(initialPlayerState, playTrack({ track: b, queue }));
    expect(state.queue).toHaveLength(3);
    expect(state.index).toBe(1);
    expect(state.isPlaying).toBe(true);
    expect(state.positionMs).toBe(0);
  });

  it("inserts a track after the current one when no queue is given", () => {
    const start = reducer(initialPlayerState, playTrack({ track: a, queue: [a, c] }));
    const state = reducer(start, playTrack({ track: b }));
    expect(state.queue.map((t) => t.id)).toEqual([a.id, b.id, c.id]);
    expect(state.index).toBe(1);
  });

  it("toggles play only when a track is loaded", () => {
    expect(reducer(initialPlayerState, togglePlay()).isPlaying).toBe(false);
    expect(reducer(playing(), togglePlay()).isPlaying).toBe(false);
  });

  it("advances in order and wraps on manual next, pausing when repeat is off", () => {
    let state = reducer(playing(), nextWith(0));
    expect(state.index).toBe(1);
    state = reducer({ ...state, index: 2 }, nextWith(0));
    expect(state.index).toBe(0);
    expect(state.isPlaying).toBe(false);
  });

  it("stops at the end of the queue when a track ends and repeat is off", () => {
    const state = reducer(playing({ index: 2 }), endedWith(0));
    expect(state.index).toBe(2);
    expect(state.isPlaying).toBe(false);
  });

  it("loops the queue with repeat all and the track with repeat one", () => {
    expect(reducer(playing({ index: 2, repeat: "all" }), endedWith(0))).toMatchObject({
      index: 0,
      isPlaying: true,
    });
    expect(
      reducer(playing({ index: 1, repeat: "one", positionMs: 9000 }), endedWith(0)),
    ).toMatchObject({
      index: 1,
      positionMs: 0,
      isPlaying: true,
    });
  });

  it("never picks the current track when shuffling", () => {
    for (const rand of [0, 0.4, 0.99]) {
      const state = reducer(playing({ shuffle: true, index: 1 }), nextWith(rand));
      expect(state.index).not.toBe(1);
    }
  });

  it("restarts the track on previous after 3 seconds, otherwise goes back", () => {
    expect(reducer(playing({ index: 1, positionMs: 5000 }), previous())).toMatchObject({
      index: 1,
      positionMs: 0,
    });
    expect(reducer(playing({ index: 1, positionMs: 1000 }), previous()).index).toBe(0);
  });

  it("clamps seek and volume", () => {
    expect(reducer(playing(), seek(-50)).positionMs).toBe(0);
    expect(reducer(playing(), seek(1e9)).positionMs).toBe(a.durationMs);
    expect(reducer(playing(), setVolume(2)).volume).toBe(1);
    expect(reducer(playing(), setVolume(0))).toMatchObject({ volume: 0, muted: true });
  });

  it("cycles repeat off → all → one → off", () => {
    let s = initialPlayerState;
    const seen = [];
    for (let i = 0; i < 3; i++) {
      s = reducer(s, cycleRepeat());
      seen.push(s.repeat);
    }
    expect(seen).toEqual(["all", "one", "off"]);
  });

  it("manages the queue without removing the current track", () => {
    let s = reducer(playing({ index: 1 }), addToQueue(DEMO_TRACKS[5]));
    expect(s.queue).toHaveLength(4);
    s = reducer(s, removeFromQueue(1));
    expect(s.queue).toHaveLength(4);
    s = reducer(s, removeFromQueue(0));
    expect(s.queue).toHaveLength(3);
    expect(s.index).toBe(0);
  });
});
