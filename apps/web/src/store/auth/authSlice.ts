import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { PublicUser } from "@riz/shared";

export interface AuthState {
  accessToken: string | null;
  user: PublicUser | null;
  status: "idle" | "authenticated" | "unauthenticated";
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string; user: PublicUser }>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.status = "authenticated";
    },
    setUser: (state, action: PayloadAction<PublicUser>) => {
      state.user = action.payload;
      state.status = "authenticated";
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.user = null;
      state.status = "unauthenticated";
    },
  },
});

export const { setCredentials, setUser, clearCredentials } = authSlice.actions;
export const authReducer = authSlice.reducer;
