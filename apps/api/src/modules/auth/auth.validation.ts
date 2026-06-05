import { z } from "zod";

import { UserRole } from "../../common/enums";

export const registerSchema = z.object({
  fullname: z.string().trim().min(2).max(150),
  email: z.string().trim().toLowerCase().email().max(255),
  phoneNumber: z.string().trim().min(6).max(30),
  password: z.string().min(8).max(128),
  district: z.string().trim().max(120).optional(),
  addressLine: z.string().trim().max(1000).optional(),
  // Optional. A non-USER role is only honored for admin callers (enforced in the
  // service); anonymous/USER callers always get USER regardless of this value.
  role: z.nativeEnum(UserRole).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
