import type { GenreId } from "@/types/music";

export type VisualizerMode = "bars" | "wave" | "orbit";

export type GenreTheme = {
  id: GenreId;
  label: string;
  /** Three-stop palette used by the backdrop, cover art and visualiser. */
  colors: [string, string, string];
  mode: VisualizerMode;
  /** How hard the backdrop pulses, 0-1. */
  pulse: number;
  /** Synth voicing for demo playback. */
  synth: { wave: OscillatorType; root: number; scale: number[]; swing: number };
  blurb: string;
};

export const GENRES: Record<GenreId, GenreTheme> = {
  electronic: {
    id: "electronic",
    label: "Electronic",
    colors: ["#22d3ee", "#a855f7", "#f43f5e"],
    mode: "bars",
    pulse: 0.9,
    synth: { wave: "sawtooth", root: 110, scale: [0, 3, 7, 10, 12], swing: 0 },
    blurb: "Four-on-the-floor kicks and neon synth stabs.",
  },
  "hip-hop": {
    id: "hip-hop",
    label: "Hip-Hop",
    colors: ["#f59e0b", "#ef4444", "#7c3aed"],
    mode: "bars",
    pulse: 0.8,
    synth: { wave: "square", root: 98, scale: [0, 3, 5, 7, 10], swing: 0.12 },
    blurb: "Boom-bap swing and heavy low end.",
  },
  "lo-fi": {
    id: "lo-fi",
    label: "Lo-Fi",
    colors: ["#fda4af", "#c4b5fd", "#93c5fd"],
    mode: "wave",
    pulse: 0.35,
    synth: { wave: "triangle", root: 130.81, scale: [0, 4, 7, 11, 14], swing: 0.18 },
    blurb: "Dusty chords for late-night focus.",
  },
  rock: {
    id: "rock",
    label: "Rock",
    colors: ["#ef4444", "#f97316", "#fde047"],
    mode: "bars",
    pulse: 1,
    synth: { wave: "sawtooth", root: 82.41, scale: [0, 5, 7, 12], swing: 0 },
    blurb: "Distorted riffs and driving drums.",
  },
  jazz: {
    id: "jazz",
    label: "Jazz",
    colors: ["#fbbf24", "#0ea5e9", "#1e3a8a"],
    mode: "orbit",
    pulse: 0.45,
    synth: { wave: "sine", root: 146.83, scale: [0, 4, 7, 9, 11, 14], swing: 0.22 },
    blurb: "Walking bass lines and smoky extended chords.",
  },
  pop: {
    id: "pop",
    label: "Pop",
    colors: ["#ec4899", "#8b5cf6", "#06b6d4"],
    mode: "orbit",
    pulse: 0.7,
    synth: { wave: "square", root: 164.81, scale: [0, 2, 4, 7, 9], swing: 0 },
    blurb: "Big hooks, bright synths, sing-along choruses.",
  },
  ambient: {
    id: "ambient",
    label: "Ambient",
    colors: ["#34d399", "#22d3ee", "#6366f1"],
    mode: "wave",
    pulse: 0.2,
    synth: { wave: "sine", root: 110, scale: [0, 7, 12, 16, 19], swing: 0 },
    blurb: "Slow-moving textures with endless sustain.",
  },
  "r&b": {
    id: "r&b",
    label: "R&B",
    colors: ["#a855f7", "#ec4899", "#f97316"],
    mode: "orbit",
    pulse: 0.55,
    synth: { wave: "triangle", root: 123.47, scale: [0, 3, 7, 10, 14], swing: 0.1 },
    blurb: "Silky grooves and lush harmonies.",
  },
};

export const GENRE_IDS = Object.keys(GENRES) as GenreId[];

const KEYWORDS: [RegExp, GenreId][] = [
  [/hip ?hop|rap|trap|drill|grime/, "hip-hop"],
  [/lo-?fi|chillhop/, "lo-fi"],
  [/r&b|rnb|soul|neo soul/, "r&b"],
  [/jazz|bebop|swing|bossa/, "jazz"],
  [/ambient|new age|drone|meditation/, "ambient"],
  [/rock|metal|punk|grunge|indie|alt/, "rock"],
  [/house|techno|edm|electro|dubstep|drum and bass|dnb|trance|garage|dance/, "electronic"],
  [/pop|k-pop|j-pop|afrobeats?/, "pop"],
];

/**
 * Maps free-form Spotify genre strings onto one of Reverb's visual themes.
 * Falls back to a stable hash of `fallbackKey` so artists without genres still
 * get a consistent theme.
 */
export function resolveGenre(spotifyGenres: string[] = [], fallbackKey = ""): GenreId {
  for (const raw of spotifyGenres) {
    const g = raw.toLowerCase();
    const match = KEYWORDS.find(([re]) => re.test(g));
    if (match) return match[1];
  }
  return GENRE_IDS[hash(fallbackKey) % GENRE_IDS.length];
}

export function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
