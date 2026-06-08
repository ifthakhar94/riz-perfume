import { LessThanOrEqual, MoreThanOrEqual, type EntityManager } from "typeorm";

import { OfferType } from "../../common/enums";
import { Offer } from "../../entities/offer.entity";
import { OfferOrderItem } from "../../entities/offer-order-item.entity";
import { OfferOrder } from "../../entities/offer-order.entity";

export interface OrderLineForOffers {
  orderItemId: number;
  lineTotal: number;
}

export interface AppliedOffersResult {
  orderDiscount: number;
  deliveryDiscount: number;
  itemDiscount: number;
  totalDiscount: number;
}

const round2 = (value: number) => Math.round(value * 100) / 100;
const capped = (amount: number, cap: number | null) =>
  cap === null ? amount : Math.min(amount, cap);

/**
 * Automatically applies eligible active offers to an order at checkout and
 * records offer_orders / offer_order_items. Policy (deterministic, no
 * over-stacking; easy to tune later):
 *   - FREE_DELIVERY: waives the delivery charge (first eligible).
 *   - PRODUCT_PERCENT: best percentage, applied per line item (capped per item).
 *   - ORDER_PERCENT / FLAT_DISCOUNT_TK: the single best order-level discount,
 *     computed on the subtotal after item discounts.
 * Eligibility = active + within [startDate, endDate] + subtotal ≥ minOrderAmount.
 */
export const applyOffersToOrder = async (
  manager: EntityManager,
  params: {
    orderId: number;
    subtotal: number;
    deliveryCost: number;
    lines: OrderLineForOffers[];
    now: Date;
  },
): Promise<AppliedOffersResult> => {
  const { orderId, subtotal, deliveryCost, lines, now } = params;

  const offers = await manager.getRepository(Offer).find({
    where: { isActive: true, startDate: LessThanOrEqual(now), endDate: MoreThanOrEqual(now) },
  });
  const eligible = offers.filter(
    (offer) => offer.minOrderAmount === null || subtotal >= offer.minOrderAmount,
  );

  const ooRepo = manager.getRepository(OfferOrder);
  const ooiRepo = manager.getRepository(OfferOrderItem);
  const offerOrders: OfferOrder[] = [];
  const offerItems: OfferOrderItem[] = [];

  // Free delivery
  let deliveryDiscount = 0;
  const freeDelivery = eligible.find((offer) => offer.type === OfferType.FREE_DELIVERY);
  if (freeDelivery && deliveryCost > 0) {
    deliveryDiscount = deliveryCost;
    offerOrders.push(
      ooRepo.create({
        orderId,
        offerId: freeDelivery.id,
        offerType: OfferType.FREE_DELIVERY,
        discountAmount: round2(deliveryDiscount),
      }),
    );
  }

  // Product percent — best value, applied per line item
  let itemDiscount = 0;
  const bestProduct = eligible
    .filter((offer) => offer.type === OfferType.PRODUCT_PERCENT)
    .sort((a, b) => b.value - a.value)[0];
  if (bestProduct) {
    for (const line of lines) {
      const discount = round2(
        capped((line.lineTotal * bestProduct.value) / 100, bestProduct.discountUpToAmount),
      );
      if (discount > 0) {
        itemDiscount += discount;
        offerItems.push(
          ooiRepo.create({
            orderItemId: line.orderItemId,
            offerId: bestProduct.id,
            offerType: OfferType.PRODUCT_PERCENT,
            discountAmount: discount,
          }),
        );
      }
    }
  }
  itemDiscount = round2(itemDiscount);

  // Best single order-level discount
  const remaining = Math.max(0, subtotal - itemDiscount);
  let orderDiscount = 0;
  let bestOrderOffer: Offer | undefined;
  for (const offer of eligible) {
    let discount = 0;
    if (offer.type === OfferType.ORDER_PERCENT) {
      discount = capped((remaining * offer.value) / 100, offer.discountUpToAmount);
    } else if (offer.type === OfferType.FLAT_DISCOUNT_TK) {
      discount = capped(Math.min(offer.value, remaining), offer.discountUpToAmount);
    } else {
      continue;
    }
    if (discount > orderDiscount) {
      orderDiscount = discount;
      bestOrderOffer = offer;
    }
  }
  orderDiscount = round2(orderDiscount);
  if (bestOrderOffer && orderDiscount > 0) {
    offerOrders.push(
      ooRepo.create({
        orderId,
        offerId: bestOrderOffer.id,
        offerType: bestOrderOffer.type,
        discountAmount: orderDiscount,
      }),
    );
  }

  if (offerOrders.length > 0) await ooRepo.save(offerOrders);
  if (offerItems.length > 0) await ooiRepo.save(offerItems);

  return {
    orderDiscount,
    deliveryDiscount: round2(deliveryDiscount),
    itemDiscount,
    totalDiscount: round2(orderDiscount + deliveryDiscount + itemDiscount),
  };
};
