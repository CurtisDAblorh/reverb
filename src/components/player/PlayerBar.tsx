"use client";

import { Maximize2, ListMusic } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { CoverArt } from "@/components/visualizer/CoverArt";
import { SpectrumBars } from "@/components/visualizer/SpectrumBars";
import { LikeButton } from "@/components/tracks/LikeButton";
import { GENRES } from "@/lib/genres";
import { selectCurrentTrack, useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPanel, togglePanel } from "@/store/uiSlice";
import { PlayerControls } from "./PlayerControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";

export function PlayerBar() {
  const dispatch = useAppDispatch();
  const track = useAppSelector(selectCurrentTrack);
  const theme = GENRES[track?.genre ?? "electronic"];

  return (
    <footer
      aria-label="Player"
      data-testid="player-bar"
      className="glass relative z-30 grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl px-3 py-2 shadow-2xl shadow-black/20 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)] md:px-4"
    >
      <div className="flex min-w-0 items-center gap-3">
        <AnimatePresence mode="popLayout">
          {track ? (
            <motion.button
              key={track.id}
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => dispatch(setPanel({ panel: "nowPlaying", open: true }))}
              className="group relative size-12 shrink-0 overflow-hidden rounded-lg"
              aria-label="Open full-screen player"
            >
              <motion.div layoutId={`cover-${track.id}`}>
                <CoverArt seed={track.coverSeed} genre={track.genre} src={track.coverUrl} alt="" />
              </motion.div>
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Maximize2 className="size-4 text-white" />
              </span>
            </motion.button>
          ) : (
            <div className="size-12 shrink-0 rounded-lg bg-muted" />
          )}
        </AnimatePresence>
        <div className="min-w-0">
          <p className="truncate font-medium" data-testid="now-playing-title">
            {track?.title ?? "Nothing playing"}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {track?.artistName ?? "Pick a track to start"}
          </p>
        </div>
        {track && <LikeButton track={track} className="hidden sm:inline-flex" />}
      </div>

      <div className="flex flex-col items-center gap-1">
        <PlayerControls />
        <ProgressBar className="hidden md:flex" />
      </div>

      <div className="hidden items-center justify-end gap-2 md:flex">
        <SpectrumBars colors={theme.colors} className="hidden w-24 lg:block" />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Show queue"
          onClick={() => dispatch(togglePanel("queue"))}
        >
          <ListMusic />
        </Button>
        <VolumeControl />
      </div>

      {/* Thin progress line for mobile, where the full scrubber is hidden. */}
      <ProgressBar className="col-span-2 md:hidden [&>span]:hidden" />
    </footer>
  );
}
