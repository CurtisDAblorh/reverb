import type { RootState } from "./index";
import type { LibraryState } from "./librarySlice";
import type { PlayerState } from "./playerSlice";
import type { SpotifyToken } from "@/lib/spotify/auth";

const KEY = "reverb.state.v1";

export type PersistedState = {
  library: Omit<LibraryState, "hydrated">;
  player: Pick<PlayerState, "volume" | "shuffle" | "repeat">;
  token: SpotifyToken | null;
};

export function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}

export function savePersisted(state: RootState) {
  const { playlists, likedIds, trackCache, history } = state.library;
  const data: PersistedState = {
    library: { playlists, likedIds, trackCache, history },
    player: {
      volume: state.player.volume,
      shuffle: state.player.shuffle,
      repeat: state.player.repeat,
    },
    token: state.auth.token,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage may be full or blocked (private mode). The app keeps working in memory.
  }
}
