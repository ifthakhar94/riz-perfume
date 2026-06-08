import type { Request, Response } from "express";

import type { ApiSuccess, OrderDto, OrderListItemDto, Paginated } from "@riz/shared";

import type { OrderStatus } from "../../common/enums";
import { buildPaginated, getPageParams } from "../../common/http/pagination";
import { toOrderDto, toOrderListItemDto } from "./order.mapper";
import { ordersService } from "./orders.service";

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await ordersService.create(req.body, req.user?.id ?? null);
  const body: ApiSuccess<OrderDto> = {
    success: true,
    data: toOrderDto(order, { includeCost: false }),
  };
  res.status(201).json(body);
};

export const listOrders = async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize, skip, take } = getPageParams(req.query);
  const { items, total } = await ordersService.list({
    skip,
    take,
    status: typeof req.query.status === "string" ? (req.query.status as OrderStatus) : undefined,
  });
  const body: ApiSuccess<Paginated<OrderListItemDto>> = {
    success: true,
    data: buildPaginated(items.map(toOrderListItemDto), total, page, pageSize),
  };
  res.status(200).json(body);
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await ordersService.getById(Number(req.params.id));
  res.status(200).json({ success: true, data: toOrderDto(order, { includeCost: true }) });
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const order = await ordersService.updateStatus(Number(req.params.id), req.body.status);
  res.status(200).json({ success: true, data: toOrderDto(order, { includeCost: true }) });
};

export const updateOrderDelivery = async (req: Request, res: Response): Promise<void> => {
  const order = await ordersService.updateDelivery(Number(req.params.id), req.body);
  res.status(200).json({ success: true, data: toOrderDto(order, { includeCost: true }) });
};
