import { getCurrentUserWithRole } from "../../../../lib/auth";
import { WorkersPageContent } from "../../../../components/workers/WorkersPageContent";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function WorkersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUserWithRole(await headers());

  if (!user) redirect(`/${locale}/login`);
  if (user.role === "USER") redirect(`/${locale}/items`);

  return <WorkersPageContent role={user.role as "ADMIN" | "SUPERVISOR"} />;
}
