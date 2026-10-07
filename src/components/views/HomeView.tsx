"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Maximize2, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrackCard } from "@/components/tracks/TrackCard";
import { Visualizer } from "@/components/visualizer/Visualizer";
import { CoverArt } from "@/components/visualizer/CoverArt";
import { useMounted } from "@/hooks/useMounted";
import { GENRES, GENRE_IDS } from "@/lib/genres";
import { DEMO_TRACKS } from "@/lib/mock/catalog";
import { greeting, pluralize } from "@/lib/format";
import { selectCurrentTrack, useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  useGetProfileQuery,
  useGetTopArtistsQuery,
  useGetTopTracksQuery,
} from "@/store/spotifyApi";
import { playTrack } from "@/store/playerSlice";
import { setPanel } from "@/store/uiSlice";
import type { GenreId } from "@/types/music";
import { Section } from "./Section";

export function HomeView() {
  const dispatch = useAppDispatch();
  const mounted = useMounted();
  const current = useAppSelector(selectCurrentTrack);
  const isPlaying = useAppSelector((s) => s.player.isPlaying);
  const playlists = useAppSelector((s) => s.library.playlists);
  const { data: profile } = useGetProfileQuery();
  const { data: topTracks, isLoading: loadingTracks } = useGetTopTracksQuery();
  const { data: topArtists } = useGetTopArtistsQuery();

  const theme = GENRES[current?.genre ?? "electronic"];

  const playGenre = (genre: GenreId) => {
    const queue = DEMO_TRACKS.filter((t) => t.genre === genre);
    dispatch(playTrack({ track: queue[Math.floor(Math.random() * queue.length)], queue }));
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative grid items-center gap-6 overflow-hidden rounded-3xl border bg-gradient-to-br from-card to-transparent p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr]"
      >
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border bg-background/50 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            {profile?.demo === false
              ? `Connected as ${profile.name}`
              : "Demo mode · every track is synthesised live"}
          </p>
          <h1 className="text-4xl leading-[1.05] font-extrabold sm:text-6xl">
            {mounted ? greeting(new Date().getHours()) : "Welcome"},<br />
            <span className="text-gradient">feel the music.</span>
          </h1>
          <p className="mt-4 max-w-lg text-muted-foreground sm:text-lg">
            Reverb paints every track. Pick a mood and the whole interface shifts its colours,
            motion and visualiser to match the genre.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="gap-2 rounded-full px-6"
              onClick={() =>
                topTracks?.[0]
                  ? dispatch(playTrack({ track: topTracks[0], queue: topTracks }))
                  : playGenre("electronic")
              }
            >
              <Play className="size-4 fill-current" /> Start listening
            </Button>
            {current && (
              <Button
                size="lg"
                variant="outline"
                className="gap-2 rounded-full"
                onClick={() => dispatch(setPanel({ panel: "nowPlaying", open: true }))}
              >
                <Maximize2 className="size-4" /> Full-screen visualiser
              </Button>
            )}
          </div>
        </div>
        <button
          type="button"
          aria-label={
            current ? "Open full-screen visualiser" : "Play a track to start the visualiser"
          }
          onClick={() =>
            current
              ? dispatch(setPanel({ panel: "nowPlaying", open: true }))
              : playGenre("electronic")
          }
          className="relative mx-auto aspect-square w-full max-w-sm"
        >
          <Visualizer
            mode={theme.mode}
            colors={theme.colors}
            size={360}
            className="h-full w-full"
          />
          <span className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs tracking-widest text-white/80 uppercase drop-shadow">
              {current ? (isPlaying ? "Now playing" : "Paused") : "Tap to play"}
            </span>
            {current && (
              <span className="mt-1 max-w-[50%] truncate font-display text-lg font-bold text-white drop-shadow">
                {current.title}
              </span>
            )}
          </span>
        </button>
      </motion.section>

      {/* Moods */}
      <Section title="Pick a mood">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GENRE_IDS.map((g, i) => {
            const t = GENRES[g];
            return (
              <motion.button
                key={g}
                type="button"
                data-testid={`mood-${g}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => playGenre(g)}
                className="group relative h-24 overflow-hidden rounded-2xl p-4 text-left text-white shadow-lg sm:h-28"
                style={{
                  background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]} 60%, ${t.colors[2]})`,
                }}
              >
                <span className="relative z-10 font-display text-lg font-bold drop-shadow">
                  {t.label}
                </span>
                <span className="relative z-10 mt-1 line-clamp-2 block text-xs text-white/85">
                  {t.blurb}
                </span>
                <span className="absolute -right-6 -bottom-6 size-24 rounded-full bg-white/20 transition-transform duration-500 group-hover:scale-150" />
                <Play className="absolute right-3 bottom-3 size-5 fill-current opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.button>
            );
          })}
        </div>
      </Section>

      {/* Top tracks */}
      <Section
        title={profile?.demo === false ? "Your top tracks" : "Trending now"}
        action={
          <Link href="/search/" className="text-sm text-muted-foreground hover:text-foreground">
            See all
          </Link>
        }
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {loadingTracks || !topTracks
            ? Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
              ))
            : topTracks
                .slice(0, 12)
                .map((t) => <TrackCard key={t.id} track={t} queue={topTracks} />)}
        </div>
      </Section>

      {/* Artists */}
      <Section title="Top artists">
        <div className="-mx-1 flex snap-x gap-5 overflow-x-auto px-1 pb-2">
          {(topArtists ?? []).slice(0, 12).map((a) => (
            <Link
              key={a.id}
              href={`/search/?q=${encodeURIComponent(a.name)}`}
              className="group w-28 shrink-0 snap-start text-center"
            >
              <Avatar className="mx-auto size-28 ring-2 ring-transparent transition-all group-hover:scale-105 group-hover:ring-primary">
                <AvatarImage src={a.imageUrl} alt="" />
                <AvatarFallback
                  className="font-display text-3xl font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${GENRES[a.genres[0]].colors.join(",")})`,
                  }}
                >
                  {a.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <p className="mt-2 truncate text-sm font-medium">{a.name}</p>
              <p className="text-xs text-muted-foreground">{GENRES[a.genres[0]].label}</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* Playlists */}
      <Section
        title="Your playlists"
        action={
          <Link href="/library/" className="text-sm text-muted-foreground hover:text-foreground">
            Library
          </Link>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.slice(0, 6).map((pl) => (
            <Link
              key={pl.id}
              href={`/playlist/?id=${pl.id}`}
              className="glass group flex items-center gap-4 rounded-2xl p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <CoverArt seed={pl.coverSeed} genre="pop" alt="" className="size-16 rounded-xl" />
              <span className="min-w-0">
                <span className="block truncate font-semibold">{pl.name}</span>
                <span className="block text-sm text-muted-foreground">
                  {pluralize(pl.trackIds.length, "track")}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
