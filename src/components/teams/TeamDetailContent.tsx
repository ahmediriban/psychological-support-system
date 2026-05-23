"use client";

import {
  Box,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { TeamDetailHeader } from "./TeamDetailHeader";
import { TeamDistributionHistory } from "./TeamDistributionHistory";
import { TeamStockSummary } from "./TeamStockSummary";
import { TeamUsageHistory } from "./TeamUsageHistory";

type Props = {
  teamId: string;
  role: "ADMIN" | "SUPERVISOR" | "USER";
};

export function TeamDetailContent({ teamId, role }: Props) {
  const t = useTranslations("teams");

  return (
    <Box p={{ base: 4, md: 8 }}>
      <TeamDetailHeader teamId={teamId} role={role} />

      <TabsRoot defaultValue="stock" lazyMount>
        <TabsList mb={4} flexWrap="wrap">
          <TabsTrigger value="stock">{t("stockSummary")}</TabsTrigger>
          <TabsTrigger value="usage">{t("usageHistory")}</TabsTrigger>
          <TabsTrigger value="distribution">{t("distributionHistory")}</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <TeamStockSummary teamId={teamId} />
        </TabsContent>

        <TabsContent value="usage">
          <TeamUsageHistory teamId={teamId} />
        </TabsContent>

        <TabsContent value="distribution">
          <TeamDistributionHistory teamId={teamId} />
        </TabsContent>
      </TabsRoot>
    </Box>
  );
}
