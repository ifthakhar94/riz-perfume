import type { Request, Response } from "express";

import type { ApiSuccess, ExpenseDto, Paginated } from "@riz/shared";

import { buildPaginated, getPageParams } from "../../common/http/pagination";
import { AppDataSource } from "../../config/data-source";
import { Expense } from "../../entities/expense.entity";
import { AppError } from "../../utils/app-error";

const repo = () => AppDataSource.getRepository(Expense);

export const listExpenses = async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize, skip, take } = getPageParams(req.query);
  const qb = repo()
    .createQueryBuilder("expense")
    .leftJoinAndSelect("expense.category", "category")
    .orderBy("expense.expenseDate", "DESC")
    .addOrderBy("expense.id", "DESC")
    .skip(skip)
    .take(take);

  if (req.query.categoryId) {
    qb.andWhere("expense.expenseCategoryId = :categoryId", {
      categoryId: Number(req.query.categoryId),
    });
  }
  if (typeof req.query.from === "string")
    qb.andWhere("expense.expenseDate >= :from", { from: req.query.from });
  if (typeof req.query.to === "string")
    qb.andWhere("expense.expenseDate <= :to", { to: req.query.to });

  const [items, total] = await qb.getManyAndCount();
  const body: ApiSuccess<Paginated<ExpenseDto>> = {
    success: true,
    data: buildPaginated(items as unknown as ExpenseDto[], total, page, pageSize),
  };
  res.status(200).json(body);
};

export const createExpense = async (req: Request, res: Response): Promise<void> => {
  const expense = await repo().save(
    repo().create({
      expenseCategoryId: req.body.expenseCategoryId,
      expenseDate: req.body.expenseDate,
      amount: req.body.amount,
      description: req.body.description ?? null,
      vendorName: req.body.vendorName ?? null,
      paymentMethod: req.body.paymentMethod ?? null,
      transactionReference: req.body.transactionReference ?? null,
      invoiceNumber: req.body.invoiceNumber ?? null,
      createdBy: req.user?.id ?? null,
    }),
  );
  res.status(201).json({ success: true, data: expense });
};

export const updateExpense = async (req: Request, res: Response): Promise<void> => {
  const expense = await repo().findOne({ where: { id: Number(req.params.id) } });
  if (!expense) throw AppError.notFound("Expense not found");

  const body = req.body;
  if (body.expenseCategoryId !== undefined) expense.expenseCategoryId = body.expenseCategoryId;
  if (body.expenseDate !== undefined) expense.expenseDate = body.expenseDate;
  if (body.amount !== undefined) expense.amount = body.amount;
  if (body.description !== undefined) expense.description = body.description;
  if (body.vendorName !== undefined) expense.vendorName = body.vendorName;
  if (body.paymentMethod !== undefined) expense.paymentMethod = body.paymentMethod;
  if (body.transactionReference !== undefined) {
    expense.transactionReference = body.transactionReference;
  }
  if (body.invoiceNumber !== undefined) expense.invoiceNumber = body.invoiceNumber;

  await repo().save(expense);
  res.status(200).json({ success: true, data: expense });
};

export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  const result = await repo().softDelete({ id: Number(req.params.id) });
  if (!result.affected) throw AppError.notFound("Expense not found");
  res.status(200).json({ success: true, data: { message: "Expense deleted" } });
};
