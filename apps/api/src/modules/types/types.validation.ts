import { z } from "zod";

export const createTypeSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const updateTypeSchema = z.object({
  name: z.string().trim().min(1).max(100),
});
