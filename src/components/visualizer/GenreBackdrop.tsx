"use client";

import { motion, useReducedMotion } from "motion/react";
import { GENRES } from "@/lib/genres";
import { selectCurrentTrack, useAppSelector } from "@/store/hooks";

const BLOBS = [
  { className: "-top-40 -left-32 size-[34rem]", drift: { x: [0, 60, -20, 0], y: [0, 40, 80, 0] } },
  {
    className: "top-1/3 -right-40 size-[30rem]",
    drift: { x: [0, -50, 20, 0], y: [0, -60, 30, 0] },
  },
  {
    className: "-bottom-48 left-1/4 size-[36rem]",
    drift: { x: [0, 40, -60, 0], y: [0, -30, -10, 0] },
  },
];

/**
 * Full-page ambient backdrop. Colours crossfade to the current track's genre
 * palette and the blobs breathe on the beat while playing.
 */
export function GenreBackdrop() {
  const track = useAppSelector(selectCurrentTrack);
  const isPlaying = useAppSelector((s) => s.player.isPlaying);
  const reduce = useReducedMotion();
  const theme = GENRES[track?.genre ?? "electronic"];
  const beat = 60 / (track?.bpm ?? 90);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      data-genre={theme.id}
    >
      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${blob.className}`}
          animate={{
            backgroundColor: theme.colors[i],
            opacity: track ? 0.35 : 0.18,
            ...(reduce ? {} : blob.drift),
            scale: isPlaying && !reduce ? [1, 1 + theme.pulse * 0.08, 1] : 1,
          }}
          transition={{
            backgroundColor: { duration: 1.6, ease: "easeInOut" },
            opacity: { duration: 1.2 },
            x: { duration: 24 + i * 6, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 28 + i * 5, repeat: Infinity, ease: "easeInOut" },
            scale: isPlaying
              ? { duration: beat, repeat: Infinity, ease: "easeOut" }
              : { duration: 0.6 },
          }}
        />
      ))}
      <div className="absolute inset-0 bg-background/55 dark:bg-background/70" />
      <div className="noise absolute inset-0 opacity-[0.035] mix-blend-overlay" />
    </div>
  );
}
