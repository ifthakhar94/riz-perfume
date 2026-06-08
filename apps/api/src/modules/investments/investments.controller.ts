import type { Request, Response } from "express";

import type { ApiSuccess, InvestmentDto, Paginated } from "@riz/shared";

import { buildPaginated, getPageParams } from "../../common/http/pagination";
import { AppDataSource } from "../../config/data-source";
import { Investment } from "../../entities/investment.entity";
import { AppError } from "../../utils/app-error";

const repo = () => AppDataSource.getRepository(Investment);

export const listInvestments = async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize, skip, take } = getPageParams(req.query);
  const [items, total] = await repo().findAndCount({
    order: { createdAt: "DESC" },
    skip,
    take,
  });
  const body: ApiSuccess<Paginated<InvestmentDto>> = {
    success: true,
    data: buildPaginated(items as unknown as InvestmentDto[], total, page, pageSize),
  };
  res.status(200).json(body);
};

export const createInvestment = async (req: Request, res: Response): Promise<void> => {
  const investment = await repo().save(
    repo().create({
      investorName: req.body.investorName,
      amount: req.body.amount,
      transactionMedium: req.body.transactionMedium ?? null,
      transactionFromAccount: req.body.transactionFromAccount ?? null,
      receivedAccount: req.body.receivedAccount ?? null,
      proofDetails: req.body.proofDetails ?? null,
      updateReason: req.body.updateReason ?? null,
      updatedBy: req.user?.id ?? null,
    }),
  );
  res.status(201).json({ success: true, data: investment });
};

export const updateInvestment = async (req: Request, res: Response): Promise<void> => {
  const investment = await repo().findOne({ where: { id: Number(req.params.id) } });
  if (!investment) throw AppError.notFound("Investment not found");

  const body = req.body;
  if (body.investorName !== undefined) investment.investorName = body.investorName;
  if (body.amount !== undefined) investment.amount = body.amount;
  if (body.transactionMedium !== undefined) investment.transactionMedium = body.transactionMedium;
  if (body.transactionFromAccount !== undefined) {
    investment.transactionFromAccount = body.transactionFromAccount;
  }
  if (body.receivedAccount !== undefined) investment.receivedAccount = body.receivedAccount;
  if (body.proofDetails !== undefined) investment.proofDetails = body.proofDetails;
  if (body.updateReason !== undefined) investment.updateReason = body.updateReason;
  investment.updatedBy = req.user?.id ?? null;

  await repo().save(investment);
  res.status(200).json({ success: true, data: investment });
};

export const deleteInvestment = async (req: Request, res: Response): Promise<void> => {
  const result = await repo().softDelete({ id: Number(req.params.id) });
  if (!result.affected) throw AppError.notFound("Investment not found");
  res.status(200).json({ success: true, data: { message: "Investment deleted" } });
};
