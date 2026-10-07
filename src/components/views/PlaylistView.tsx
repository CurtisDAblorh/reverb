"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Play, Plus, Shuffle, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrackList } from "@/components/tracks/TrackList";
import { CoverArt } from "@/components/visualizer/CoverArt";
import { GENRES } from "@/lib/genres";
import { DEMO_TRACKS } from "@/lib/mock/catalog";
import { formatTotalDuration, pluralize } from "@/lib/format";
import { genreBreakdown } from "@/lib/stats";
import { useAppDispatch, useAppSelector, useTracks } from "@/store/hooks";
import {
  addToPlaylist,
  deletePlaylist,
  movePlaylistTrack,
  renamePlaylist,
} from "@/store/librarySlice";
import { playTrack, toggleShuffle } from "@/store/playerSlice";
import { Section } from "./Section";

const NO_IDS: string[] = [];

export function PlaylistView() {
  const id = useSearchParams().get("id") ?? "";
  const router = useRouter();
  const dispatch = useAppDispatch();
  const playlist = useAppSelector((s) => s.library.playlists.find((p) => p.id === id));
  const hydrated = useAppSelector((s) => s.library.hydrated);
  const shuffle = useAppSelector((s) => s.player.shuffle);
  const tracks = useTracks(playlist?.trackIds ?? NO_IDS);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const breakdown = useMemo(
    () =>
      genreBreakdown(
        tracks.map((t) => ({ trackId: t.id, genre: t.genre, artistId: t.artistId, playedAt: 0 })),
      ),
    [tracks],
  );
  const dominant = breakdown[0]?.genre ?? "pop";
  const suggestions = useMemo(
    () =>
      DEMO_TRACKS.filter(
        (t) => !playlist?.trackIds.includes(t.id) && (t.genre === dominant || !tracks.length),
      ).slice(0, 5),
    [playlist, dominant, tracks.length],
  );

  if (!playlist) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="text-2xl font-bold">{hydrated ? "Playlist not found" : "Loading…"}</h1>
        {hydrated && (
          <Button className="mt-6" render={<Link href="/library/" />}>
            Back to library
          </Button>
        )}
      </div>
    );
  }

  const theme = GENRES[dominant];
  const total = tracks.reduce((sum, t) => sum + t.durationMs, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-col gap-6 overflow-hidden rounded-3xl p-6 sm:flex-row sm:items-end sm:p-8"
        style={{
          background: `linear-gradient(135deg, ${theme.colors[0]}33, ${theme.colors[1]}22 50%, transparent)`,
        }}
      >
        <CoverArt
          seed={playlist.coverSeed}
          genre={dominant}
          alt=""
          className="size-40 shrink-0 rounded-2xl shadow-2xl sm:size-52"
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Playlist
          </p>
          <h1 className="mt-1 truncate text-4xl font-extrabold sm:text-6xl">{playlist.name}</h1>
          {playlist.description && (
            <p className="mt-2 text-muted-foreground">{playlist.description}</p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {pluralize(tracks.length, "track")} · {formatTotalDuration(total)}
            {breakdown.length > 0 && ` · mostly ${theme.label}`}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button
              size="lg"
              className="gap-2 rounded-full px-6"
              disabled={!tracks.length}
              onClick={() => dispatch(playTrack({ track: tracks[0], queue: tracks }))}
            >
              <Play className="size-4 fill-current" /> Play
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 rounded-full"
              disabled={!tracks.length}
              onClick={() => {
                if (!shuffle) dispatch(toggleShuffle());
                dispatch(
                  playTrack({
                    track: tracks[Math.floor(Math.random() * tracks.length)],
                    queue: tracks,
                  }),
                );
              }}
            >
              <Shuffle className="size-4" /> Shuffle
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Edit playlist details"
              onClick={() => setEditing(true)}
            >
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete playlist"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="mt-8">
        {tracks.length > 1 && (
          <p className="mb-2 text-xs text-muted-foreground">Drag tracks to reorder.</p>
        )}
        <TrackList
          tracks={tracks}
          playlistId={playlist.id}
          onReorder={(from, to) =>
            dispatch(movePlaylistTrack({ playlistId: playlist.id, from, to }))
          }
          emptyMessage="This playlist is empty. Add some suggestions below."
        />
      </div>

      {suggestions.length > 0 && (
        <Section title="Suggested for this playlist">
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((t) => (
              <li key={t.id} className="glass flex items-center gap-3 rounded-xl p-2">
                <CoverArt seed={t.coverSeed} genre={t.genre} alt="" className="size-11" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.artistName}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Add ${t.title} to playlist`}
                  onClick={() => {
                    dispatch(addToPlaylist({ playlistId: playlist.id, track: t }));
                    toast.success("Added", { description: t.title });
                  }}
                >
                  <Plus />
                </Button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <EditDialog
        key={`${playlist.id}-${editing}`}
        open={editing}
        onOpenChange={setEditing}
        name={playlist.name}
        description={playlist.description}
        onSave={(name, description) =>
          dispatch(renamePlaylist({ id: playlist.id, name, description }))
        }
      />

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete “{playlist.name}”?</DialogTitle>
            <DialogDescription>
              This removes the playlist from your library. Tracks stay in Liked Songs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                dispatch(deletePlaylist(playlist.id));
                toast(`Deleted “${playlist.name}”`);
                router.push("/library/");
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditDialog({
  open,
  onOpenChange,
  name: initialName,
  description: initialDescription,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  description: string;
  onSave: (name: string, description: string) => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(name, description);
            onOpenChange(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit details</DialogTitle>
          </DialogHeader>
          <Input
            aria-label="Playlist name"
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            aria-label="Description"
            value={description}
            maxLength={200}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
          <DialogFooter>
            <Button type="submit" disabled={!name.trim()}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
