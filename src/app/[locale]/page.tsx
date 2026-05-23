import { getCurrentUserWithRole } from "../../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUserWithRole(await headers());

  if (!user) redirect(`/${locale}/login`);
  if (user.role === "USER") redirect(`/${locale}/usage`);
  redirect(`/${locale}/items`);
}
