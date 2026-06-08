import type { Request, Response } from "express";

import { AppDataSource } from "../../config/data-source";
import { ProductVariantCost } from "../../entities/product-variant-cost.entity";
import { AppError } from "../../utils/app-error";

const repo = () => AppDataSource.getRepository(ProductVariantCost);

export const listVariantCosts = async (req: Request, res: Response): Promise<void> => {
  const costs = await repo().find({
    where: { productVariantId: Number(req.query.productVariantId) },
    order: { createdAt: "DESC" },
  });
  res.status(200).json({ success: true, data: costs });
};

export const createVariantCost = async (req: Request, res: Response): Promise<void> => {
  const cost = await repo().save(
    repo().create({
      productVariantId: req.body.productVariantId,
      rawMaterialCost: req.body.rawMaterialCost,
      bottleCost: req.body.bottleCost,
    }),
  );
  res.status(201).json({ success: true, data: cost });
};

export const updateVariantCost = async (req: Request, res: Response): Promise<void> => {
  const cost = await repo().findOne({ where: { id: Number(req.params.id) } });
  if (!cost) throw AppError.notFound("Variant cost not found");
  if (req.body.rawMaterialCost !== undefined) cost.rawMaterialCost = req.body.rawMaterialCost;
  if (req.body.bottleCost !== undefined) cost.bottleCost = req.body.bottleCost;
  await repo().save(cost);
  res.status(200).json({ success: true, data: cost });
};

export const deleteVariantCost = async (req: Request, res: Response): Promise<void> => {
  const result = await repo().softDelete({ id: Number(req.params.id) });
  if (!result.affected) throw AppError.notFound("Variant cost not found");
  res.status(200).json({ success: true, data: { message: "Variant cost deleted" } });
};
