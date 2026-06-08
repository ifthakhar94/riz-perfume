import type { ApiSuccess, CategoryDto, SizeDto, TypeDto } from "@riz/shared";

import { baseApi } from "./baseApi";

export interface CategoryInput {
  name: string;
  isActive?: boolean;
}

export interface NamedInput {
  name: string;
}

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ---- Categories ----
    getCategories: builder.query<CategoryDto[], { includeInactive?: boolean } | void>({
      query: (params) => ({ url: "/categories", params: params ?? {} }),
      transformResponse: (response: ApiSuccess<CategoryDto[]>) => response.data,
      providesTags: ["Category"],
    }),
    createCategory: builder.mutation<CategoryDto, CategoryInput>({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      transformResponse: (response: ApiSuccess<CategoryDto>) => response.data,
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation<CategoryDto, { id: number; body: Partial<CategoryInput> }>({
      query: ({ id, body }) => ({ url: `/categories/${id}`, method: "PATCH", body }),
      transformResponse: (response: ApiSuccess<CategoryDto>) => response.data,
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Category"],
    }),

    // ---- Sizes ----
    getSizes: builder.query<SizeDto[], void>({
      query: () => "/sizes",
      transformResponse: (response: ApiSuccess<SizeDto[]>) => response.data,
      providesTags: ["Size"],
    }),
    createSize: builder.mutation<SizeDto, NamedInput>({
      query: (body) => ({ url: "/sizes", method: "POST", body }),
      transformResponse: (response: ApiSuccess<SizeDto>) => response.data,
      invalidatesTags: ["Size"],
    }),
    updateSize: builder.mutation<SizeDto, { id: number; body: NamedInput }>({
      query: ({ id, body }) => ({ url: `/sizes/${id}`, method: "PATCH", body }),
      transformResponse: (response: ApiSuccess<SizeDto>) => response.data,
      invalidatesTags: ["Size"],
    }),
    deleteSize: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/sizes/${id}`, method: "DELETE" }),
      invalidatesTags: ["Size"],
    }),

    // ---- Types ----
    getTypes: builder.query<TypeDto[], void>({
      query: () => "/types",
      transformResponse: (response: ApiSuccess<TypeDto[]>) => response.data,
      providesTags: ["Type"],
    }),
    createType: builder.mutation<TypeDto, NamedInput>({
      query: (body) => ({ url: "/types", method: "POST", body }),
      transformResponse: (response: ApiSuccess<TypeDto>) => response.data,
      invalidatesTags: ["Type"],
    }),
    updateType: builder.mutation<TypeDto, { id: number; body: NamedInput }>({
      query: ({ id, body }) => ({ url: `/types/${id}`, method: "PATCH", body }),
      transformResponse: (response: ApiSuccess<TypeDto>) => response.data,
      invalidatesTags: ["Type"],
    }),
    deleteType: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/types/${id}`, method: "DELETE" }),
      invalidatesTags: ["Type"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetSizesQuery,
  useCreateSizeMutation,
  useUpdateSizeMutation,
  useDeleteSizeMutation,
  useGetTypesQuery,
  useCreateTypeMutation,
  useUpdateTypeMutation,
  useDeleteTypeMutation,
} = catalogApi;
