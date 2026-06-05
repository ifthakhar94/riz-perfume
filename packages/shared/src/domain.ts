/**
 * Core domain types. Kept as string unions (not enums) so this package stays
 * runtime-free and fully erasable. Backend RBAC will enforce these roles.
 */

export type UserRole = "ADMIN" | "USER";

/** A user as exposed to clients — never includes the password hash. */
export interface PublicUser {
  id: number;
  fullname: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  district: string | null;
  addressLine: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
