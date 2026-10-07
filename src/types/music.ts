export type GenreId =
  "electronic" | "hip-hop" | "lo-fi" | "rock" | "jazz" | "pop" | "ambient" | "r&b";

export type Artist = {
  id: string;
  name: string;
  genres: GenreId[];
  imageUrl?: string;
  /** 0-100 */
  popularity: number;
};

export type Track = {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  album: string;
  genre: GenreId;
  durationMs: number;
  /** Beats per minute, drives the synth and visualiser tempo. */
  bpm: number;
  /** 0-1, drives visualiser intensity. */
  energy: number;
  coverUrl?: string;
  /** Seed used for generative cover art when there is no image. */
  coverSeed: number;
  previewUrl?: string | null;
  source: "demo" | "spotify";
  spotifyUrl?: string;
};

export type Playlist = {
  id: string;
  name: string;
  description: string;
  trackIds: string[];
  createdAt: number;
  coverSeed: number;
};

export type Play = {
  trackId: string;
  genre: GenreId;
  artistId: string;
  playedAt: number;
};

export type RepeatMode = "off" | "all" | "one";
