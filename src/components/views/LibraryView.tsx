"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Plus } from "lucide-react";
import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TrackList } from "@/components/tracks/TrackList";
import { CoverArt } from "@/components/visualizer/CoverArt";
import { pluralize } from "@/lib/format";
import { useAppDispatch, useAppSelector, useTracks } from "@/store/hooks";
import { setPanel } from "@/store/uiSlice";

const TABS = ["playlists", "liked", "recent"] as const;
type Tab = (typeof TABS)[number];

export function LibraryView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useSearchParams();
  const tab: Tab = TABS.includes(params.get("tab") as Tab)
    ? (params.get("tab") as Tab)
    : "playlists";

  const playlists = useAppSelector((s) => s.library.playlists);
  const likedIds = useAppSelector((s) => s.library.likedIds);
  const history = useAppSelector((s) => s.library.history);
  const recentIds = useMemo(
    () => [...new Set([...history].reverse().map((p) => p.trackId))].slice(0, 30),
    [history],
  );
  const liked = useTracks(likedIds);
  const recent = useTracks(recentIds);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Your Library</h1>
        <Button
          className="gap-2 rounded-full"
          onClick={() => dispatch(setPanel({ panel: "createPlaylist", open: true }))}
        >
          <Plus className="size-4" /> New playlist
        </Button>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => router.replace(`/library/?tab=${v}`, { scroll: false })}
        className="mt-6"
      >
        <TabsList>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="liked">Liked Songs</TabsTrigger>
          <TabsTrigger value="recent">Recently played</TabsTrigger>
        </TabsList>

        <TabsContent value="playlists" className="mt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <motion.div whileHover={{ y: -4 }}>
              <Link
                href="/library/?tab=liked"
                className="flex aspect-square flex-col justify-end rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 p-4 text-white shadow-lg"
              >
                <Heart className="mb-auto size-8 fill-current" />
                <span className="font-display text-xl font-bold">Liked Songs</span>
                <span className="text-sm text-white/80">{pluralize(likedIds.length, "track")}</span>
              </Link>
            </motion.div>
            {playlists.map((pl, i) => (
              <motion.div
                key={pl.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  href={`/playlist/?id=${pl.id}`}
                  className="glass block rounded-2xl p-3"
                  data-testid="playlist-card"
                >
                  <CoverArt seed={pl.coverSeed} genre="pop" alt="" className="rounded-xl" />
                  <p className="mt-3 truncate font-semibold">{pl.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {pluralize(pl.trackIds.length, "track")}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="liked" className="mt-6">
          <TrackList tracks={liked} emptyMessage="Tap the heart on any track to save it here." />
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <TrackList tracks={recent} emptyMessage="Play something and it will show up here." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
