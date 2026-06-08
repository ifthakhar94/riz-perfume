import { z } from "zod";

const money = z.coerce.number().nonnegative().max(99_999_999.99);
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected date as YYYY-MM-DD");

export const createExpenseSchema = z.object({
  expenseCategoryId: z.coerce.number().int().positive(),
  expenseDate: dateString,
  amount: money,
  description: z.string().trim().max(2000).nullable().optional(),
  vendorName: z.string().trim().max(200).nullable().optional(),
  paymentMethod: z.string().trim().max(100).nullable().optional(),
  transactionReference: z.string().trim().max(200).nullable().optional(),
  invoiceNumber: z.string().trim().max(100).nullable().optional(),
});

export const updateExpenseSchema = createExpenseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: "No fields to update" });

export const listExpensesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  from: dateString.optional(),
  to: dateString.optional(),
});
