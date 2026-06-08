import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import type { ApiSuccess, AuthResult } from "@riz/shared";

import { env } from "@/lib/env";
import { clearCredentials, setCredentials, type AuthState } from "@/store/auth/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: AuthState }).auth.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

/**
 * Wraps the base query with transparent token refresh: on a 401 it calls
 * `/auth/refresh` (using the httpOnly refresh cookie) once, stores the new
 * access token, and retries the original request. If refresh fails the session
 * is cleared.
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const url = typeof args === "string" ? args : args.url;
  if (result.error?.status === 401 && url !== "/auth/refresh" && url !== "/auth/login") {
    const refresh = await rawBaseQuery({ url: "/auth/refresh", method: "POST" }, api, extraOptions);
    const refreshData = refresh.data as ApiSuccess<AuthResult> | undefined;

    if (refreshData?.success) {
      api.dispatch(
        setCredentials({
          accessToken: refreshData.data.accessToken,
          user: refreshData.data.user,
        }),
      );
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "Product",
    "Category",
    "Size",
    "Type",
    "Variant",
    "VariantCost",
    "CourierCharge",
    "ExpenseCategory",
    "Expense",
    "Investment",
    "Order",
    "Offer",
    "User",
  ],
  endpoints: () => ({}),
});
