"use client";

import Link from "next/link";
import { Keyboard, LogOut, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMounted } from "@/hooks/useMounted";
import { beginLogin, isSpotifyConfigured } from "@/lib/spotify/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetProfileQuery } from "@/store/spotifyApi";
import { logout } from "@/store/authSlice";
import { setPanel } from "@/store/uiSlice";
import { Logo } from "./Logo";

function SpotifyGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="currentColor">
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.85-1.74-6.45-2.14-10.68-1.17a.75.75 0 1 1-.33-1.46c4.63-1.06 8.6-.6 11.77 1.34.36.22.47.69.25 1.04Zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.27-2-8.24-2.59-12.1-1.42a.94.94 0 1 1-.54-1.8c4.41-1.34 9.89-.69 13.62 1.6.44.27.58.85.31 1.3Zm.13-3.4C15.18 8.3 8.73 8.08 5 9.2a1.13 1.13 0 1 1-.65-2.16c4.28-1.3 11.39-1.05 15.9 1.62a1.13 1.13 0 0 1-1.15 1.96Z" />
    </svg>
  );
}

export function TopBar() {
  const dispatch = useAppDispatch();
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();
  const connected = useAppSelector((s) => Boolean(s.auth.token));
  const { data: profile } = useGetProfileQuery();

  const connect = () => {
    if (!isSpotifyConfigured()) {
      toast.info("Spotify isn't configured for this deployment", {
        description:
          "Set NEXT_PUBLIC_SPOTIFY_CLIENT_ID to enable sign-in. Demo mode has the full experience.",
      });
      return;
    }
    void beginLogin();
  };

  return (
    <header className="flex items-center gap-2">
      <Link href="/" className="lg:hidden" aria-label="Reverb home">
        <Logo className="text-lg [&>svg]:size-7" />
      </Link>
      <button
        type="button"
        onClick={() => dispatch(setPanel({ panel: "command", open: true }))}
        className="glass ml-auto flex h-10 items-center gap-3 rounded-full px-4 text-sm text-muted-foreground transition-colors hover:text-foreground sm:w-72 lg:ml-0"
        aria-label="Search and commands"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search tracks, playlists…</span>
        <kbd className="ml-auto hidden rounded-md border bg-muted px-1.5 font-mono text-[10px] sm:inline">
          Ctrl K
        </kbd>
      </button>

      <div className="flex items-center gap-1 lg:ml-auto">
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:inline-flex"
          aria-label="Keyboard shortcuts"
          onClick={() => dispatch(setPanel({ panel: "shortcuts", open: true }))}
        >
          <Keyboard />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {mounted && resolvedTheme === "light" ? <Moon /> : <Sun />}
        </Button>

        {mounted && connected && profile && !profile.demo ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" className="gap-2 rounded-full pr-3 pl-1" />}
            >
              <Avatar className="size-7">
                <AvatarImage src={profile.imageUrl} alt="" />
                <AvatarFallback>{profile.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-28 truncate sm:inline">{profile.name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Connected to Spotify</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => dispatch(logout())}>
                <LogOut /> Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={connect}
            className="gap-2 rounded-full bg-[#1DB954] text-black hover:bg-[#1ed760]"
          >
            <SpotifyGlyph />
            <span className="hidden sm:inline">Connect Spotify</span>
          </Button>
        )}
      </div>
    </header>
  );
}
