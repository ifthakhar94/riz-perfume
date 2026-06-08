import { In } from "typeorm";

import { DeliveryStatus, OrderStatus } from "../../common/enums";
import { AppDataSource } from "../../config/data-source";
import { CourierCharge } from "../../entities/courier-charge.entity";
import { DeliveryOrder } from "../../entities/delivery-order.entity";
import { OrderCost } from "../../entities/order-cost.entity";
import { OrderItem } from "../../entities/order-item.entity";
import { Order } from "../../entities/order.entity";
import { ProductVariantCost } from "../../entities/product-variant-cost.entity";
import { ProductVariant } from "../../entities/product-variant.entity";
import { AppError } from "../../utils/app-error";
import { applyOffersToOrder } from "../offers/offer-application.service";
import type { CreateOrderDto } from "./orders.validation";

const DETAIL_RELATIONS = {
  items: { productVariant: { size: true, type: true }, offerItems: true },
  delivery: true,
  cost: true,
  offerOrders: true,
};

const loadDetail = async (id: number): Promise<Order> => {
  const order = await AppDataSource.getRepository(Order).findOne({
    where: { id },
    relations: DETAIL_RELATIONS,
  });
  if (!order) throw AppError.notFound("Order not found");
  return order;
};

export interface ListOrdersParams {
  skip: number;
  take: number;
  status?: OrderStatus;
}

export const ordersService = {
  /** Place an order: snapshot prices, decrement stock, capture delivery + cost — atomically. */
  async create(dto: CreateOrderDto, userId: number | null): Promise<Order> {
    const id = await AppDataSource.transaction(async (manager) => {
      // Aggregate quantities per variant (handles duplicate lines).
      const qtyByVariant = new Map<number, number>();
      for (const item of dto.items) {
        qtyByVariant.set(
          item.productVariantId,
          (qtyByVariant.get(item.productVariantId) ?? 0) + item.quantity,
        );
      }
      const variantIds = [...qtyByVariant.keys()];

      const variants = await manager
        .getRepository(ProductVariant)
        .find({ where: { id: In(variantIds), isActive: true } });
      if (variants.length !== variantIds.length) {
        throw AppError.badRequest("One or more product variants are unavailable");
      }
      const variantById = new Map(variants.map((variant) => [variant.id, variant]));

      for (const [variantId, qty] of qtyByVariant) {
        const variant = variantById.get(variantId);
        if (!variant) throw AppError.badRequest("One or more product variants are unavailable");
        if (variant.stockQuantity < qty) {
          throw AppError.badRequest(`Insufficient stock for SKU ${variant.sku}`);
        }
      }

      const courier = await manager
        .getRepository(CourierCharge)
        .findOne({ where: { id: dto.courierChargeId } });
      if (!courier) throw AppError.badRequest("Invalid courier charge");

      // Latest non-deleted cost per variant (for the internal cost breakdown).
      const costRows = await manager
        .getRepository(ProductVariantCost)
        .find({ where: { productVariantId: In(variantIds) }, order: { createdAt: "DESC" } });
      const costByVariant = new Map<number, ProductVariantCost>();
      for (const row of costRows) {
        if (!costByVariant.has(row.productVariantId)) costByVariant.set(row.productVariantId, row);
      }

      const orderRepo = manager.getRepository(Order);
      const order = await orderRepo.save(
        orderRepo.create({
          userId,
          username: dto.username,
          email: dto.email,
          phone: dto.phone,
          district: dto.district,
          addressLine: dto.addressLine,
          status: OrderStatus.PENDING,
        }),
      );

      const itemRepo = manager.getRepository(OrderItem);
      const items: OrderItem[] = [];
      let rawMaterialCost = 0;
      let bottleCost = 0;
      for (const [variantId, qty] of qtyByVariant) {
        const variant = variantById.get(variantId);
        if (!variant) continue;
        items.push(
          itemRepo.create({
            orderId: order.id,
            productVariantId: variantId,
            quantity: qty,
            unitPrice: variant.price,
          }),
        );
        variant.stockQuantity -= qty;
        const cost = costByVariant.get(variantId);
        if (cost) {
          rawMaterialCost += cost.rawMaterialCost * qty;
          bottleCost += cost.bottleCost * qty;
        }
      }
      const savedItems = await itemRepo.save(items);
      await manager.getRepository(ProductVariant).save(variants);

      const deliveryRepo = manager.getRepository(DeliveryOrder);
      await deliveryRepo.save(
        deliveryRepo.create({
          orderId: order.id,
          courierChargeId: courier.id,
          courierCharge: courier.charge,
          status: DeliveryStatus.PENDING,
        }),
      );

      const costRepo = manager.getRepository(OrderCost);
      await costRepo.save(
        costRepo.create({
          orderId: order.id,
          rawMaterialCost,
          bottleCost,
          packagingCost: 0,
          deliveryCost: courier.charge,
        }),
      );

      // Auto-apply eligible offers (records offer_orders / offer_order_items).
      const lines = savedItems.map((item) => ({
        orderItemId: item.id,
        lineTotal: item.unitPrice * item.quantity,
      }));
      const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
      await applyOffersToOrder(manager, {
        orderId: order.id,
        subtotal,
        deliveryCost: courier.charge,
        lines,
        now: new Date(),
      });

      return order.id;
    });

    return loadDetail(id);
  },

  getById(id: number): Promise<Order> {
    return loadDetail(id);
  },

  async list(params: ListOrdersParams): Promise<{ items: Order[]; total: number }> {
    const [items, total] = await AppDataSource.getRepository(Order).findAndCount({
      where: params.status ? { status: params.status } : {},
      relations: { items: { offerItems: true }, delivery: true, offerOrders: true },
      order: { createdAt: "DESC" },
      skip: params.skip,
      take: params.take,
    });
    return { items, total };
  },

  /** Update order status. Cancelling restores stock and cancels the delivery. */
  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    await AppDataSource.transaction(async (manager) => {
      const order = await manager
        .getRepository(Order)
        .findOne({ where: { id }, relations: { items: true } });
      if (!order) throw AppError.notFound("Order not found");

      if (status === OrderStatus.CANCELED && order.status !== OrderStatus.CANCELED) {
        for (const item of order.items) {
          await manager.increment(
            ProductVariant,
            { id: item.productVariantId },
            "stockQuantity",
            item.quantity,
          );
        }
        await manager
          .getRepository(DeliveryOrder)
          .update({ orderId: id }, { status: DeliveryStatus.CANCELED, canceledAt: new Date() });
      }

      order.status = status;
      await manager.getRepository(Order).save(order);
    });
    return loadDetail(id);
  },

  async updateDelivery(
    orderId: number,
    dto: { status?: DeliveryStatus; canceledReason?: string | null },
  ): Promise<Order> {
    const repo = AppDataSource.getRepository(DeliveryOrder);
    const delivery = await repo.findOne({ where: { orderId } });
    if (!delivery) throw AppError.notFound("Delivery for this order was not found");

    if (dto.status !== undefined) {
      delivery.status = dto.status;
      if (dto.status === DeliveryStatus.DELIVERED) delivery.deliveredAt = new Date();
      if (dto.status === DeliveryStatus.CANCELED) delivery.canceledAt = new Date();
    }
    if (dto.canceledReason !== undefined) delivery.canceledReason = dto.canceledReason;
    await repo.save(delivery);

    return loadDetail(orderId);
  },
};
