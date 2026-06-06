import type { Request, Response } from "express";

import { AppDataSource } from "../../config/data-source";
import { Size } from "../../entities/size.entity";
import { AppError } from "../../utils/app-error";

const repo = () => AppDataSource.getRepository(Size);

export const listSizes = async (_req: Request, res: Response): Promise<void> => {
  const sizes = await repo().find({ order: { name: "ASC" } });
  res.status(200).json({ success: true, data: sizes });
};

export const createSize = async (req: Request, res: Response): Promise<void> => {
  const size = await repo().save(repo().create({ name: req.body.name }));
  res.status(201).json({ success: true, data: size });
};

export const updateSize = async (req: Request, res: Response): Promise<void> => {
  const size = await repo().findOne({ where: { id: Number(req.params.id) } });
  if (!size) throw AppError.notFound("Size not found");
  size.name = req.body.name;
  await repo().save(size);
  res.status(200).json({ success: true, data: size });
};

export const deleteSize = async (req: Request, res: Response): Promise<void> => {
  const result = await repo().delete({ id: Number(req.params.id) });
  if (!result.affected) throw AppError.notFound("Size not found");
  res.status(200).json({ success: true, data: { message: "Size deleted" } });
};
