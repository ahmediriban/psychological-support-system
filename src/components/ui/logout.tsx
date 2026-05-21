"use client";
import { Button } from "@chakra-ui/react";
import { authClient } from "../../lib/auth/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function LogoutButton() {
  const router = useRouter();
  const t = useTranslations("login");
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return <Button colorPalette="red" onClick={handleLogout}>{t("logout")}</Button>;
}
