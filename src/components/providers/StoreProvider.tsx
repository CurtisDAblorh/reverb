"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore, type RootState } from "@/store";
import { hydrateLibrary } from "@/store/librarySlice";
import { hydratePlayer } from "@/store/playerSlice";
import { setToken } from "@/store/authSlice";
import { loadPersisted, savePersisted } from "@/store/persistence";
import { seedHistory } from "@/lib/mock/catalog";

/**
 * Creates one store per browser session. Persisted state is loaded after mount
 * so the statically exported HTML always matches the first client render.
 */
export function StoreProvider({
  children,
  preloadedState,
  skipHydration = false,
}: {
  children: ReactNode;
  preloadedState?: Partial<RootState>;
  skipHydration?: boolean;
}) {
  const [store] = useState<AppStore>(() => makeStore(preloadedState));

  useEffect(() => {
    if (skipHydration) return;
    const saved = loadPersisted();
    if (saved) {
      store.dispatch(hydrateLibrary(saved.library));
      store.dispatch(hydratePlayer(saved.player));
      if (saved.token) store.dispatch(setToken(saved.token));
    } else {
      store.dispatch(hydrateLibrary({ history: seedHistory(Date.now()) }));
    }
    // Saves are debounced; flush when the page is hidden so quick navigations don't lose changes.
    const flush = () => {
      if (store.getState().library.hydrated) savePersisted(store.getState());
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [store, skipHydration]);

  return <Provider store={store}>{children}</Provider>;
}
