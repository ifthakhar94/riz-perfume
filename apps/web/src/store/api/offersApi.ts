import type { ApiSuccess, OfferDto, OfferInput } from "@riz/shared";

import { baseApi } from "./baseApi";

export const offersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOffers: builder.query<OfferDto[], void>({
      query: () => ({ url: "/offers" }),
      transformResponse: (response: ApiSuccess<OfferDto[]>) => response.data,
      providesTags: ["Offer"],
    }),
    createOffer: builder.mutation<OfferDto, OfferInput>({
      query: (body) => ({ url: "/offers", method: "POST", body }),
      transformResponse: (response: ApiSuccess<OfferDto>) => response.data,
      invalidatesTags: ["Offer"],
    }),
    updateOffer: builder.mutation<OfferDto, { id: number; body: Partial<OfferInput> }>({
      query: ({ id, body }) => ({ url: `/offers/${id}`, method: "PATCH", body }),
      transformResponse: (response: ApiSuccess<OfferDto>) => response.data,
      invalidatesTags: ["Offer"],
    }),
    deleteOffer: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/offers/${id}`, method: "DELETE" }),
      invalidatesTags: ["Offer"],
    }),
  }),
});

export const {
  useGetOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} = offersApi;
