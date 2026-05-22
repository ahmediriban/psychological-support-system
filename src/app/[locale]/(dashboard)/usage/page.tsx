import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUserWithRole } from "../../../../lib/auth";
import { getTeamById } from "../../../../lib/teams";
import { UsagePageContent } from "../../../../components/usage/UsagePageContent";

export default async function UsagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUserWithRole(await headers());

  if (!user) redirect(`/${locale}/login`);

  if (user.role === "USER") {
    if (!user.teamId) redirect(`/${locale}/items`);
    const team = await getTeamById(user.teamId);
    if (!team) redirect(`/${locale}/items`);
    return (
      <UsagePageContent
        role="USER"
        teamId={user.teamId}
        teamName={team.name}
      />
    );
  }

  if (user.role === "SUPERVISOR") {
    return <UsagePageContent role="SUPERVISOR" />;
  }

  return <UsagePageContent role="ADMIN" />;
}
