import { getCurrentUserWithRole } from "../../../../lib/auth";
import { TeamsPageContent } from "../../../../components/teams/TeamsPageContent";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUserWithRole(await headers());

  if (!user) redirect(`/${locale}/login`);

  // WORKER → go straight to their own team detail (or dashboard if unassigned)
  if (user.role === "USER") {
    if (user.teamId) redirect(`/${locale}/teams/${user.teamId}`);
    else redirect(`/${locale}/dashboard`);
  }

  return <TeamsPageContent role={user.role as "ADMIN" | "SUPERVISOR"} />;
}
