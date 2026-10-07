import type { GenreId, Play } from "@/types/music";

export type GenreSlice = { genre: GenreId; count: number; share: number };

export function genreBreakdown(plays: Play[]): GenreSlice[] {
  const counts = new Map<GenreId, number>();
  plays.forEach((p) => counts.set(p.genre, (counts.get(p.genre) ?? 0) + 1));
  const total = plays.length || 1;
  return [...counts]
    .map(([genre, count]) => ({ genre, count, share: count / total }))
    .sort((a, b) => b.count - a.count);
}

export type DayCell = { date: Date; key: string; count: number };

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/** Daily play counts for the last `weeks` whole weeks, ending today, Sunday-aligned. */
export function dailyActivity(plays: Play[], now: Date, weeks = 12): DayCell[] {
  const counts = new Map<string, number>();
  plays.forEach((p) => {
    const k = dayKey(new Date(p.playedAt));
    counts.set(k, (counts.get(k) ?? 0) + 1);
  });
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(end);
  start.setDate(end.getDate() - end.getDay() - (weeks - 1) * 7);
  const cells: DayCell[] = [];
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    cells.push({ date, key: dayKey(date), count: counts.get(dayKey(date)) ?? 0 });
  }
  return cells;
}

export type ArtistNode = { id: string; name: string; genre: GenreId; plays: number };
export type ArtistLink = { source: string; target: string; weight: number };

/**
 * Builds an artist graph: nodes sized by plays, linked when listened to in the
 * same session (within 45 minutes of each other).
 */
export function artistGraph(
  plays: Play[],
  names: Record<string, string>,
  limit = 16,
): { nodes: ArtistNode[]; links: ArtistLink[] } {
  const counts = new Map<string, { plays: number; genre: GenreId }>();
  plays.forEach((p) => {
    const c = counts.get(p.artistId) ?? { plays: 0, genre: p.genre };
    c.plays += 1;
    counts.set(p.artistId, c);
  });
  const top = [...counts]
    .sort((a, b) => b[1].plays - a[1].plays)
    .slice(0, limit)
    .map(([id, c]) => ({
      id,
      name: names[id] ?? "Unknown artist",
      genre: c.genre,
      plays: c.plays,
    }));
  const ids = new Set(top.map((n) => n.id));

  const weights = new Map<string, number>();
  const sorted = plays.filter((p) => ids.has(p.artistId)).sort((a, b) => a.playedAt - b.playedAt);
  for (let i = 1; i < sorted.length; i++) {
    const a = sorted[i - 1];
    const b = sorted[i];
    if (a.artistId === b.artistId || b.playedAt - a.playedAt > 45 * 60_000) continue;
    const key = [a.artistId, b.artistId].sort().join("|");
    weights.set(key, (weights.get(key) ?? 0) + 1);
  }
  const links = [...weights].map(([key, weight]) => {
    const [source, target] = key.split("|");
    return { source, target, weight };
  });
  return { nodes: top, links };
}

/** Plays bucketed by hour of day (0-23). */
export function hourlyActivity(plays: Play[]): number[] {
  const hours = new Array<number>(24).fill(0);
  plays.forEach((p) => (hours[new Date(p.playedAt).getHours()] += 1));
  return hours;
}

export function streak(cells: DayCell[]): number {
  let n = 0;
  for (let i = cells.length - 1; i >= 0 && cells[i].count > 0; i--) n++;
  return n;
}
