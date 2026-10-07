"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Visualizer } from "@/components/visualizer/Visualizer";
import { CoverArt } from "@/components/visualizer/CoverArt";
import { LikeButton } from "@/components/tracks/LikeButton";
import { GENRES, type VisualizerMode } from "@/lib/genres";
import { selectCurrentTrack, useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPanel } from "@/store/uiSlice";
import { PlayerControls } from "./PlayerControls";
import { ProgressBar } from "./ProgressBar";

/** Full-screen "now playing" view with the large genre-reactive visualiser. */
export function NowPlayingOverlay() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.nowPlaying);
  const track = useAppSelector(selectCurrentTrack);
  const [override, setOverride] = useState<VisualizerMode | "auto">("auto");
  const close = () => dispatch(setPanel({ panel: "nowPlaying", open: false }));

  const theme = track ? GENRES[track.genre] : null;
  const mode = override === "auto" ? (theme?.mode ?? "bars") : override;

  return (
    <AnimatePresence>
      {open && track && theme && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Now playing"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background/80 backdrop-blur-2xl"
          onKeyDown={(e) => e.key === "Escape" && close()}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-60"
            animate={{
              background: `radial-gradient(60% 60% at 30% 30%, ${theme.colors[0]}55, transparent), radial-gradient(50% 50% at 75% 70%, ${theme.colors[1]}55, transparent), radial-gradient(40% 40% at 60% 20%, ${theme.colors[2]}44, transparent)`,
            }}
            transition={{ duration: 1.5 }}
          />
          <header className="flex items-center justify-between p-4 sm:p-6">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close now playing"
              onClick={close}
              autoFocus
            >
              <ChevronDown />
            </Button>
            <ToggleGroup
              value={[override]}
              onValueChange={(v) => v.length && setOverride(v[0] as VisualizerMode | "auto")}
              variant="outline"
              size="sm"
              aria-label="Visualiser style"
            >
              {(["auto", "bars", "wave", "orbit"] as const).map((m) => (
                <ToggleGroupItem
                  key={m}
                  value={m}
                  className="capitalize aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                >
                  {m}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <span className="w-9" />
          </header>

          <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-6 pb-8 lg:grid-cols-[1fr_1.2fr]">
            <div className="order-2 flex flex-col gap-6 lg:order-1">
              <div className="flex items-end gap-5">
                <motion.div layoutId={`cover-${track.id}`} className="w-28 shrink-0 sm:w-36">
                  <CoverArt
                    seed={track.coverSeed}
                    genre={track.genre}
                    src={track.coverUrl}
                    alt={`${track.album} cover`}
                    className="rounded-2xl shadow-2xl"
                  />
                </motion.div>
                <div className="min-w-0">
                  <Badge variant="secondary" className="mb-3 gap-1.5">
                    <span className="size-2 rounded-full" style={{ background: theme.colors[0] }} />
                    {theme.label} · {track.bpm} BPM
                  </Badge>
                  <motion.h2
                    key={track.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold sm:text-5xl"
                  >
                    {track.title}
                  </motion.h2>
                  <p className="mt-1 text-lg text-muted-foreground">{track.artistName}</p>
                </div>
              </div>
              <p className="max-w-md text-muted-foreground">{theme.blurb}</p>
              <div className="flex items-center gap-2">
                <LikeButton track={track} />
                <span className="text-sm text-muted-foreground">
                  {track.source === "demo"
                    ? "Generative demo playback"
                    : track.previewUrl
                      ? "30s Spotify preview"
                      : "Genre-matched generative loop"}
                </span>
              </div>
              <ProgressBar />
              <PlayerControls size="lg" />
            </div>
            <div className="order-1 mx-auto w-full max-w-[min(80vw,34rem)] lg:order-2">
              <Visualizer mode={mode} colors={theme.colors} size={520} className="h-auto w-full" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
