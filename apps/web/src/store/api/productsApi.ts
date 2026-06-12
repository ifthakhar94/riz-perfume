import type {
  ApiSuccess,
  Paginated,
  ProductDetailDto,
  ProductListItemDto,
  ProductUpsertInput,
} from "@riz/shared";

import { baseApi } from "./baseApi";

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  /** Category slug filter (e.g. "wood") — preferred by the storefront. */
  category?: string;
  includeInactive?: boolean;
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Paginated<ProductListItemDto>, ProductListParams | void>({
      query: (params) => ({ url: "/products", params: params ?? {} }),
      transformResponse: (response: ApiSuccess<Paginated<ProductListItemDto>>) => response.data,
      providesTags: ["Product"],
    }),

    getProductById: builder.query<ProductDetailDto, number>({
      query: (id) => `/products/by-id/${id}`,
      transformResponse: (response: ApiSuccess<ProductDetailDto>) => response.data,
      providesTags: ["Product"],
    }),

    /** Public product detail (incl. variants) — used by the storefront. */
    getProductBySlug: builder.query<ProductDetailDto, string>({
      query: (slug) => `/products/${encodeURIComponent(slug)}`,
      transformResponse: (response: ApiSuccess<ProductDetailDto>) => response.data,
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation<ProductDetailDto, ProductUpsertInput>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      transformResponse: (response: ApiSuccess<ProductDetailDto>) => response.data,
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation<
      ProductDetailDto,
      { id: number; body: Partial<ProductUpsertInput> }
    >({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: "PATCH", body }),
      transformResponse: (response: ApiSuccess<ProductDetailDto>) => response.data,
      invalidatesTags: ["Product"],
    }),

    deleteProduct: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useLazyGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
