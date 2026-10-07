"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Pause, Play } from "lucide-react";
import { CoverArt } from "@/components/visualizer/CoverArt";
import { cn } from "@/lib/utils";
import { selectCurrentTrack, useAppDispatch, useAppSelector } from "@/store/hooks";
import { playTrack, togglePlay } from "@/store/playerSlice";
import type { Track } from "@/types/music";

/** Album-style card with a 3D tilt that follows the pointer and a floating play button. */
export function TrackCard({ track, queue }: { track: Track; queue: Track[] }) {
  const dispatch = useAppDispatch();
  const current = useAppSelector(selectCurrentTrack);
  const isPlaying = useAppSelector((s) => s.player.isPlaying);
  const active = current?.id === track.id;
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 200, damping: 20 });

  const onClick = () => (active ? dispatch(togglePlay()) : dispatch(playTrack({ track, queue })));

  return (
    <motion.div
      ref={ref}
      data-testid="track-card"
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group glass relative cursor-pointer rounded-2xl p-3 transition-shadow hover:shadow-xl hover:shadow-primary/10",
        active && "ring-2 ring-primary/70",
      )}
      onClick={onClick}
    >
      <div className="relative">
        <CoverArt
          seed={track.coverSeed}
          genre={track.genre}
          src={track.coverUrl}
          alt={`${track.album} cover`}
          className="rounded-xl shadow-lg"
        />
        <button
          type="button"
          aria-label={active && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={cn(
            "absolute right-2 bottom-2 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-black/30 transition-all duration-300",
            active
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100",
          )}
        >
          {active && isPlaying ? (
            <Pause className="size-5 fill-current" />
          ) : (
            <Play className="ml-0.5 size-5 fill-current" />
          )}
        </button>
      </div>
      <p className="mt-3 truncate font-semibold">{track.title}</p>
      <p className="truncate text-sm text-muted-foreground">{track.artistName}</p>
    </motion.div>
  );
}
