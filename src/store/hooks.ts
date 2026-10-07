import { useDispatch, useSelector, useStore } from "react-redux";
import { useMemo } from "react";
import type { AppDispatch, AppStore, RootState } from "./index";
import type { Track } from "@/types/music";
import { DEMO_TRACKS_BY_ID } from "@/lib/mock/catalog";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

export const selectCurrentTrack = (s: RootState): Track | undefined =>
  s.player.queue[s.player.index];

/** Resolves track ids from the demo catalog or the Spotify track cache. */
export function useTracks(ids: string[]): Track[] {
  const cache = useAppSelector((s) => s.library.trackCache);
  return useMemo(
    () => ids.map((id) => DEMO_TRACKS_BY_ID[id] ?? cache[id]).filter((t): t is Track => Boolean(t)),
    [ids, cache],
  );
}

export const selectIsLiked = (id: string) => (s: RootState) => s.library.likedIds.includes(id);
