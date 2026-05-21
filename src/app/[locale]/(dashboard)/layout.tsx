import { headers } from "next/headers";
import type { ReactNode } from "react";
import { getCurrentUserWithRole } from "../../../lib/auth";
import { DashboardShell } from "../../../components/navigation/DashboardShell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUserWithRole(await headers());
  const userRole = user?.role ?? "USER";

  return <DashboardShell userRole={userRole}>{children}</DashboardShell>;
}
