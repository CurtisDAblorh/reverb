"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrackList } from "@/components/tracks/TrackList";
import { GENRES, GENRE_IDS } from "@/lib/genres";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/format";
import { useSearchTracksQuery } from "@/store/spotifyApi";
import type { GenreId } from "@/types/music";

export function SearchView() {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const genreParam = params.get("genre") as GenreId | null;
  const [genre, setGenre] = useState<GenreId | null>(
    genreParam && GENRES[genreParam] ? genreParam : null,
  );
  // Defer the query so typing stays responsive while results update.
  const deferred = useDeferredValue(query);
  const { data = [], isFetching, error } = useSearchTracksQuery(deferred);

  const results = useMemo(
    () => (genre ? data.filter((t) => t.genre === genre) : data),
    [data, genre],
  );

  const updateUrl = (q: string, g: GenreId | null) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (g) sp.set("genre", g);
    router.replace(`/search/${sp.size ? `?${sp}` : ""}`, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Search</h1>
      <div className="relative mt-5">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search tracks"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            updateUrl(e.target.value, genre);
          }}
          placeholder="Songs, artists, albums or genres"
          className="h-14 rounded-2xl pl-12 text-base"
        />
        {isFetching && (
          <Loader2 className="absolute top-1/2 right-12 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {query && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Clear search"
            className="absolute top-1/2 right-3 -translate-y-1/2"
            onClick={() => {
              setQuery("");
              updateUrl("", genre);
            }}
          >
            <X />
          </Button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by genre">
        {GENRE_IDS.map((g) => {
          const active = genre === g;
          return (
            <motion.button
              key={g}
              type="button"
              whileTap={{ scale: 0.94 }}
              aria-pressed={active}
              onClick={() => {
                const nextGenre = active ? null : g;
                setGenre(nextGenre);
                updateUrl(query, nextGenre);
              }}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                active ? "border-transparent text-white" : "bg-background/40 hover:bg-accent",
              )}
              style={
                active
                  ? {
                      background: `linear-gradient(135deg, ${GENRES[g].colors[0]}, ${GENRES[g].colors[1]})`,
                    }
                  : undefined
              }
            >
              {!active && (
                <span className="size-2 rounded-full" style={{ background: GENRES[g].colors[0] }} />
              )}
              {GENRES[g].label}
            </motion.button>
          );
        })}
      </div>

      <p className="mt-6 mb-2 text-sm text-muted-foreground" aria-live="polite">
        {error ? "Search failed. Try again." : pluralize(results.length, "result")}
      </p>
      <TrackList tracks={results} emptyMessage="No tracks match. Try another search or genre." />
    </div>
  );
}
