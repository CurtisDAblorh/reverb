import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { Play, Playlist, Track } from "@/types/music";
import { DEFAULT_PLAYLISTS } from "@/lib/mock/catalog";
import { hash } from "@/lib/genres";

export const MAX_HISTORY = 5000;

export type LibraryState = {
  playlists: Playlist[];
  likedIds: string[];
  /** Tracks referenced by playlists/likes that are not in the demo catalog (e.g. Spotify). */
  trackCache: Record<string, Track>;
  history: Play[];
  hydrated: boolean;
};

export const initialLibraryState: LibraryState = {
  playlists: DEFAULT_PLAYLISTS,
  likedIds: [],
  trackCache: {},
  history: [],
  hydrated: false,
};

const cache = (state: LibraryState, track: Track) => {
  if (track.source === "spotify") state.trackCache[track.id] = track;
};

const librarySlice = createSlice({
  name: "library",
  initialState: initialLibraryState,
  reducers: {
    hydrateLibrary(state, action: PayloadAction<Partial<Omit<LibraryState, "hydrated">>>) {
      Object.assign(state, action.payload, { hydrated: true });
    },
    createPlaylist: {
      reducer(state, action: PayloadAction<Playlist>) {
        state.playlists.unshift(action.payload);
      },
      prepare({ name, description = "" }: { name: string; description?: string }) {
        const id = `pl-${nanoid(8)}`;
        return {
          payload: {
            id,
            name: name.trim() || "Untitled playlist",
            description: description.trim(),
            trackIds: [],
            createdAt: Date.now(),
            coverSeed: hash(id),
          },
        };
      },
    },
    renamePlaylist(
      state,
      action: PayloadAction<{ id: string; name: string; description?: string }>,
    ) {
      const pl = state.playlists.find((p) => p.id === action.payload.id);
      if (!pl) return;
      pl.name = action.payload.name.trim() || pl.name;
      if (action.payload.description !== undefined)
        pl.description = action.payload.description.trim();
    },
    deletePlaylist(state, action: PayloadAction<string>) {
      state.playlists = state.playlists.filter((p) => p.id !== action.payload);
    },
    addToPlaylist(state, action: PayloadAction<{ playlistId: string; track: Track }>) {
      const pl = state.playlists.find((p) => p.id === action.payload.playlistId);
      if (!pl || pl.trackIds.includes(action.payload.track.id)) return;
      pl.trackIds.push(action.payload.track.id);
      cache(state, action.payload.track);
    },
    removeFromPlaylist(state, action: PayloadAction<{ playlistId: string; trackId: string }>) {
      const pl = state.playlists.find((p) => p.id === action.payload.playlistId);
      if (pl) pl.trackIds = pl.trackIds.filter((id) => id !== action.payload.trackId);
    },
    movePlaylistTrack(
      state,
      action: PayloadAction<{ playlistId: string; from: number; to: number }>,
    ) {
      const { playlistId, from, to } = action.payload;
      const pl = state.playlists.find((p) => p.id === playlistId);
      if (
        !pl ||
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= pl.trackIds.length ||
        to >= pl.trackIds.length
      )
        return;
      const [moved] = pl.trackIds.splice(from, 1);
      pl.trackIds.splice(to, 0, moved);
    },
    toggleLike(state, action: PayloadAction<Track>) {
      const id = action.payload.id;
      if (state.likedIds.includes(id)) {
        state.likedIds = state.likedIds.filter((x) => x !== id);
      } else {
        state.likedIds.unshift(id);
        cache(state, action.payload);
      }
    },
    recordPlay(state, action: PayloadAction<{ track: Track; playedAt: number }>) {
      const { track, playedAt } = action.payload;
      state.history.push({
        trackId: track.id,
        genre: track.genre,
        artistId: track.artistId,
        playedAt,
      });
      if (state.history.length > MAX_HISTORY)
        state.history.splice(0, state.history.length - MAX_HISTORY);
      cache(state, track);
    },
    cacheTracks(state, action: PayloadAction<Track[]>) {
      action.payload.forEach((t) => cache(state, t));
    },
  },
});

export const {
  hydrateLibrary,
  createPlaylist,
  renamePlaylist,
  deletePlaylist,
  addToPlaylist,
  removeFromPlaylist,
  movePlaylistTrack,
  toggleLike,
  recordPlay,
  cacheTracks,
} = librarySlice.actions;

export default librarySlice.reducer;
