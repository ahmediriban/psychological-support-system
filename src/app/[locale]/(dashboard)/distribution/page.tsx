import { getCurrentUserWithRole } from "../../../../lib/auth";
import { DistributionPageContent } from "../../../../components/distribution/DistributionPageContent";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DistributionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUserWithRole(await headers());

  if (!user) redirect(`/${locale}/login`);
  if (user.role === "USER") redirect(`/${locale}/items`);

  return <DistributionPageContent role={user.role as "ADMIN" | "SUPERVISOR"} />;
}
