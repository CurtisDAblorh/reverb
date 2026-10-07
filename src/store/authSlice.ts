import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SpotifyToken } from "@/lib/spotify/auth";

export type AuthState = {
  token: SpotifyToken | null;
};

const authSlice = createSlice({
  name: "auth",
  initialState: { token: null } as AuthState,
  reducers: {
    setToken(state, action: PayloadAction<SpotifyToken | null>) {
      state.token = action.payload;
    },
    logout(state) {
      state.token = null;
    },
  },
});

export const { setToken, logout } = authSlice.actions;
export default authSlice.reducer;
