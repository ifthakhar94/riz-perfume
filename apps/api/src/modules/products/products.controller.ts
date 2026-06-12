import type { Request, Response } from "express";

import type { ApiSuccess, Paginated, ProductListItemDto } from "@riz/shared";

import { buildPaginated, getPageParams } from "../../common/http/pagination";
import { queryFlag } from "../../common/http/query";
import { AppError } from "../../utils/app-error";
import { toProductDetail } from "./product.mapper";
import { productsService } from "./products.service";

export const listProducts = async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize, skip, take } = getPageParams(req.query);
  const { items, total } = await productsService.list({
    skip,
    take,
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
    categorySlug: typeof req.query.category === "string" ? req.query.category : undefined,
    includeInactive: queryFlag(req.query.includeInactive),
  });
  const body: ApiSuccess<Paginated<ProductListItemDto>> = {
    success: true,
    data: buildPaginated(items, total, page, pageSize),
  };
  res.status(200).json(body);
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  const product = await productsService.getBySlug(String(req.params.slug));
  // Public endpoint: drafts/disabled products are hidden.
  if (!product || !product.isActive) throw AppError.notFound("Product not found");
  res.status(200).json({
    success: true,
    data: toProductDetail(product, { activeVariantsOnly: true }),
  });
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const product = await productsService.getById(Number(req.params.id));
  res.status(200).json({
    success: true,
    data: toProductDetail(product, { activeVariantsOnly: false }),
  });
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await productsService.create(req.body);
  res.status(201).json({
    success: true,
    data: toProductDetail(product, { activeVariantsOnly: false }),
  });
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await productsService.update(Number(req.params.id), req.body);
  res.status(200).json({
    success: true,
    data: toProductDetail(product, { activeVariantsOnly: false }),
  });
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  await productsService.remove(Number(req.params.id));
  res.status(200).json({ success: true, data: { message: "Product deleted" } });
};
