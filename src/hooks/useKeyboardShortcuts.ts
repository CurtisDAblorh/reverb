"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppStore } from "@/store/hooks";
import {
  next,
  previous,
  seek,
  setVolume,
  togglePlay,
  toggleMute,
  toggleShuffle,
  cycleRepeat,
} from "@/store/playerSlice";
import { toggleLike } from "@/store/librarySlice";
import { setPanel, togglePanel } from "@/store/uiSlice";

export const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["Space"], label: "Play / pause" },
  { keys: ["Shift", "→"], label: "Next track" },
  { keys: ["Shift", "←"], label: "Previous track" },
  { keys: ["→"], label: "Seek forward 10s" },
  { keys: ["←"], label: "Seek back 10s" },
  { keys: ["↑"], label: "Volume up" },
  { keys: ["↓"], label: "Volume down" },
  { keys: ["M"], label: "Mute" },
  { keys: ["L"], label: "Like current track" },
  { keys: ["S"], label: "Toggle shuffle" },
  { keys: ["R"], label: "Cycle repeat" },
  { keys: ["F"], label: "Full-screen visualiser" },
  { keys: ["Q"], label: "Show queue" },
  { keys: ["Ctrl", "K"], label: "Command palette" },
  { keys: ["?"], label: "Show shortcuts" },
];

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

export function useKeyboardShortcuts() {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        dispatch(togglePanel("command"));
        return;
      }
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      // Let focused buttons and sliders handle their own keys.
      const role = (e.target as HTMLElement | null)?.getAttribute?.("role");
      if (role === "slider" && e.key.startsWith("Arrow")) return;

      const { player } = store.getState();
      const track = player.queue[player.index];
      const handlers: Record<string, () => void> = {
        " ": () => dispatch(togglePlay()),
        ArrowRight: () =>
          e.shiftKey ? dispatch(next()) : dispatch(seek(player.positionMs + 10_000)),
        ArrowLeft: () =>
          e.shiftKey ? dispatch(previous()) : dispatch(seek(player.positionMs - 10_000)),
        ArrowUp: () => dispatch(setVolume(player.volume + 0.1)),
        ArrowDown: () => dispatch(setVolume(player.volume - 0.1)),
        m: () => dispatch(toggleMute()),
        l: () => track && dispatch(toggleLike(track)),
        s: () => dispatch(toggleShuffle()),
        r: () => dispatch(cycleRepeat()),
        f: () => track && dispatch(togglePanel("nowPlaying")),
        q: () => dispatch(togglePanel("queue")),
        "?": () => dispatch(setPanel({ panel: "shortcuts", open: true })),
      };
      const handler = handlers[e.key.length === 1 ? e.key.toLowerCase() : e.key] ?? handlers[e.key];
      if (!handler) return;
      if (e.key === " " && (e.target as HTMLElement)?.closest?.("button, a, [role=button]")) return;
      e.preventDefault();
      handler();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, store]);
}
