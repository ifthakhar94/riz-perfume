import type { PublicUser } from "@riz/shared";

import type { User } from "../../entities/user.entity";

/** Map a User entity to the client-safe shape (never leaks the password hash). */
export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  fullname: user.fullname,
  email: user.email,
  phoneNumber: user.phoneNumber,
  role: user.role,
  district: user.district,
  addressLine: user.addressLine,
  isActive: user.isActive,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});
