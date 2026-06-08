import type { Request, Response } from "express";

import { queryFlag } from "../../common/http/query";
import { AppDataSource } from "../../config/data-source";
import { ExpenseCategory } from "../../entities/expense-category.entity";
import { AppError } from "../../utils/app-error";

const repo = () => AppDataSource.getRepository(ExpenseCategory);

export const listExpenseCategories = async (req: Request, res: Response): Promise<void> => {
  const includeInactive = queryFlag(req.query.includeInactive);
  const categories = await repo().find({
    where: includeInactive ? {} : { isActive: true },
    order: { name: "ASC" },
  });
  res.status(200).json({ success: true, data: categories });
};

export const createExpenseCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await repo().save(
    repo().create({
      name: req.body.name,
      description: req.body.description ?? null,
      isActive: req.body.isActive ?? true,
    }),
  );
  res.status(201).json({ success: true, data: category });
};

export const updateExpenseCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await repo().findOne({ where: { id: Number(req.params.id) } });
  if (!category) throw AppError.notFound("Expense category not found");
  if (req.body.name !== undefined) category.name = req.body.name;
  if (req.body.description !== undefined) category.description = req.body.description;
  if (req.body.isActive !== undefined) category.isActive = req.body.isActive;
  await repo().save(category);
  res.status(200).json({ success: true, data: category });
};

export const deleteExpenseCategory = async (req: Request, res: Response): Promise<void> => {
  const result = await repo().delete({ id: Number(req.params.id) });
  if (!result.affected) throw AppError.notFound("Expense category not found");
  res.status(200).json({ success: true, data: { message: "Expense category deleted" } });
};
