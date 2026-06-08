import type {
  AppliedOfferDto,
  OrderDeliveryDto,
  OrderDto,
  OrderItemDto,
  OrderListItemDto,
} from "@riz/shared";

import type { DeliveryOrder } from "../../entities/delivery-order.entity";
import type { OrderItem } from "../../entities/order-item.entity";
import type { Order } from "../../entities/order.entity";

const round2 = (value: number) => Math.round(value * 100) / 100;

const toItemDto = (item: OrderItem): OrderItemDto => ({
  id: item.id,
  productVariantId: item.productVariantId,
  quantity: item.quantity,
  unitPrice: item.unitPrice,
  lineTotal: item.unitPrice * item.quantity,
  sku: item.productVariant?.sku,
  sizeName: item.productVariant?.size?.name,
  typeName: item.productVariant?.type?.name,
});

const toDeliveryDto = (delivery: DeliveryOrder): OrderDeliveryDto => ({
  courierChargeId: delivery.courierChargeId,
  courierCharge: delivery.courierCharge,
  status: delivery.status,
  deliveredAt: delivery.deliveredAt?.toISOString() ?? null,
  canceledAt: delivery.canceledAt?.toISOString() ?? null,
  canceledReason: delivery.canceledReason,
});

export const toOrderDto = (order: Order, opts: { includeCost: boolean }): OrderDto => {
  const items = (order.items ?? []).map(toItemDto);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryTotal = order.delivery ? order.delivery.courierCharge : 0;
  const cost = order.cost;

  const orderOffers: AppliedOfferDto[] = (order.offerOrders ?? []).map((offerOrder) => ({
    offerId: offerOrder.offerId,
    offerType: offerOrder.offerType,
    scope: "order" as const,
    discountAmount: offerOrder.discountAmount,
  }));
  const itemOffers: AppliedOfferDto[] = (order.items ?? []).flatMap((item) =>
    (item.offerItems ?? []).map((offerItem) => ({
      offerId: offerItem.offerId,
      offerType: offerItem.offerType,
      scope: "item" as const,
      orderItemId: offerItem.orderItemId,
      discountAmount: offerItem.discountAmount,
    })),
  );
  const appliedOffers = [...orderOffers, ...itemOffers];
  const discountTotal = round2(appliedOffers.reduce((sum, offer) => sum + offer.discountAmount, 0));

  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    customer: {
      username: order.username,
      email: order.email,
      phone: order.phone,
      district: order.district,
      addressLine: order.addressLine,
    },
    items,
    delivery: order.delivery ? toDeliveryDto(order.delivery) : null,
    cost:
      opts.includeCost && cost
        ? {
            rawMaterialCost: cost.rawMaterialCost,
            bottleCost: cost.bottleCost,
            packagingCost: cost.packagingCost,
            deliveryCost: cost.deliveryCost,
            totalCost:
              cost.rawMaterialCost + cost.bottleCost + cost.packagingCost + cost.deliveryCost,
          }
        : undefined,
    subtotal,
    deliveryTotal,
    discountTotal,
    appliedOffers,
    total: Math.max(0, round2(subtotal + deliveryTotal - discountTotal)),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
};

export const toOrderListItemDto = (order: Order): OrderListItemDto => {
  const items = order.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const deliveryTotal = order.delivery ? order.delivery.courierCharge : 0;
  const orderDiscount = (order.offerOrders ?? []).reduce(
    (sum, offer) => sum + offer.discountAmount,
    0,
  );
  const itemDiscount = items.reduce(
    (sum, item) =>
      sum + (item.offerItems ?? []).reduce((acc, offer) => acc + offer.discountAmount, 0),
    0,
  );
  const discountTotal = round2(orderDiscount + itemDiscount);
  return {
    id: order.id,
    customerName: order.username,
    status: order.status,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    total: Math.max(0, round2(subtotal + deliveryTotal - discountTotal)),
    createdAt: order.createdAt.toISOString(),
  };
};
