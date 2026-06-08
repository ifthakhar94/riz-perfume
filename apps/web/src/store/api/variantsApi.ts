import type { ApiSuccess, ProductVariantDto, VariantUpsertInput } from "@riz/shared";

import { baseApi } from "./baseApi";

export const variantsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVariants: builder.query<ProductVariantDto[], number>({
      query: (productId) => ({ url: "/variants", params: { productId } }),
      transformResponse: (response: ApiSuccess<ProductVariantDto[]>) => response.data,
      providesTags: ["Variant"],
    }),
    createVariant: builder.mutation<ProductVariantDto, VariantUpsertInput & { productId: number }>({
      query: (body) => ({ url: "/variants", method: "POST", body }),
      transformResponse: (response: ApiSuccess<ProductVariantDto>) => response.data,
      invalidatesTags: ["Variant", "Product"],
    }),
    updateVariant: builder.mutation<
      ProductVariantDto,
      { id: number; body: Partial<VariantUpsertInput> }
    >({
      query: ({ id, body }) => ({ url: `/variants/${id}`, method: "PATCH", body }),
      transformResponse: (response: ApiSuccess<ProductVariantDto>) => response.data,
      invalidatesTags: ["Variant", "Product"],
    }),
    deleteVariant: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/variants/${id}`, method: "DELETE" }),
      invalidatesTags: ["Variant", "Product"],
    }),
  }),
});

export const {
  useGetVariantsQuery,
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
} = variantsApi;
