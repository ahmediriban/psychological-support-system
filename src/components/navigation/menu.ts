import type { IconType } from "react-icons";
import { MdInventory2, MdGroup, MdPeople, MdLocalShipping, MdAssignment } from "react-icons/md";

export type NavItem = {
  key: "dashboard" | "items" | "teams" | "workers" | "distribution" | "usage" | "logs";
  href: string;
  icon: IconType;
  minRole?: "ADMIN" | "SUPERVISOR" | "USER";
};

const ROLE_RANK: Record<string, number> = { USER: 0, SUPERVISOR: 1, ADMIN: 2 };

export function isNavItemVisible(item: NavItem, userRole: string): boolean {
  if (!item.minRole) return true;
  return (ROLE_RANK[userRole] ?? -1) >= (ROLE_RANK[item.minRole] ?? 99);
}

export const navItems: NavItem[] = [
  { key: "items",        href: "/items",        icon: MdInventory2,    minRole: "ADMIN" },
  { key: "teams",        href: "/teams",        icon: MdGroup },
  { key: "workers",      href: "/workers",      icon: MdPeople,        minRole: "ADMIN" },
  { key: "distribution", href: "/distribution", icon: MdLocalShipping, minRole: "ADMIN" },
  { key: "usage",        href: "/usage",        icon: MdAssignment },
];
