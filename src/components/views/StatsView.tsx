"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Clock, Flame, Headphones, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GenreDonut } from "@/components/charts/GenreDonut";
import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";
import { ArtistGraph } from "@/components/charts/ArtistGraph";
import { HourlyRadial } from "@/components/charts/HourlyRadial";
import { CoverArt } from "@/components/visualizer/CoverArt";
import { useMounted } from "@/hooks/useMounted";
import { GENRES } from "@/lib/genres";
import { DEMO_ARTISTS, DEMO_TRACKS_BY_ID } from "@/lib/mock/catalog";
import { artistGraph, dailyActivity, genreBreakdown, hourlyActivity, streak } from "@/lib/stats";
import { useAppSelector } from "@/store/hooks";
import type { GenreId } from "@/types/music";

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 84, label: "12 weeks" },
] as const;

export function StatsView() {
  const mounted = useMounted();
  const history = useAppSelector((s) => s.library.history);
  const cache = useAppSelector((s) => s.library.trackCache);
  const hydrated = useAppSelector((s) => s.library.hydrated);
  const [range, setRange] = useState<number>(84);
  const [genre, setGenre] = useState<GenreId | null>(null);
  const onSelect = useCallback((g: GenreId | null) => setGenre(g), []);

  // `now` is read once on mount; history only grows, so this is stable enough for a dashboard.
  const [now] = useState(() => Date.now());
  const inRange = useMemo(
    () => history.filter((p) => p.playedAt >= now - range * 86_400_000),
    [history, range, now],
  );
  const filtered = useMemo(
    () => (genre ? inRange.filter((p) => p.genre === genre) : inRange),
    [inRange, genre],
  );

  const breakdown = useMemo(() => genreBreakdown(inRange), [inRange]);
  const cells = useMemo(() => dailyActivity(history, new Date(now)), [history, now]);
  const hours = useMemo(() => hourlyActivity(filtered), [filtered]);
  const names = useMemo(() => {
    const map: Record<string, string> = Object.fromEntries(DEMO_ARTISTS.map((a) => [a.id, a.name]));
    Object.values(cache).forEach((t) => (map[t.artistId] = t.artistName));
    return map;
  }, [cache]);
  const graph = useMemo(() => artistGraph(filtered, names), [filtered, names]);

  const topTracks = useMemo(() => {
    const counts = new Map<string, number>();
    filtered.forEach((p) => counts.set(p.trackId, (counts.get(p.trackId) ?? 0) + 1));
    return [...counts]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id, count]) => ({ track: DEMO_TRACKS_BY_ID[id] ?? cache[id], count }))
      .filter((x) => x.track);
  }, [filtered, cache]);

  const minutes = Math.round(
    filtered.reduce(
      (sum, p) =>
        sum + (DEMO_TRACKS_BY_ID[p.trackId]?.durationMs ?? cache[p.trackId]?.durationMs ?? 180_000),
      0,
    ) / 60_000,
  );

  const tiles = [
    { icon: Headphones, label: "Plays", value: filtered.length.toLocaleString() },
    { icon: Clock, label: "Minutes", value: minutes.toLocaleString() },
    {
      icon: Trophy,
      label: "Top genre",
      value: breakdown[0] ? GENRES[breakdown[0].genre].label : "—",
    },
    { icon: Flame, label: "Day streak", value: String(streak(cells)) },
  ];

  if (!mounted || !hydrated) {
    return (
      <div className="mx-auto grid max-w-7xl gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-28" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">Listening stats</h1>
          <p className="mt-1 text-muted-foreground">Click a genre to filter every chart.</p>
        </div>
        <div className="flex items-center gap-2">
          {genre && (
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 rounded-full"
              onClick={() => setGenre(null)}
            >
              <span
                className="size-2 rounded-full"
                style={{ background: GENRES[genre].colors[0] }}
              />
              {GENRES[genre].label}
              <X className="size-3.5" />
            </Button>
          )}
          <div className="glass flex rounded-full p-1" role="group" aria-label="Time range">
            {RANGES.map((r) => (
              <button
                key={r.days}
                type="button"
                aria-pressed={range === r.days}
                onClick={() => setRange(r.days)}
                className="relative rounded-full px-3 py-1 text-sm"
              >
                {range === r.days && (
                  <motion.span
                    layoutId="range-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                  />
                )}
                <span
                  className={
                    range === r.days
                      ? "relative text-primary-foreground"
                      : "relative text-muted-foreground"
                  }
                >
                  {r.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(({ icon: Icon, label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass">
              <CardContent className="flex items-center gap-4">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
                  <p
                    className="font-display text-2xl font-bold"
                    data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {value}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Genres</CardTitle>
            <CardDescription>Share of plays in range</CardDescription>
          </CardHeader>
          <CardContent>
            <GenreDonut data={breakdown} selected={genre} onSelect={onSelect} />
            <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
              {breakdown.map((b) => (
                <li key={b.genre}>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => onSelect(genre === b.genre ? null : b.genre)}
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ background: GENRES[b.genre].colors[0] }}
                    />
                    {GENRES[b.genre].label}
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Artist universe</CardTitle>
            <CardDescription>
              Bubbles are sized by plays and linked when played in the same session. Drag them
              around.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ArtistGraph nodes={graph.nodes} links={graph.links} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Daily plays over the last 12 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap cells={cells} color={genre ? GENRES[genre].colors[0] : undefined} />
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader>
            <CardTitle>When you listen</CardTitle>
            <CardDescription>Plays by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            <HourlyRadial hours={hours} color={genre ? GENRES[genre].colors[1] : undefined} />
          </CardContent>
        </Card>
      </div>

      <Card className="glass mt-4">
        <CardHeader>
          <CardTitle>Most played{genre ? ` · ${GENRES[genre].label}` : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {topTracks.map(({ track, count }, i) => (
              <li
                key={track.id}
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-accent/50"
              >
                <span className="w-5 text-center font-display text-lg font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <CoverArt
                  seed={track.coverSeed}
                  genre={track.genre}
                  src={track.coverUrl}
                  alt=""
                  className="size-11"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{track.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{track.artistName}</p>
                </div>
                <span className="text-sm text-muted-foreground tabular-nums">{count}×</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
