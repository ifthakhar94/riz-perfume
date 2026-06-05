import type { Request, Response } from "express";

import type { ApiSuccess, Paginated, PublicUser } from "@riz/shared";

import { AppDataSource } from "../../config/data-source";
import { User } from "../../entities/user.entity";
import { toPublicUser } from "./user.mapper";

/** Admin-only: list users (paginated). Demonstrates the RBAC-protected pattern. */
export const listUsers = async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);

  const [rows, total] = await AppDataSource.getRepository(User).findAndCount({
    order: { createdAt: "DESC" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const body: ApiSuccess<Paginated<PublicUser>> = {
    success: true,
    data: {
      items: rows.map(toPublicUser),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    },
  };
  res.status(200).json(body);
};
