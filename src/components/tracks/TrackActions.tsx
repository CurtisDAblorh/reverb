"use client";

import { ExternalLink, ListEnd, ListMusic, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToQueue } from "@/store/playerSlice";
import { addToPlaylist, removeFromPlaylist } from "@/store/librarySlice";
import { setPanel } from "@/store/uiSlice";
import type { Track } from "@/types/music";

export function TrackActions({ track, playlistId }: { track: Track; playlistId?: string }) {
  const dispatch = useAppDispatch();
  const playlists = useAppSelector((s) => s.library.playlists);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`More actions for ${track.title}`}
            onClick={(e) => e.stopPropagation()}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">{track.title}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuItem
          onClick={() => {
            dispatch(addToQueue(track));
            toast.success("Added to queue", { description: track.title });
          }}
        >
          <ListEnd /> Add to queue
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ListMusic /> Add to playlist
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-52">
            <DropdownMenuItem
              onClick={() => dispatch(setPanel({ panel: "createPlaylist", open: true }))}
            >
              <Plus /> New playlist
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {playlists.map((pl) => (
              <DropdownMenuItem
                key={pl.id}
                disabled={pl.trackIds.includes(track.id)}
                onClick={() => {
                  dispatch(addToPlaylist({ playlistId: pl.id, track }));
                  toast.success(`Added to ${pl.name}`, { description: track.title });
                }}
              >
                <span className="truncate">{pl.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        {playlistId && (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => dispatch(removeFromPlaylist({ playlistId, trackId: track.id }))}
          >
            <Trash2 /> Remove from playlist
          </DropdownMenuItem>
        )}
        {track.spotifyUrl && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.open(track.spotifyUrl, "_blank", "noopener")}>
              <ExternalLink /> Open in Spotify
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
