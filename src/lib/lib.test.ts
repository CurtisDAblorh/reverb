import { formatDuration, formatTotalDuration, greeting, pluralize } from "./format";
import { GENRE_IDS, hash, resolveGenre } from "./genres";
import { artistGraph, dailyActivity, genreBreakdown, hourlyActivity, streak } from "./stats";
import { base64UrlEncode, randomString } from "./spotify/auth";
import { mapTrack, pickImage, type SpotifyTrack } from "./spotify/mappers";
import { logBin, proceduralSpectrum } from "./audio/engine";
import { DEMO_TRACKS, seedHistory } from "./mock/catalog";
import type { Play } from "@/types/music";

describe("format", () => {
  it("formats durations", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(65_400)).toBe("1:05");
    expect(formatTotalDuration(30 * 60_000)).toBe("30 min");
    expect(formatTotalDuration(135 * 60_000)).toBe("2 hr 15 min");
  });

  it("greets by time of day and pluralises", () => {
    expect([3, 9, 14, 20].map(greeting)).toEqual([
      "Up late",
      "Good morning",
      "Good afternoon",
      "Good evening",
    ]);
    expect(pluralize(1, "track")).toBe("1 track");
    expect(pluralize(2, "track")).toBe("2 tracks");
  });
});

describe("genres", () => {
  it("maps Spotify genre strings onto themes", () => {
    expect(resolveGenre(["uk drill"])).toBe("hip-hop");
    expect(resolveGenre(["deep house"])).toBe("electronic");
    expect(resolveGenre(["neo soul"])).toBe("r&b");
    expect(resolveGenre(["lo-fi beats"])).toBe("lo-fi");
  });

  it("falls back to a stable hash-based genre", () => {
    const g = resolveGenre([], "artist-1");
    expect(GENRE_IDS).toContain(g);
    expect(resolveGenre([], "artist-1")).toBe(g);
    expect(hash("abc")).toBeGreaterThanOrEqual(0);
  });
});

describe("demo catalog", () => {
  it("produces valid tracks", () => {
    for (const t of DEMO_TRACKS) {
      expect(t.durationMs).toBeGreaterThan(60_000);
      expect(t.energy).toBeGreaterThanOrEqual(0);
      expect(t.energy).toBeLessThanOrEqual(1);
    }
    expect(new Set(DEMO_TRACKS.map((t) => t.id)).size).toBe(DEMO_TRACKS.length);
  });

  it("seeds deterministic history", () => {
    const now = Date.UTC(2026, 5, 1);
    expect(seedHistory(now)).toEqual(seedHistory(now));
    expect(seedHistory(now).every((p) => p.playedAt < now)).toBe(true);
  });
});

describe("stats", () => {
  const day = 86_400_000;
  const now = new Date(2026, 5, 10, 12);
  const plays: Play[] = [
    { trackId: "1", genre: "pop", artistId: "a", playedAt: now.getTime() - 10 * 60_000 },
    { trackId: "2", genre: "rock", artistId: "b", playedAt: now.getTime() - 5 * 60_000 },
    { trackId: "1", genre: "pop", artistId: "a", playedAt: now.getTime() - day },
  ];

  it("breaks plays down by genre", () => {
    expect(genreBreakdown(plays)).toEqual([
      { genre: "pop", count: 2, share: 2 / 3 },
      { genre: "rock", count: 1, share: 1 / 3 },
    ]);
  });

  it("builds Sunday-aligned daily activity and streaks", () => {
    const cells = dailyActivity(plays, now, 2);
    expect(cells[0].date.getDay()).toBe(0);
    expect(cells.at(-1)?.count).toBe(2);
    expect(streak(cells)).toBe(2);
  });

  it("links artists played in the same session", () => {
    const g = artistGraph(plays, { a: "A", b: "B" });
    expect(g.nodes.map((n) => n.name)).toEqual(["A", "B"]);
    expect(g.links).toEqual([{ source: "a", target: "b", weight: 1 }]);
  });

  it("buckets by hour", () => {
    const hours = hourlyActivity(plays);
    expect(hours).toHaveLength(24);
    expect(hours.reduce((x, y) => x + y)).toBe(3);
  });
});

describe("spotify", () => {
  it("base64url-encodes without padding", () => {
    expect(base64UrlEncode(new Uint8Array([251, 255]))).toBe("-_8");
  });

  it("generates random strings from the PKCE alphabet", () => {
    const s = randomString(32, (arr) => arr.map((_, i) => i * 7));
    expect(s).toHaveLength(32);
    expect(s).toMatch(/^[A-Za-z0-9]+$/);
  });

  it("maps a Spotify track and limits preview duration", () => {
    const raw: SpotifyTrack = {
      id: "abc",
      name: "Song",
      duration_ms: 200_000,
      popularity: 80,
      preview_url: "https://p.scdn.co/x",
      artists: [{ id: "art", name: "Artist" }],
      album: {
        name: "Album",
        images: [
          { url: "big", width: 640, height: 640 },
          { url: "mid", width: 300, height: 300 },
        ],
      },
    };
    const t = mapTrack(raw, ["indie rock"]);
    expect(t).toMatchObject({
      id: "sp-abc",
      genre: "rock",
      durationMs: 30_000,
      coverUrl: "mid",
      source: "spotify",
    });
    expect(t.energy).toBeLessThanOrEqual(1);
    expect(pickImage([])).toBeUndefined();
  });
});

describe("audio helpers", () => {
  it("maps bars onto increasing FFT bins", () => {
    const bins = Array.from({ length: 16 }, (_, i) => logBin(i, 16, 128));
    expect(bins[0]).toBe(0);
    expect([...bins].sort((x, y) => x - y)).toEqual(bins);
    expect(Math.max(...bins)).toBeLessThan(128);
  });

  it("produces a louder procedural spectrum while playing", () => {
    const quiet = new Uint8Array(32);
    const loud = new Uint8Array(32);
    proceduralSpectrum(quiet, 1000, DEMO_TRACKS[0], false);
    proceduralSpectrum(loud, 1000, DEMO_TRACKS[0], true);
    const sum = (a: Uint8Array) => a.reduce((x, y) => x + y, 0);
    expect(sum(loud)).toBeGreaterThan(sum(quiet));
  });
});
