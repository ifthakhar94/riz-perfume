import type { Request, Response } from "express";
import type { FindOptionsWhere } from "typeorm";

import type { CourierZone, DeliveryType } from "../../common/enums";
import { AppDataSource } from "../../config/data-source";
import { CourierCharge } from "../../entities/courier-charge.entity";
import { AppError } from "../../utils/app-error";

const repo = () => AppDataSource.getRepository(CourierCharge);

export const listCourierCharges = async (req: Request, res: Response): Promise<void> => {
  const where: FindOptionsWhere<CourierCharge> = {};
  if (typeof req.query.zone === "string") where.zone = req.query.zone as CourierZone;
  if (typeof req.query.deliveryType === "string") {
    where.deliveryType = req.query.deliveryType as DeliveryType;
  }
  const charges = await repo().find({ where, order: { courier: "ASC", zone: "ASC" } });
  res.status(200).json({ success: true, data: charges });
};

export const createCourierCharge = async (req: Request, res: Response): Promise<void> => {
  const charge = await repo().save(
    repo().create({
      courier: req.body.courier,
      zone: req.body.zone,
      deliveryType: req.body.deliveryType,
      charge: req.body.charge,
      quantityToMultiplyCharge: req.body.quantityToMultiplyCharge ?? 1,
    }),
  );
  res.status(201).json({ success: true, data: charge });
};

export const updateCourierCharge = async (req: Request, res: Response): Promise<void> => {
  const charge = await repo().findOne({ where: { id: Number(req.params.id) } });
  if (!charge) throw AppError.notFound("Courier charge not found");
  if (req.body.courier !== undefined) charge.courier = req.body.courier;
  if (req.body.zone !== undefined) charge.zone = req.body.zone;
  if (req.body.deliveryType !== undefined) charge.deliveryType = req.body.deliveryType;
  if (req.body.charge !== undefined) charge.charge = req.body.charge;
  if (req.body.quantityToMultiplyCharge !== undefined) {
    charge.quantityToMultiplyCharge = req.body.quantityToMultiplyCharge;
  }
  await repo().save(charge);
  res.status(200).json({ success: true, data: charge });
};

export const deleteCourierCharge = async (req: Request, res: Response): Promise<void> => {
  const result = await repo().delete({ id: Number(req.params.id) });
  if (!result.affected) throw AppError.notFound("Courier charge not found");
  res.status(200).json({ success: true, data: { message: "Courier charge deleted" } });
};
