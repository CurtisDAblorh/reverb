"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BookOpen, Code2, Heart, Plus } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CoverArt } from "@/components/visualizer/CoverArt";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPanel } from "@/store/uiSlice";
import { Logo } from "./Logo";
import { NAV, isActive } from "./nav";

export function Sidebar() {
  const pathname = usePathname();
  const params = useSearchParams();
  const dispatch = useAppDispatch();
  const playlists = useAppSelector((s) => s.library.playlists);
  const likedCount = useAppSelector((s) => s.library.likedIds.length);
  const activePlaylist = pathname.startsWith("/playlist") ? params.get("id") : null;

  return (
    <aside className="glass hidden w-64 shrink-0 flex-col rounded-2xl lg:flex" aria-label="Sidebar">
      <Link href="/" className="px-5 pt-5 pb-4">
        <Logo />
      </Link>
      <nav className="px-3" aria-label="Main">
        <ul className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-accent"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon className="relative size-4" />
                  <span className="relative">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-6 flex items-center justify-between px-5">
        <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Playlists
        </h2>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Create playlist"
          onClick={() => dispatch(setPanel({ panel: "createPlaylist", open: true }))}
        >
          <Plus />
        </Button>
      </div>
      <ScrollArea className="mt-2 min-h-0 flex-1 px-3 pb-3">
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/library/?tab=liked"
              className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent/60"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 text-white">
                <Heart className="size-4 fill-current" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">Liked Songs</span>
                <span className="block text-xs text-muted-foreground">
                  {pluralize(likedCount, "track")}
                </span>
              </span>
            </Link>
          </li>
          {playlists.map((pl) => (
            <li key={pl.id}>
              <Link
                href={`/playlist/?id=${pl.id}`}
                className={cn(
                  "flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent/60",
                  activePlaylist === pl.id && "bg-accent/60",
                )}
              >
                <CoverArt seed={pl.coverSeed} genre="pop" alt="" className="size-10 rounded-lg" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{pl.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {pluralize(pl.trackIds.length, "track")}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="flex gap-1 border-t p-3 text-xs">
        <a
          href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/storybook/`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
        >
          <BookOpen className="size-3.5" /> Storybook
        </a>
        <a
          href="https://github.com/CurtisDAblorh/reverb"
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
        >
          <Code2 className="size-3.5" /> Source
        </a>
      </div>
    </aside>
  );
}
