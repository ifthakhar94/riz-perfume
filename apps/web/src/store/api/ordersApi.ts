import type {
  ApiSuccess,
  DeliveryStatus,
  OrderDto,
  OrderListItemDto,
  OrderStatus,
  Paginated,
} from "@riz/shared";

import { baseApi } from "./baseApi";

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
}

export interface DeliveryUpdateInput {
  status?: DeliveryStatus;
  canceledReason?: string | null;
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<Paginated<OrderListItemDto>, OrderListParams | void>({
      query: (params) => ({ url: "/orders", params: params ?? {} }),
      transformResponse: (response: ApiSuccess<Paginated<OrderListItemDto>>) => response.data,
      providesTags: ["Order"],
    }),
    getOrder: builder.query<OrderDto, number>({
      query: (id) => ({ url: `/orders/${id}` }),
      transformResponse: (response: ApiSuccess<OrderDto>) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),
    updateOrderStatus: builder.mutation<OrderDto, { id: number; status: OrderStatus }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: ApiSuccess<OrderDto>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: "Order", id }, "Order"],
    }),
    updateOrderDelivery: builder.mutation<OrderDto, { id: number; body: DeliveryUpdateInput }>({
      query: ({ id, body }) => ({ url: `/orders/${id}/delivery`, method: "PATCH", body }),
      transformResponse: (response: ApiSuccess<OrderDto>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: "Order", id }, "Order"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderDeliveryMutation,
} = ordersApi;
