import type { Request, Response } from "express";

import { queryFlag } from "../../common/http/query";
import { AppDataSource } from "../../config/data-source";
import { Category } from "../../entities/category.entity";
import { AppError } from "../../utils/app-error";

const repo = () => AppDataSource.getRepository(Category);

export const listCategories = async (req: Request, res: Response): Promise<void> => {
  // Public callers get active categories only; admins can pass ?includeInactive=true.
  const includeInactive = queryFlag(req.query.includeInactive);
  const categories = await repo().find({
    where: includeInactive ? {} : { isActive: true },
    order: { name: "ASC" },
  });
  res.status(200).json({ success: true, data: categories });
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await repo().save(
    repo().create({ name: req.body.name, isActive: req.body.isActive ?? true }),
  );
  res.status(201).json({ success: true, data: category });
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await repo().findOne({ where: { id: Number(req.params.id) } });
  if (!category) throw AppError.notFound("Category not found");
  if (req.body.name !== undefined) category.name = req.body.name;
  if (req.body.isActive !== undefined) category.isActive = req.body.isActive;
  await repo().save(category);
  res.status(200).json({ success: true, data: category });
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const result = await repo().softDelete({ id: Number(req.params.id) });
  if (!result.affected) throw AppError.notFound("Category not found");
  res.status(200).json({ success: true, data: { message: "Category deleted" } });
};
