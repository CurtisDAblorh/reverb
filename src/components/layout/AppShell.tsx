"use client";

import { Suspense, type ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { GenreBackdrop } from "@/components/visualizer/GenreBackdrop";
import { PlayerBar } from "@/components/player/PlayerBar";
import { QueueSheet } from "@/components/player/QueueSheet";
import { NowPlayingOverlay } from "@/components/player/NowPlayingOverlay";
import { CommandMenu } from "@/components/command/CommandMenu";
import { ShortcutsDialog } from "@/components/command/ShortcutsDialog";
import { CreatePlaylistDialog } from "@/components/playlists/CreatePlaylistDialog";
import { usePlaybackController } from "@/hooks/usePlaybackController";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }: { children: ReactNode }) {
  usePlaybackController();
  useKeyboardShortcuts();

  return (
    <TooltipProvider>
      <GenreBackdrop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="flex h-dvh flex-col gap-2 p-2">
        <div className="flex min-h-0 flex-1 gap-2">
          <Suspense fallback={<aside className="glass hidden w-64 rounded-2xl lg:block" />}>
            <Sidebar />
          </Suspense>
          <div className="glass flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl">
            <div className="px-4 pt-4 sm:px-6">
              <TopBar />
            </div>
            <main id="main" className="min-h-0 flex-1 overflow-y-auto px-4 pt-6 pb-10 sm:px-6">
              {children}
            </main>
          </div>
        </div>
        <PlayerBar />
        <MobileNav />
      </div>
      <QueueSheet />
      <NowPlayingOverlay />
      <CommandMenu />
      <ShortcutsDialog />
      <CreatePlaylistDialog />
      <Toaster position="top-center" richColors />
    </TooltipProvider>
  );
}
