import { getCurrentUserWithRole } from "../../../../lib/auth";
import { ItemsPageContent } from "../../../../components/items/ItemsPageContent";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ItemsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUserWithRole(await headers());

  if (!user) redirect(`/${locale}/login`);
  if (user.role === "USER") redirect(`/${locale}/usage`);

  return <ItemsPageContent role={user.role as "ADMIN" | "SUPERVISOR"} />;
}
