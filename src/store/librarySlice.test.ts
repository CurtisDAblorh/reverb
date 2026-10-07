import reducer, {
  addToPlaylist,
  createPlaylist,
  deletePlaylist,
  initialLibraryState,
  movePlaylistTrack,
  recordPlay,
  removeFromPlaylist,
  renamePlaylist,
  toggleLike,
  MAX_HISTORY,
} from "./librarySlice";
import { DEMO_TRACKS } from "@/lib/mock/catalog";
import type { Track } from "@/types/music";

const empty = { ...initialLibraryState, playlists: [] };
const [a, b, c] = DEMO_TRACKS;
const spotifyTrack: Track = { ...a, id: "sp-123", source: "spotify" };

describe("librarySlice", () => {
  it("creates a playlist with a generated id and a fallback name", () => {
    const s = reducer(empty, createPlaylist({ name: "   " }));
    expect(s.playlists).toHaveLength(1);
    expect(s.playlists[0].id).toMatch(/^pl-/);
    expect(s.playlists[0].name).toBe("Untitled playlist");
  });

  it("adds tracks once, removes and reorders them", () => {
    let s = reducer(empty, createPlaylist({ name: "Mix" }));
    const id = s.playlists[0].id;
    [a, b, c, a].forEach((t) => (s = reducer(s, addToPlaylist({ playlistId: id, track: t }))));
    expect(s.playlists[0].trackIds).toEqual([a.id, b.id, c.id]);

    s = reducer(s, movePlaylistTrack({ playlistId: id, from: 0, to: 2 }));
    expect(s.playlists[0].trackIds).toEqual([b.id, c.id, a.id]);

    s = reducer(s, removeFromPlaylist({ playlistId: id, trackId: c.id }));
    expect(s.playlists[0].trackIds).toEqual([b.id, a.id]);
  });

  it("ignores out-of-range moves", () => {
    let s = reducer(empty, createPlaylist({ name: "Mix" }));
    const id = s.playlists[0].id;
    s = reducer(s, addToPlaylist({ playlistId: id, track: a }));
    expect(reducer(s, movePlaylistTrack({ playlistId: id, from: 0, to: 5 }))).toBe(s);
  });

  it("renames and deletes playlists", () => {
    let s = reducer(empty, createPlaylist({ name: "Old" }));
    const id = s.playlists[0].id;
    s = reducer(s, renamePlaylist({ id, name: "New", description: " desc " }));
    expect(s.playlists[0]).toMatchObject({ name: "New", description: "desc" });
    expect(reducer(s, deletePlaylist(id)).playlists).toHaveLength(0);
  });

  it("toggles likes and caches Spotify tracks", () => {
    let s = reducer(empty, toggleLike(spotifyTrack));
    expect(s.likedIds).toEqual(["sp-123"]);
    expect(s.trackCache["sp-123"]).toBeDefined();
    s = reducer(s, toggleLike(spotifyTrack));
    expect(s.likedIds).toEqual([]);
  });

  it("does not cache demo tracks", () => {
    expect(reducer(empty, toggleLike(a)).trackCache).toEqual({});
  });

  it("caps listening history", () => {
    const full = {
      ...empty,
      history: Array.from({ length: MAX_HISTORY }, () => ({
        trackId: a.id,
        genre: a.genre,
        artistId: a.artistId,
        playedAt: 1,
      })),
    };
    const s = reducer(full, recordPlay({ track: b, playedAt: 2 }));
    expect(s.history).toHaveLength(MAX_HISTORY);
    expect(s.history.at(-1)?.trackId).toBe(b.id);
  });
});
