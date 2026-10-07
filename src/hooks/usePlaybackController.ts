"use client";

import { useEffect, useRef } from "react";
import { getAudioEngine } from "@/lib/audio/engine";
import { selectCurrentTrack, useAppDispatch, useAppSelector, useAppStore } from "@/store/hooks";
import { tick, trackEnded } from "@/store/playerSlice";
import { recordPlay } from "@/store/librarySlice";

const TICK_MS = 250;

/**
 * Bridges Redux player state to the audio engine and drives the playback clock.
 * Mounted once in the app shell.
 */
export function usePlaybackController() {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const track = useAppSelector(selectCurrentTrack);
  const isPlaying = useAppSelector((s) => s.player.isPlaying);
  const volume = useAppSelector((s) => (s.player.muted ? 0 : s.player.volume));
  const positionMs = useAppSelector((s) => s.player.positionMs);
  const lastRecorded = useRef<string | null>(null);
  const lastPosition = useRef(0);

  // Load the current track into the engine and record it in history once per start.
  useEffect(() => {
    const engine = getAudioEngine();
    if (!track) {
      engine.stop();
      return;
    }
    engine.load(track);
    if (isPlaying && lastRecorded.current !== `${track.id}:${store.getState().player.index}`) {
      lastRecorded.current = `${track.id}:${store.getState().player.index}`;
      dispatch(recordPlay({ track, playedAt: Date.now() }));
    }
  }, [track, isPlaying, dispatch, store]);

  useEffect(() => {
    const engine = getAudioEngine();
    if (!track) return;
    if (isPlaying) void engine.play(store.getState().player.positionMs);
    else engine.pause();
  }, [isPlaying, track, store]);

  useEffect(() => {
    getAudioEngine().setVolume(volume);
  }, [volume]);

  // Forward user seeks (jumps larger than a tick) to the engine.
  useEffect(() => {
    if (Math.abs(positionMs - lastPosition.current) > TICK_MS * 2)
      getAudioEngine().seek(positionMs);
    lastPosition.current = positionMs;
  }, [positionMs]);

  useEffect(() => {
    if (!isPlaying || !track) return;
    const id = setInterval(() => {
      const { positionMs: pos } = store.getState().player;
      if (pos + TICK_MS >= track.durationMs) {
        lastRecorded.current = null;
        dispatch(trackEnded());
      } else {
        dispatch(tick(TICK_MS));
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [isPlaying, track, dispatch, store]);
}
