import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Panel = "nowPlaying" | "command" | "shortcuts" | "queue" | "createPlaylist";

export type UiState = Record<Panel, boolean>;

const initialState: UiState = {
  nowPlaying: false,
  command: false,
  shortcuts: false,
  queue: false,
  createPlaylist: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setPanel(state, action: PayloadAction<{ panel: Panel; open: boolean }>) {
      state[action.payload.panel] = action.payload.open;
    },
    togglePanel(state, action: PayloadAction<Panel>) {
      state[action.payload] = !state[action.payload];
    },
  },
});

export const { setPanel, togglePanel } = uiSlice.actions;
export default uiSlice.reducer;
