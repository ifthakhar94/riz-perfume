/**
 * Core domain types. Kept as string unions (not enums) so this package stays
 * runtime-free and fully erasable. Backend RBAC will enforce these roles.
 */

export type UserRole = "admin" | "manager" | "customer";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}
