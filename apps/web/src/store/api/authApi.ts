import type { ApiSuccess, AuthResult, LoginInput, PublicUser } from "@riz/shared";

import { clearCredentials, setCredentials, setUser } from "@/store/auth/authSlice";
import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResult, LoginInput>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      transformResponse: (response: ApiSuccess<AuthResult>) => response.data,
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        dispatch(setCredentials({ accessToken: data.accessToken, user: data.user }));
      },
      invalidatesTags: ["Auth"],
    }),

    getMe: builder.query<PublicUser, void>({
      query: () => "/auth/me",
      transformResponse: (response: ApiSuccess<PublicUser>) => response.data,
      providesTags: ["Auth"],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch {
          // 401s are handled by the reauth flow / route guard.
        }
      },
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearCredentials());
        }
      },
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery, useLogoutMutation } = authApi;
