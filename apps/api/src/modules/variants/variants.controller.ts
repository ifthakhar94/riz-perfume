import type { Request, Response } from "express";

import { AppDataSource } from "../../config/data-source";
import { ProductVariant } from "../../entities/product-variant.entity";
import { AppError } from "../../utils/app-error";
import { toVariantDto } from "../products/product.mapper";

const repo = () => AppDataSource.getRepository(ProductVariant);

const loadWithRelations = async (id: number): Promise<ProductVariant> => {
  const variant = await repo().findOne({ where: { id }, relations: { size: true, type: true } });
  if (!variant) throw AppError.notFound("Variant not found");
  return variant;
};

export const listVariants = async (req: Request, res: Response): Promise<void> => {
  const variants = await repo().find({
    where: { productId: Number(req.query.productId) },
    relations: { size: true, type: true },
    order: { id: "ASC" },
  });
  res.status(200).json({ success: true, data: variants.map(toVariantDto) });
};

export const createVariant = async (req: Request, res: Response): Promise<void> => {
  const created = await repo().save(
    repo().create({
      productId: req.body.productId,
      sizeId: req.body.sizeId,
      typeId: req.body.typeId,
      price: req.body.price,
      sku: req.body.sku,
      stockQuantity: req.body.stockQuantity ?? 0,
      isActive: req.body.isActive ?? true,
    }),
  );
  res.status(201).json({ success: true, data: toVariantDto(await loadWithRelations(created.id)) });
};

export const updateVariant = async (req: Request, res: Response): Promise<void> => {
  const variant = await repo().findOne({ where: { id: Number(req.params.id) } });
  if (!variant) throw AppError.notFound("Variant not found");

  const { sizeId, typeId, price, sku, stockQuantity, isActive } = req.body;
  if (sizeId !== undefined) variant.sizeId = sizeId;
  if (typeId !== undefined) variant.typeId = typeId;
  if (price !== undefined) variant.price = price;
  if (sku !== undefined) variant.sku = sku;
  if (stockQuantity !== undefined) variant.stockQuantity = stockQuantity;
  if (isActive !== undefined) variant.isActive = isActive;
  await repo().save(variant);

  res.status(200).json({ success: true, data: toVariantDto(await loadWithRelations(variant.id)) });
};

export const deleteVariant = async (req: Request, res: Response): Promise<void> => {
  const result = await repo().softDelete({ id: Number(req.params.id) });
  if (!result.affected) throw AppError.notFound("Variant not found");
  res.status(200).json({ success: true, data: { message: "Variant deleted" } });
};
