"use client";

import { GripVertical, Pause, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CoverArt } from "@/components/visualizer/CoverArt";
import { EqualizerIcon } from "@/components/visualizer/EqualizerIcon";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/format";
import { GENRES } from "@/lib/genres";
import { selectCurrentTrack, useAppDispatch, useAppSelector } from "@/store/hooks";
import { playTrack, togglePlay } from "@/store/playerSlice";
import type { Track } from "@/types/music";
import { LikeButton } from "./LikeButton";
import { TrackActions } from "./TrackActions";

type Props = {
  track: Track;
  index: number;
  /** The list this row belongs to; becomes the queue when played. */
  queue: Track[];
  playlistId?: string;
  draggable?: boolean;
  dragState?: "dragging" | "over" | null;
  onDragStart?: () => void;
  onDragEnter?: () => void;
  onDragEnd?: () => void;
  onDrop?: () => void;
};

export function TrackRow({
  track,
  index,
  queue,
  playlistId,
  draggable,
  dragState,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
}: Props) {
  const dispatch = useAppDispatch();
  const current = useAppSelector(selectCurrentTrack);
  const isPlaying = useAppSelector((s) => s.player.isPlaying);
  const isCurrent = current?.id === track.id;
  const genre = GENRES[track.genre];

  const play = () => (isCurrent ? dispatch(togglePlay()) : dispatch(playTrack({ track, queue })));

  return (
    <div
      data-testid="track-row"
      data-genre={track.genre}
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.();
      }}
      onDragEnter={onDragEnter}
      onDragOver={(e) => draggable && e.preventDefault()}
      onDragEnd={onDragEnd}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.();
      }}
      onDoubleClick={play}
      className={cn(
        "group grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent/60 md:grid-cols-[2rem_minmax(0,2fr)_minmax(0,1fr)_7rem_auto]",
        isCurrent && "bg-accent/40",
        dragState === "dragging" && "opacity-40",
        dragState === "over" && "ring-2 ring-primary/60",
      )}
    >
      <div className="relative flex size-8 items-center justify-center text-sm text-muted-foreground tabular-nums">
        {draggable && (
          <GripVertical
            aria-hidden
            className="absolute -left-3 size-3.5 cursor-grab opacity-0 transition-opacity group-hover:opacity-60"
          />
        )}
        <span className={cn("group-hover:hidden", isCurrent && "hidden")}>{index + 1}</span>
        {isCurrent && isPlaying && <EqualizerIcon playing className="group-hover:hidden" />}
        {isCurrent && !isPlaying && (
          <span className="text-primary group-hover:hidden">{index + 1}</span>
        )}
        <button
          type="button"
          onClick={play}
          aria-label={isCurrent && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          className="absolute inset-0 hidden items-center justify-center rounded-md text-foreground group-hover:flex focus-visible:flex"
        >
          {isCurrent && isPlaying ? (
            <Pause className="size-4 fill-current" />
          ) : (
            <Play className="size-4 fill-current" />
          )}
        </button>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <CoverArt
          seed={track.coverSeed}
          genre={track.genre}
          src={track.coverUrl}
          alt=""
          className="size-10 shrink-0"
        />
        <div className="min-w-0">
          <p className={cn("truncate font-medium", isCurrent && "text-primary")}>{track.title}</p>
          <p className="truncate text-sm text-muted-foreground">{track.artistName}</p>
        </div>
      </div>

      <p className="hidden truncate text-sm text-muted-foreground md:block">{track.album}</p>

      <div className="hidden md:block">
        <Badge variant="outline" className="gap-1.5 font-normal">
          <span className="size-2 rounded-full" style={{ background: genre.colors[0] }} />
          {genre.label}
        </Badge>
      </div>

      <div className="flex items-center gap-1">
        <LikeButton track={track} className="opacity-70 group-hover:opacity-100" />
        <span className="hidden w-10 text-right text-sm text-muted-foreground tabular-nums sm:inline">
          {formatDuration(track.durationMs)}
        </span>
        <TrackActions track={track} playlistId={playlistId} />
      </div>
    </div>
  );
}
