import { z } from "zod";

const money = z.coerce.number().nonnegative().max(99_999_999.99);

export const createInvestmentSchema = z.object({
  investorName: z.string().trim().min(1).max(200),
  amount: money,
  transactionMedium: z.string().trim().max(100).nullable().optional(),
  transactionFromAccount: z.string().trim().max(200).nullable().optional(),
  receivedAccount: z.string().trim().max(200).nullable().optional(),
  proofDetails: z.string().trim().max(5000).nullable().optional(),
  updateReason: z.string().trim().max(2000).nullable().optional(),
});

export const updateInvestmentSchema = createInvestmentSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: "No fields to update" });

export const listInvestmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});
