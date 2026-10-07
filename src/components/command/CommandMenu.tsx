"use client";

import { useRouter } from "next/navigation";
import {
  BarChart3,
  Home,
  Keyboard,
  Library,
  ListMusic,
  Moon,
  Pause,
  Play,
  Plus,
  Search,
  Shuffle,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { CoverArt } from "@/components/visualizer/CoverArt";
import { DEMO_TRACKS } from "@/lib/mock/catalog";
import { GENRES, GENRE_IDS } from "@/lib/genres";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { playTrack, togglePlay, toggleShuffle } from "@/store/playerSlice";
import { setPanel } from "@/store/uiSlice";

export function CommandMenu() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const open = useAppSelector((s) => s.ui.command);
  const playlists = useAppSelector((s) => s.library.playlists);
  const isPlaying = useAppSelector((s) => s.player.isPlaying);

  const close = () => dispatch(setPanel({ panel: "command", open: false }));
  const run = (fn: () => void) => () => {
    fn();
    close();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(o) => dispatch(setPanel({ panel: "command", open: o }))}
      title="Command palette"
      description="Search tracks, playlists and actions"
    >
      {/* This shadcn style expects an explicit <Command> root inside the dialog. */}
      <Command>
        <CommandInput placeholder="Type a track, artist, genre or command…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Tracks">
            {DEMO_TRACKS.map((t) => (
              <CommandItem
                key={t.id}
                value={`${t.title} ${t.artistName} ${GENRES[t.genre].label}`}
                onSelect={run(() => dispatch(playTrack({ track: t, queue: DEMO_TRACKS })))}
              >
                <CoverArt seed={t.coverSeed} genre={t.genre} alt="" className="size-7 rounded" />
                <span className="truncate">{t.title}</span>
                <span className="truncate text-muted-foreground">· {t.artistName}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Playlists">
            {playlists.map((pl) => (
              <CommandItem
                key={pl.id}
                value={`playlist ${pl.name}`}
                onSelect={run(() => router.push(`/playlist/?id=${pl.id}`))}
              >
                <ListMusic /> {pl.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Genres">
            {GENRE_IDS.map((g) => (
              <CommandItem
                key={g}
                value={`genre ${GENRES[g].label}`}
                onSelect={run(() => router.push(`/search/?genre=${encodeURIComponent(g)}`))}
              >
                <span
                  className="size-3 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${GENRES[g].colors.join(",")})` }}
                />
                {GENRES[g].label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem onSelect={run(() => dispatch(togglePlay()))}>
              {isPlaying ? <Pause /> : <Play />} {isPlaying ? "Pause" : "Resume"} playback
              <CommandShortcut>Space</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={run(() => dispatch(toggleShuffle()))}>
              <Shuffle /> Toggle shuffle <CommandShortcut>S</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={run(() => dispatch(setPanel({ panel: "createPlaylist", open: true })))}
            >
              <Plus /> Create playlist
            </CommandItem>
            <CommandItem
              onSelect={run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}
            >
              <Moon /> Toggle theme
            </CommandItem>
            <CommandItem
              onSelect={run(() => dispatch(setPanel({ panel: "shortcuts", open: true })))}
            >
              <Keyboard /> Keyboard shortcuts <CommandShortcut>?</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Navigate">
            <CommandItem onSelect={run(() => router.push("/"))}>
              <Home /> Home
            </CommandItem>
            <CommandItem onSelect={run(() => router.push("/search/"))}>
              <Search /> Search
            </CommandItem>
            <CommandItem onSelect={run(() => router.push("/library/"))}>
              <Library /> Library
            </CommandItem>
            <CommandItem onSelect={run(() => router.push("/stats/"))}>
              <BarChart3 /> Listening stats
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
