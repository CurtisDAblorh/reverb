"use client";

import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleLike } from "@/store/librarySlice";
import type { Track } from "@/types/music";

export function LikeButton({ track, className }: { track: Track; className?: string }) {
  const dispatch = useAppDispatch();
  const liked = useAppSelector((s) => s.library.likedIds.includes(track.id));

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-pressed={liked}
      aria-label={liked ? `Unlike ${track.title}` : `Like ${track.title}`}
      className={cn("relative", liked && "text-pink-500 hover:text-pink-500", className)}
      onClick={(e) => {
        e.stopPropagation();
        dispatch(toggleLike(track));
        toast(liked ? "Removed from Liked Songs" : "Added to Liked Songs", {
          description: track.title,
        });
      }}
    >
      <motion.span
        key={String(liked)}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
      >
        <Heart className={cn("size-4", liked && "fill-current")} />
      </motion.span>
      <AnimatePresence>
        {liked && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-pink-500"
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>
    </Button>
  );
}
