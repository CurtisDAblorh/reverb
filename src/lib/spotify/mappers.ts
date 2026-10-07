import type { Artist, Track } from "@/types/music";
import { hash, resolveGenre } from "@/lib/genres";

/** Minimal shapes of the Spotify Web API objects Reverb reads. */
export type SpotifyImage = { url: string; width: number | null; height: number | null };

export type SpotifyArtist = {
  id: string;
  name: string;
  genres?: string[];
  popularity?: number;
  images?: SpotifyImage[];
};

export type SpotifyTrack = {
  id: string;
  name: string;
  duration_ms: number;
  popularity?: number;
  preview_url?: string | null;
  external_urls?: { spotify?: string };
  artists: { id: string; name: string }[];
  album: { name: string; images: SpotifyImage[] };
};

export type SpotifyUser = {
  id: string;
  display_name: string | null;
  images?: SpotifyImage[];
  product?: string;
};

/**
 * Spotify no longer exposes audio features (tempo, energy) to new apps, so they
 * are estimated from the genre and a stable hash of the track id.
 */
export function mapTrack(t: SpotifyTrack, genreHint: string[] = []): Track {
  const genre = resolveGenre(genreHint, t.artists[0]?.id ?? t.id);
  const h = hash(t.id);
  return {
    id: `sp-${t.id}`,
    title: t.name,
    artistId: `sp-${t.artists[0]?.id ?? "unknown"}`,
    artistName: t.artists.map((a) => a.name).join(", "),
    album: t.album.name,
    genre,
    // Full playback needs Premium + the Web Playback SDK; Reverb plays the 30s preview.
    durationMs: t.preview_url ? 30_000 : t.duration_ms,
    bpm: 70 + (h % 70),
    energy: Number((((t.popularity ?? 50) / 100) * 0.6 + ((h >>> 8) % 40) / 100).toFixed(2)),
    coverUrl: pickImage(t.album.images),
    coverSeed: hash(t.album.name),
    previewUrl: t.preview_url ?? null,
    source: "spotify",
    spotifyUrl: t.external_urls?.spotify,
  };
}

export function mapArtist(a: SpotifyArtist): Artist {
  return {
    id: `sp-${a.id}`,
    name: a.name,
    genres: [resolveGenre(a.genres, a.id)],
    imageUrl: pickImage(a.images ?? []),
    popularity: a.popularity ?? 50,
  };
}

/** Picks the smallest image that is still at least 300px wide. */
export function pickImage(images: SpotifyImage[]): string | undefined {
  if (!images.length) return undefined;
  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  return (sorted.find((i) => (i.width ?? 0) >= 300) ?? sorted[sorted.length - 1]).url;
}
