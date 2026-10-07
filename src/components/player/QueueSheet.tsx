"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CoverArt } from "@/components/visualizer/CoverArt";
import { EqualizerIcon } from "@/components/visualizer/EqualizerIcon";
import { cn } from "@/lib/utils";
import { formatDuration, pluralize } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { playTrack, removeFromQueue } from "@/store/playerSlice";
import { setPanel } from "@/store/uiSlice";

export function QueueSheet() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.queue);
  const { queue, index, isPlaying } = useAppSelector((s) => s.player);
  const upNext = queue.slice(index + 1);

  return (
    <Sheet open={open} onOpenChange={(o) => dispatch(setPanel({ panel: "queue", open: o }))}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Queue</SheetTitle>
          <SheetDescription>{pluralize(upNext.length, "track")} up next</SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1 px-4 pb-6">
          {index >= 0 && (
            <>
              <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Now playing
              </h3>
              <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-2">
                <CoverArt
                  seed={queue[index].coverSeed}
                  genre={queue[index].genre}
                  src={queue[index].coverUrl}
                  alt=""
                  className="size-10"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-primary">{queue[index].title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {queue[index].artistName}
                  </p>
                </div>
                <EqualizerIcon playing={isPlaying} />
              </div>
            </>
          )}
          <h3 className="mt-6 mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Next up
          </h3>
          {!upNext.length && (
            <p className="text-sm text-muted-foreground">
              Nothing queued. Add tracks from any list.
            </p>
          )}
          <ul className="space-y-1">
            <AnimatePresence initial={false}>
              {upNext.map((t, i) => (
                <motion.li
                  key={`${t.id}-${i}`}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={cn("group flex items-center gap-3 rounded-lg p-2 hover:bg-accent/50")}
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    onClick={() => dispatch(playTrack({ track: t }))}
                  >
                    <CoverArt
                      seed={t.coverSeed}
                      genre={t.genre}
                      src={t.coverUrl}
                      alt=""
                      className="size-10"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{t.title}</span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {t.artistName}
                      </span>
                    </span>
                  </button>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatDuration(t.durationMs)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${t.title} from queue`}
                    onClick={() => dispatch(removeFromQueue(index + 1 + i))}
                  >
                    <X />
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
