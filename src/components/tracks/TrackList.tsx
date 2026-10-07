"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { Track } from "@/types/music";
import { TrackRow } from "./TrackRow";

type Props = {
  tracks: Track[];
  playlistId?: string;
  /** Enables drag-and-drop reordering. */
  onReorder?: (from: number, to: number) => void;
  emptyMessage?: string;
};

export function TrackList({
  tracks,
  playlistId,
  onReorder,
  emptyMessage = "No tracks yet.",
}: Props) {
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  if (!tracks.length) {
    return (
      <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div>
      <div className="hidden grid-cols-[2rem_minmax(0,2fr)_minmax(0,1fr)_7rem_auto] gap-3 border-b px-2 pb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase md:grid">
        <span className="text-center">#</span>
        <span>Title</span>
        <span>Album</span>
        <span>Genre</span>
        <span className="w-[8.5rem] pr-10 text-right">Time</span>
      </div>
      <motion.ol
        className="mt-2 space-y-0.5"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.025 } } }}
        aria-label="Tracks"
      >
        {tracks.map((track, i) => (
          <motion.li
            key={track.id}
            layout={Boolean(onReorder)}
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
          >
            <TrackRow
              track={track}
              index={i}
              queue={tracks}
              playlistId={playlistId}
              draggable={Boolean(onReorder)}
              dragState={
                dragFrom === i ? "dragging" : dragOver === i && dragFrom !== null ? "over" : null
              }
              onDragStart={() => setDragFrom(i)}
              onDragEnter={() => setDragOver(i)}
              onDragEnd={() => {
                setDragFrom(null);
                setDragOver(null);
              }}
              onDrop={() => {
                if (dragFrom !== null) onReorder?.(dragFrom, i);
                setDragFrom(null);
                setDragOver(null);
              }}
            />
          </motion.li>
        ))}
      </motion.ol>
    </div>
  );
}
