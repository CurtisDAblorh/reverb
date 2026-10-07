import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RepeatMode, Track } from "@/types/music";

export type PlayerState = {
  queue: Track[];
  index: number;
  isPlaying: boolean;
  positionMs: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
};

export const initialPlayerState: PlayerState = {
  queue: [],
  index: -1,
  isPlaying: false,
  positionMs: 0,
  volume: 0.7,
  muted: false,
  shuffle: false,
  repeat: "off",
};

/** Random value is generated in `prepare` so the reducer stays pure and testable. */
const withRandom = () => ({ payload: { rand: Math.random() } });

function advance(state: PlayerState, rand: number, auto: boolean) {
  const { queue, index, shuffle, repeat } = state;
  if (!queue.length) return;
  state.positionMs = 0;

  if (auto && repeat === "one") return;

  if (shuffle && queue.length > 1) {
    // Pick any track other than the current one.
    const offset = 1 + Math.floor(rand * (queue.length - 1));
    state.index = (index + offset) % queue.length;
    return;
  }

  if (index < queue.length - 1) {
    state.index = index + 1;
  } else if (repeat === "all" || !auto) {
    state.index = 0;
    if (auto) return;
    // Manual skip past the end wraps but stops unless repeat is on.
    if (repeat === "off") state.isPlaying = false;
  } else {
    state.isPlaying = false;
  }
}

const playerSlice = createSlice({
  name: "player",
  initialState: initialPlayerState,
  reducers: {
    playTrack(state, action: PayloadAction<{ track: Track; queue?: Track[] }>) {
      const { track, queue } = action.payload;
      if (queue?.length) {
        state.queue = queue;
        state.index = Math.max(
          0,
          queue.findIndex((t) => t.id === track.id),
        );
      } else {
        const existing = state.queue.findIndex((t) => t.id === track.id);
        if (existing >= 0) {
          state.index = existing;
        } else {
          state.queue.splice(state.index + 1, 0, track);
          state.index += 1;
        }
      }
      state.positionMs = 0;
      state.isPlaying = true;
    },
    togglePlay(state) {
      if (state.index < 0) return;
      state.isPlaying = !state.isPlaying;
    },
    pause(state) {
      state.isPlaying = false;
    },
    next: {
      reducer(state, action: PayloadAction<{ rand: number }>) {
        advance(state, action.payload.rand, false);
      },
      prepare: withRandom,
    },
    trackEnded: {
      reducer(state, action: PayloadAction<{ rand: number }>) {
        advance(state, action.payload.rand, true);
      },
      prepare: withRandom,
    },
    previous(state) {
      if (!state.queue.length) return;
      if (state.positionMs > 3000 || state.index === 0) {
        state.positionMs = 0;
        return;
      }
      state.index -= 1;
      state.positionMs = 0;
    },
    seek(state, action: PayloadAction<number>) {
      const track = state.queue[state.index];
      if (!track) return;
      state.positionMs = Math.min(Math.max(0, action.payload), track.durationMs);
    },
    tick(state, action: PayloadAction<number>) {
      state.positionMs += action.payload;
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = Math.min(1, Math.max(0, action.payload));
      state.muted = state.volume === 0;
    },
    toggleMute(state) {
      state.muted = !state.muted;
    },
    toggleShuffle(state) {
      state.shuffle = !state.shuffle;
    },
    cycleRepeat(state) {
      state.repeat = state.repeat === "off" ? "all" : state.repeat === "all" ? "one" : "off";
    },
    addToQueue(state, action: PayloadAction<Track>) {
      state.queue.push(action.payload);
      if (state.index < 0) state.index = 0;
    },
    removeFromQueue(state, action: PayloadAction<number>) {
      const i = action.payload;
      if (i === state.index || i < 0 || i >= state.queue.length) return;
      state.queue.splice(i, 1);
      if (i < state.index) state.index -= 1;
    },
    hydratePlayer(
      state,
      action: PayloadAction<Partial<Pick<PlayerState, "volume" | "shuffle" | "repeat">>>,
    ) {
      Object.assign(state, action.payload);
    },
  },
});

export const {
  playTrack,
  togglePlay,
  pause,
  next,
  trackEnded,
  previous,
  seek,
  tick,
  setVolume,
  toggleMute,
  toggleShuffle,
  cycleRepeat,
  addToQueue,
  removeFromQueue,
  hydratePlayer,
} = playerSlice.actions;

export default playerSlice.reducer;
