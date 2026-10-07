"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { selectCurrentTrack, useAppDispatch, useAppSelector } from "@/store/hooks";
import { seek } from "@/store/playerSlice";

const first = (v: number | readonly number[]) => (Array.isArray(v) ? v[0] : (v as number));

export function ProgressBar({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const track = useAppSelector(selectCurrentTrack);
  const position = useAppSelector((s) => s.player.positionMs);
  // While scrubbing, show the drag position instead of the playback clock.
  const [scrub, setScrub] = useState<number | null>(null);
  const duration = track?.durationMs ?? 0;
  const value = scrub ?? position;

  return (
    <div
      className={cn(
        "flex w-full items-center gap-2 text-xs text-muted-foreground tabular-nums",
        className,
      )}
    >
      <span className="w-10 text-right">{formatDuration(value)}</span>
      <Slider
        aria-label="Seek"
        min={0}
        max={Math.max(duration, 1)}
        step={1000}
        value={[value]}
        disabled={!track}
        onValueChange={(v) => setScrub(first(v))}
        onValueCommitted={(v) => {
          dispatch(seek(first(v)));
          setScrub(null);
        }}
        className="group/progress [&_[data-slot=slider-thumb]]:opacity-0 [&_[data-slot=slider-thumb]]:transition-opacity hover:[&_[data-slot=slider-thumb]]:opacity-100 [&_[data-slot=slider-track]]:h-1.5"
      />
      <span className="w-10">{formatDuration(duration)}</span>
    </div>
  );
}
