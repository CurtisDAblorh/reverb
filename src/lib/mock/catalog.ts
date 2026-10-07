import type { Artist, GenreId, Play, Playlist, Track } from "@/types/music";
import { hash } from "@/lib/genres";

/**
 * Demo catalog used when no Spotify account is connected. All artists and
 * tracks are fictional. Playback is synthesised in the browser per genre.
 */
type Seed = { artist: string; genre: GenreId; popularity: number; album: string; tracks: string[] };

const SEEDS: Seed[] = [
  {
    artist: "Neon Tide",
    genre: "electronic",
    popularity: 88,
    album: "Afterglow Protocol",
    tracks: ["Chromatic Rush", "Signal Bloom", "Night Drive 404", "Overclock"],
  },
  {
    artist: "Vela Nova",
    genre: "electronic",
    popularity: 74,
    album: "Pulse Garden",
    tracks: ["Prism Rain", "Lucid Loop"],
  },
  {
    artist: "Kilo Verse",
    genre: "hip-hop",
    popularity: 91,
    album: "Concrete Psalms",
    tracks: ["Block Theory", "Gold Teeth Sermon", "Late Checkout"],
  },
  {
    artist: "Mara Quinn",
    genre: "hip-hop",
    popularity: 69,
    album: "Paper Crowns",
    tracks: ["Counterweight", "Cityglass"],
  },
  {
    artist: "Saffron Tapes",
    genre: "lo-fi",
    popularity: 77,
    album: "Rainy Windows",
    tracks: ["Library Hours", "Matcha at 2am", "Soft Static"],
  },
  {
    artist: "June Okafor",
    genre: "lo-fi",
    popularity: 58,
    album: "Sketchbook",
    tracks: ["Pencil Shavings", "Bus Window"],
  },
  {
    artist: "The Velvet Static",
    genre: "rock",
    popularity: 83,
    album: "Feedback Hymns",
    tracks: ["Amplifier Heart", "Burn the Setlist", "Gravel Road"],
  },
  {
    artist: "Hollow Pines",
    genre: "rock",
    popularity: 61,
    album: "Timberline",
    tracks: ["Wildfire Season", "Echo Canyon"],
  },
  {
    artist: "Ezra Blue Quartet",
    genre: "jazz",
    popularity: 64,
    album: "Blue Hour Sessions",
    tracks: ["Smoke Rings", "Midnight Modal", "Brass & Velvet"],
  },
  {
    artist: "Lena Marquez",
    genre: "jazz",
    popularity: 55,
    album: "Rooftop Standards",
    tracks: ["Bossa for Rain", "Uptown Swing"],
  },
  {
    artist: "Aria Sol",
    genre: "pop",
    popularity: 95,
    album: "Technicolor",
    tracks: ["Glitter Static", "Heartbeat Satellite", "Summer in Stereo", "Paper Planes"],
  },
  {
    artist: "Juno Park",
    genre: "pop",
    popularity: 79,
    album: "Sugar Rush",
    tracks: ["Bubblegum Galaxy", "Polaroid"],
  },
  {
    artist: "Driftwood Choir",
    genre: "ambient",
    popularity: 52,
    album: "Tidal Memory",
    tracks: ["Low Tide", "Aurora Field", "Glacier Breath"],
  },
  {
    artist: "Oslo Haze",
    genre: "ambient",
    popularity: 47,
    album: "Weightless",
    tracks: ["Cloud Archive", "Sleep Cycle"],
  },
  {
    artist: "Amara Rose",
    genre: "r&b",
    popularity: 86,
    album: "Velvet Hours",
    tracks: ["Slow Burn", "Satin Sheets", "After Midnight"],
  },
  {
    artist: "Theo Lux",
    genre: "r&b",
    popularity: 72,
    album: "Golden Hour",
    tracks: ["Honey Drip", "Afterparty"],
  },
];

const BPM: Record<GenreId, [number, number]> = {
  electronic: [122, 132],
  "hip-hop": [84, 96],
  "lo-fi": [70, 86],
  rock: [118, 150],
  jazz: [96, 140],
  pop: [100, 124],
  ambient: [60, 72],
  "r&b": [68, 92],
};

const ENERGY: Record<GenreId, [number, number]> = {
  electronic: [0.75, 0.95],
  "hip-hop": [0.6, 0.85],
  "lo-fi": [0.2, 0.4],
  rock: [0.8, 1],
  jazz: [0.35, 0.6],
  pop: [0.65, 0.9],
  ambient: [0.05, 0.25],
  "r&b": [0.4, 0.65],
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const lerp = ([a, b]: [number, number], t: number) => a + (b - a) * t;

export const DEMO_ARTISTS: Artist[] = SEEDS.map((s) => ({
  id: `demo-artist-${slug(s.artist)}`,
  name: s.artist,
  genres: [s.genre],
  popularity: s.popularity,
}));

export const DEMO_TRACKS: Track[] = SEEDS.flatMap((s) =>
  s.tracks.map((title, i) => {
    const seed = hash(`${s.artist}:${title}`);
    const t = (seed % 1000) / 1000;
    return {
      id: `demo-${slug(s.artist)}-${slug(title)}`,
      title,
      artistId: `demo-artist-${slug(s.artist)}`,
      artistName: s.artist,
      album: s.album,
      genre: s.genre,
      durationMs: Math.round((150 + ((seed >>> 4) % 110)) * 1000),
      bpm: Math.round(lerp(BPM[s.genre], t)),
      energy: Number(lerp(ENERGY[s.genre], (t + i * 0.13) % 1).toFixed(2)),
      coverSeed: hash(s.album),
      source: "demo" as const,
    };
  }),
);

export const DEMO_TRACKS_BY_ID: Record<string, Track> = Object.fromEntries(
  DEMO_TRACKS.map((t) => [t.id, t]),
);

export const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: "pl-focus",
    name: "Deep Focus",
    description: "Lo-fi and ambient for heads-down work.",
    trackIds: DEMO_TRACKS.filter((t) => t.genre === "lo-fi" || t.genre === "ambient").map(
      (t) => t.id,
    ),
    createdAt: Date.UTC(2026, 0, 12),
    coverSeed: hash("Deep Focus"),
  },
  {
    id: "pl-hype",
    name: "Hype Mode",
    description: "High energy only.",
    trackIds: DEMO_TRACKS.filter((t) => t.energy >= 0.8).map((t) => t.id),
    createdAt: Date.UTC(2026, 2, 3),
    coverSeed: hash("Hype Mode"),
  },
];

/** Deterministic pseudo-random generator so seeded history is stable across renders. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** About twelve weeks of plausible listening history, weighted by artist popularity. */
export function seedHistory(now: number, days = 84): Play[] {
  const rand = mulberry32(7);
  const weighted = DEMO_TRACKS.flatMap((t) => {
    const pop = DEMO_ARTISTS.find((a) => a.id === t.artistId)?.popularity ?? 50;
    return Array.from({ length: Math.ceil(pop / 20) }, () => t);
  });
  const plays: Play[] = [];
  const dayMs = 86_400_000;
  for (let d = days; d >= 1; d--) {
    const weekend = new Date(now - d * dayMs).getDay() % 6 === 0;
    const count = Math.floor(rand() * (weekend ? 14 : 9));
    for (let i = 0; i < count; i++) {
      const track = weighted[Math.floor(rand() * weighted.length)];
      const hour = 8 + Math.floor(rand() * 15);
      plays.push({
        trackId: track.id,
        genre: track.genre,
        artistId: track.artistId,
        playedAt: now - d * dayMs + hour * 3_600_000,
      });
    }
  }
  return plays;
}
