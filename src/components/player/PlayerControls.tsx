"use client";

import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { cycleRepeat, next, previous, togglePlay, toggleShuffle } from "@/store/playerSlice";

function IconTip({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function PlayerControls({ size = "md" }: { size?: "md" | "lg" }) {
  const dispatch = useAppDispatch();
  const { isPlaying, shuffle, repeat, index } = useAppSelector((s) => s.player);
  const disabled = index < 0;
  const big = size === "lg";

  return (
    <div className={cn("flex items-center justify-center", big ? "gap-5" : "gap-1.5 sm:gap-3")}>
      <IconTip label={shuffle ? "Shuffle on" : "Shuffle off"}>
        <Button
          variant="ghost"
          size={big ? "icon-lg" : "icon-sm"}
          aria-label="Shuffle"
          aria-pressed={shuffle}
          onClick={() => dispatch(toggleShuffle())}
          className={cn("hidden sm:inline-flex", shuffle && "text-primary")}
        >
          <Shuffle />
        </Button>
      </IconTip>
      <Button
        variant="ghost"
        size={big ? "icon-lg" : "icon"}
        aria-label="Previous track"
        disabled={disabled}
        onClick={() => dispatch(previous())}
      >
        <SkipBack className="fill-current" />
      </Button>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.06 }}
        aria-label={isPlaying ? "Pause" : "Play"}
        disabled={disabled}
        onClick={() => dispatch(togglePlay())}
        className={cn(
          "flex items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-opacity disabled:opacity-40",
          big ? "size-16" : "size-10",
        )}
      >
        {isPlaying ? (
          <Pause className={cn("fill-current", big ? "size-7" : "size-4")} />
        ) : (
          <Play className={cn("ml-0.5 fill-current", big ? "size-7" : "size-4")} />
        )}
      </motion.button>
      <Button
        variant="ghost"
        size={big ? "icon-lg" : "icon"}
        aria-label="Next track"
        disabled={disabled}
        onClick={() => dispatch(next())}
      >
        <SkipForward className="fill-current" />
      </Button>
      <IconTip label={`Repeat: ${repeat}`}>
        <Button
          variant="ghost"
          size={big ? "icon-lg" : "icon-sm"}
          aria-label={`Repeat ${repeat}`}
          aria-pressed={repeat !== "off"}
          onClick={() => dispatch(cycleRepeat())}
          className={cn("hidden sm:inline-flex", repeat !== "off" && "text-primary")}
        >
          {repeat === "one" ? <Repeat1 /> : <Repeat />}
        </Button>
      </IconTip>
    </div>
  );
}
