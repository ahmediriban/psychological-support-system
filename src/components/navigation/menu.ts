export type NavItem = {
  key: "dashboard" | "items" | "teams" | "workers" | "distribution" | "usage" | "logs";
  href: string;
  minRole?: "ADMIN" | "SUPERVISOR" | "USER";
};

const ROLE_RANK: Record<string, number> = { USER: 0, SUPERVISOR: 1, ADMIN: 2 };

export function isNavItemVisible(item: NavItem, userRole: string): boolean {
  if (!item.minRole) return true;
  return (ROLE_RANK[userRole] ?? -1) >= (ROLE_RANK[item.minRole] ?? 99);
}

export const navItems: NavItem[] = [
  { key: "items", href: "/items", minRole: "ADMIN" },
  { key: "teams", href: "/teams" },
  { key: "workers", href: "/workers", minRole: "ADMIN" },
  { key: "distribution", href: "/distribution", minRole: "ADMIN" },
  { key: "usage", href: "/usage" }
];
