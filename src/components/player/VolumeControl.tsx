"use client";

import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setVolume, toggleMute } from "@/store/playerSlice";

export function VolumeControl() {
  const dispatch = useAppDispatch();
  const { volume, muted } = useAppSelector((s) => s.player);
  const level = muted ? 0 : volume;
  const Icon = level === 0 ? VolumeX : level < 0.35 ? Volume : level < 0.7 ? Volume1 : Volume2;

  return (
    <div className="flex w-36 items-center gap-2">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={muted ? "Unmute" : "Mute"}
        onClick={() => dispatch(toggleMute())}
      >
        <Icon />
      </Button>
      <Slider
        aria-label="Volume"
        min={0}
        max={100}
        value={[Math.round(level * 100)]}
        onValueChange={(v) => dispatch(setVolume((Array.isArray(v) ? v[0] : (v as number)) / 100))}
      />
    </div>
  );
}
