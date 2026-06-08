import { configureStore } from "@reduxjs/toolkit";

import { baseApi } from "./api/baseApi";
import { authReducer } from "./auth/authSlice";

/**
 * Store factory. In the Next.js App Router we create a fresh store per request
 * (server) and once per client, rather than using a global singleton.
 */
export const makeStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
