import type { Request, Response } from "express";

import { AppDataSource } from "../../config/data-source";
import { Type } from "../../entities/type.entity";
import { AppError } from "../../utils/app-error";

const repo = () => AppDataSource.getRepository(Type);

export const listTypes = async (_req: Request, res: Response): Promise<void> => {
  const types = await repo().find({ order: { name: "ASC" } });
  res.status(200).json({ success: true, data: types });
};

export const createType = async (req: Request, res: Response): Promise<void> => {
  const type = await repo().save(repo().create({ name: req.body.name }));
  res.status(201).json({ success: true, data: type });
};

export const updateType = async (req: Request, res: Response): Promise<void> => {
  const type = await repo().findOne({ where: { id: Number(req.params.id) } });
  if (!type) throw AppError.notFound("Type not found");
  type.name = req.body.name;
  await repo().save(type);
  res.status(200).json({ success: true, data: type });
};

export const deleteType = async (req: Request, res: Response): Promise<void> => {
  const result = await repo().delete({ id: Number(req.params.id) });
  if (!result.affected) throw AppError.notFound("Type not found");
  res.status(200).json({ success: true, data: { message: "Type deleted" } });
};
