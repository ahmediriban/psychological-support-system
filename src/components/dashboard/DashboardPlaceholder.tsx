import { Box, Heading } from "@chakra-ui/react";
import { getTranslations } from "next-intl/server";

export async function DashboardPlaceholder() {
  const t = await getTranslations("pages");
  return (
    <Box p={{ base: 4, md: 8 }}>
      <Heading size="lg">{t("dashboard")}</Heading>
    </Box>
  );
}
