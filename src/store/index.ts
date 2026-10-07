import { combineReducers, configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import player from "./playerSlice";
import library from "./librarySlice";
import auth, { logout, setToken } from "./authSlice";
import ui from "./uiSlice";
import { spotifyApi } from "./spotifyApi";
import { savePersisted } from "./persistence";

const rootReducer = combineReducers({
  player,
  library,
  auth,
  ui,
  [spotifyApi.reducerPath]: spotifyApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function makeStore(preloadedState?: Partial<RootState>) {
  const listener = createListenerMiddleware();

  // Persist the library, player preferences and session after any change, debounced.
  let timer: ReturnType<typeof setTimeout> | undefined;
  listener.startListening({
    predicate: (_action, current, previous) => {
      const c = current as RootState;
      const p = previous as RootState;
      return (
        c.library !== p.library ||
        c.auth !== p.auth ||
        c.player.volume !== p.player.volume ||
        c.player.shuffle !== p.player.shuffle ||
        c.player.repeat !== p.player.repeat
      );
    },
    effect: (_action, api) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const state = api.getState() as RootState;
        if (state.library.hydrated) savePersisted(state);
      }, 300);
    },
  });

  // Refetch everything when the Spotify session changes.
  listener.startListening({
    predicate: (action) => setToken.match(action) || logout.match(action),
    effect: (_action, api) => {
      api.dispatch(spotifyApi.util.invalidateTags(["Session"]));
    },
  });

  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) =>
      getDefault().prepend(listener.middleware).concat(spotifyApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
