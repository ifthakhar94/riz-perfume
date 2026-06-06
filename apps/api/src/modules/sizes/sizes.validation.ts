import { z } from "zod";

export const createSizeSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const updateSizeSchema = z.object({
  name: z.string().trim().min(1).max(100),
});
