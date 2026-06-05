import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { ApiResponse, HealthStatus } from "@riz/shared";

import { env } from "@/lib/env";

/**
 * Central RTK Query API slice. Feature endpoints are added via `injectEndpoints`
 * in their own files to keep this slice lean and code-split friendly.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: env.NEXT_PUBLIC_API_URL,
    credentials: "include",
  }),
  tagTypes: ["Health"],
  endpoints: (builder) => ({
    getHealth: builder.query<ApiResponse<HealthStatus>, void>({
      query: () => "/health",
      providesTags: ["Health"],
    }),
  }),
});

export const { useGetHealthQuery } = baseApi;
