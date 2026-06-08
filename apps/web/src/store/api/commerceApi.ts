import type {
  ApiSuccess,
  CourierChargeDto,
  CourierZone,
  DeliveryType,
  ProductVariantCostDto,
} from "@riz/shared";

import { baseApi } from "./baseApi";

export interface CourierChargeInput {
  courier: string;
  zone: CourierZone;
  deliveryType: DeliveryType;
  charge: number;
  quantityToMultiplyCharge?: number;
}

export interface VariantCostInput {
  productVariantId: number;
  rawMaterialCost: number;
  bottleCost: number;
}

export const commerceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ---- Courier charges (public read, admin write) ----
    getCourierCharges: builder.query<
      CourierChargeDto[],
      { zone?: CourierZone; deliveryType?: DeliveryType } | void
    >({
      query: (params) => ({ url: "/courier-charges", params: params ?? {} }),
      transformResponse: (response: ApiSuccess<CourierChargeDto[]>) => response.data,
      providesTags: ["CourierCharge"],
    }),
    createCourierCharge: builder.mutation<CourierChargeDto, CourierChargeInput>({
      query: (body) => ({ url: "/courier-charges", method: "POST", body }),
      transformResponse: (response: ApiSuccess<CourierChargeDto>) => response.data,
      invalidatesTags: ["CourierCharge"],
    }),
    updateCourierCharge: builder.mutation<
      CourierChargeDto,
      { id: number; body: Partial<CourierChargeInput> }
    >({
      query: ({ id, body }) => ({ url: `/courier-charges/${id}`, method: "PATCH", body }),
      transformResponse: (response: ApiSuccess<CourierChargeDto>) => response.data,
      invalidatesTags: ["CourierCharge"],
    }),
    deleteCourierCharge: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/courier-charges/${id}`, method: "DELETE" }),
      invalidatesTags: ["CourierCharge"],
    }),

    // ---- Variant costs (admin only) ----
    getVariantCosts: builder.query<ProductVariantCostDto[], number>({
      query: (productVariantId) => ({ url: "/variant-costs", params: { productVariantId } }),
      transformResponse: (response: ApiSuccess<ProductVariantCostDto[]>) => response.data,
      providesTags: ["VariantCost"],
    }),
    createVariantCost: builder.mutation<ProductVariantCostDto, VariantCostInput>({
      query: (body) => ({ url: "/variant-costs", method: "POST", body }),
      transformResponse: (response: ApiSuccess<ProductVariantCostDto>) => response.data,
      invalidatesTags: ["VariantCost"],
    }),
    updateVariantCost: builder.mutation<
      ProductVariantCostDto,
      { id: number; body: { rawMaterialCost?: number; bottleCost?: number } }
    >({
      query: ({ id, body }) => ({ url: `/variant-costs/${id}`, method: "PATCH", body }),
      transformResponse: (response: ApiSuccess<ProductVariantCostDto>) => response.data,
      invalidatesTags: ["VariantCost"],
    }),
    deleteVariantCost: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/variant-costs/${id}`, method: "DELETE" }),
      invalidatesTags: ["VariantCost"],
    }),
  }),
});

export const {
  useGetCourierChargesQuery,
  useCreateCourierChargeMutation,
  useUpdateCourierChargeMutation,
  useDeleteCourierChargeMutation,
  useGetVariantCostsQuery,
  useCreateVariantCostMutation,
  useUpdateVariantCostMutation,
  useDeleteVariantCostMutation,
} = commerceApi;
