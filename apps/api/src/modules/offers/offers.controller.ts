import type { Request, Response } from "express";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";

import { AppDataSource } from "../../config/data-source";
import { Offer } from "../../entities/offer.entity";
import { AppError } from "../../utils/app-error";

const repo = () => AppDataSource.getRepository(Offer);

export const listOffers = async (_req: Request, res: Response): Promise<void> => {
  const offers = await repo().find({ order: { createdAt: "DESC" } });
  res.status(200).json({ success: true, data: offers });
};

export const listActiveOffers = async (_req: Request, res: Response): Promise<void> => {
  const now = new Date();
  const offers = await repo().find({
    where: { isActive: true, startDate: LessThanOrEqual(now), endDate: MoreThanOrEqual(now) },
    order: { createdAt: "DESC" },
  });
  res.status(200).json({ success: true, data: offers });
};

export const createOffer = async (req: Request, res: Response): Promise<void> => {
  const body = req.body;
  const offer = await repo().save(
    repo().create({
      name: body.name,
      type: body.type,
      value: body.value,
      minOrderAmount: body.minOrderAmount ?? null,
      discountUpToAmount: body.discountUpToAmount ?? null,
      isActive: body.isActive ?? true,
      startDate: body.startDate,
      endDate: body.endDate,
    }),
  );
  res.status(201).json({ success: true, data: offer });
};

export const updateOffer = async (req: Request, res: Response): Promise<void> => {
  const offer = await repo().findOne({ where: { id: Number(req.params.id) } });
  if (!offer) throw AppError.notFound("Offer not found");

  const body = req.body;
  if (body.name !== undefined) offer.name = body.name;
  if (body.type !== undefined) offer.type = body.type;
  if (body.value !== undefined) offer.value = body.value;
  if (body.minOrderAmount !== undefined) offer.minOrderAmount = body.minOrderAmount;
  if (body.discountUpToAmount !== undefined) offer.discountUpToAmount = body.discountUpToAmount;
  if (body.isActive !== undefined) offer.isActive = body.isActive;
  if (body.startDate !== undefined) offer.startDate = body.startDate;
  if (body.endDate !== undefined) offer.endDate = body.endDate;

  await repo().save(offer);
  res.status(200).json({ success: true, data: offer });
};

export const deleteOffer = async (req: Request, res: Response): Promise<void> => {
  const result = await repo().softDelete({ id: Number(req.params.id) });
  if (!result.affected) throw AppError.notFound("Offer not found");
  res.status(200).json({ success: true, data: { message: "Offer deleted" } });
};
