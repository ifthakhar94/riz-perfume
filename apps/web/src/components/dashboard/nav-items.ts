import {
  BadgePercent,
  FolderTree,
  LayoutDashboard,
  Package,
  Ruler,
  ShoppingBag,
  SprayCan,
  Truck,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Categories", href: "/dashboard/categories", icon: FolderTree },
  { label: "Sizes", href: "/dashboard/sizes", icon: Ruler },
  { label: "Types", href: "/dashboard/types", icon: SprayCan },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Offers", href: "/dashboard/offers", icon: BadgePercent },
  { label: "Courier Charges", href: "/dashboard/courier-charges", icon: Truck },
  { label: "Finance", href: "/dashboard/finance", icon: Wallet },
];
