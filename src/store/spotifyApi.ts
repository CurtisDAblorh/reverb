import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Artist, Track } from "@/types/music";
import { DEMO_ARTISTS, DEMO_TRACKS } from "@/lib/mock/catalog";
import { GENRES } from "@/lib/genres";
import { refreshToken, type SpotifyToken } from "@/lib/spotify/auth";
import {
  mapArtist,
  mapTrack,
  pickImage,
  type SpotifyArtist,
  type SpotifyTrack,
  type SpotifyUser,
} from "@/lib/spotify/mappers";
import { logout, setToken, type AuthState } from "./authSlice";

export type Profile = { name: string; imageUrl?: string; premium: boolean; demo: boolean };

type ApiError = { status: number | "FETCH_ERROR"; message: string };

type ThunkApi = {
  getState: () => unknown;
  dispatch: (action: unknown) => unknown;
};

const tokenOf = (api: ThunkApi) => (api.getState() as { auth: AuthState }).auth.token;

/** Calls the Spotify Web API, refreshing the access token when it has expired. */
async function spotifyFetch<T>(path: string, api: ThunkApi): Promise<T> {
  let token = tokenOf(api) as SpotifyToken;
  if (Date.now() > token.expiresAt) {
    try {
      token = await refreshToken(token);
      api.dispatch(setToken(token));
    } catch {
      api.dispatch(logout());
      throw { status: 401, message: "Your Spotify session expired." } satisfies ApiError;
    }
  }
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token.accessToken}` },
  });
  if (res.status === 401) {
    api.dispatch(logout());
    throw { status: 401, message: "Your Spotify session expired." } satisfies ApiError;
  }
  if (!res.ok)
    throw {
      status: res.status,
      message: `Spotify request failed (${res.status})`,
    } satisfies ApiError;
  return res.json();
}

const asError = (e: unknown): ApiError =>
  typeof e === "object" && e && "status" in e
    ? (e as ApiError)
    : { status: "FETCH_ERROR", message: String(e) };

export function searchDemo(query: string): Track[] {
  const q = query.trim().toLowerCase();
  if (!q) return DEMO_TRACKS;
  return DEMO_TRACKS.filter((t) =>
    [t.title, t.artistName, t.album, GENRES[t.genre].label].some((f) =>
      f.toLowerCase().includes(q),
    ),
  );
}

export const spotifyApi = createApi({
  reducerPath: "spotifyApi",
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: ["Session"],
  endpoints: (build) => ({
    getProfile: build.query<Profile, void>({
      providesTags: ["Session"],
      async queryFn(_arg, api) {
        if (!tokenOf(api)) return { data: { name: "Guest listener", premium: false, demo: true } };
        try {
          const me = await spotifyFetch<SpotifyUser>("/me", api);
          return {
            data: {
              name: me.display_name ?? me.id,
              imageUrl: pickImage(me.images ?? []),
              premium: me.product === "premium",
              demo: false,
            },
          };
        } catch (e) {
          return { error: asError(e) };
        }
      },
    }),
    getTopArtists: build.query<Artist[], void>({
      providesTags: ["Session"],
      async queryFn(_arg, api) {
        if (!tokenOf(api))
          return { data: [...DEMO_ARTISTS].sort((a, b) => b.popularity - a.popularity) };
        try {
          const res = await spotifyFetch<{ items: SpotifyArtist[] }>(
            "/me/top/artists?limit=20",
            api,
          );
          return { data: res.items.map(mapArtist) };
        } catch (e) {
          return { error: asError(e) };
        }
      },
    }),
    getTopTracks: build.query<Track[], void>({
      providesTags: ["Session"],
      async queryFn(_arg, api) {
        if (!tokenOf(api)) {
          const pop = new Map(DEMO_ARTISTS.map((a) => [a.id, a.popularity]));
          return {
            data: [...DEMO_TRACKS]
              .sort(
                (a, b) =>
                  (pop.get(b.artistId) ?? 0) +
                  b.energy * 10 -
                  ((pop.get(a.artistId) ?? 0) + a.energy * 10),
              )
              .slice(0, 12),
          };
        }
        try {
          const [tracks, artists] = await Promise.all([
            spotifyFetch<{ items: SpotifyTrack[] }>("/me/top/tracks?limit=24", api),
            spotifyFetch<{ items: SpotifyArtist[] }>("/me/top/artists?limit=50", api).catch(() => ({
              items: [],
            })),
          ]);
          const genresByArtist = new Map(artists.items.map((a) => [a.id, a.genres ?? []]));
          return {
            data: tracks.items.map((t) => mapTrack(t, genresByArtist.get(t.artists[0]?.id) ?? [])),
          };
        } catch (e) {
          return { error: asError(e) };
        }
      },
    }),
    searchTracks: build.query<Track[], string>({
      providesTags: ["Session"],
      async queryFn(query, api) {
        if (!tokenOf(api) || !query.trim()) return { data: searchDemo(query) };
        try {
          const res = await spotifyFetch<{ tracks: { items: SpotifyTrack[] } }>(
            `/search?type=track&limit=20&q=${encodeURIComponent(query)}`,
            api,
          );
          return { data: res.tracks.items.map((t) => mapTrack(t)) };
        } catch (e) {
          return { error: asError(e) };
        }
      },
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetTopArtistsQuery,
  useGetTopTracksQuery,
  useSearchTracksQuery,
} = spotifyApi;
