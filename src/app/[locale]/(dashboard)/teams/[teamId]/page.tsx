import { getCurrentUserWithRole } from "../../../../../lib/auth";
import { TeamDetailContent } from "../../../../../components/teams/TeamDetailContent";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ locale: string; teamId: string }>;
}) {
  const { locale, teamId } = await params;
  const user = await getCurrentUserWithRole(await headers());

  if (!user) redirect(`/${locale}/login`);

  // WORKER can only view their own team
  if (user.role === "USER" && user.teamId !== teamId) {
    if (user.teamId) redirect(`/${locale}/teams/${user.teamId}`);
    else redirect(`/${locale}/items`);
  }

  return (
    <TeamDetailContent
      teamId={teamId}
      role={user.role as "ADMIN" | "SUPERVISOR" | "USER"}
    />
  );
}
