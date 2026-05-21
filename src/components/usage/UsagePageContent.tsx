"use client";

import {
  Box,
  Heading,
  Stack,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { UsageForm } from "./UsageForm";
import { UsageHistory } from "./UsageHistory";

type Props =
  | { role: "USER"; teamId: string; teamName: string }
  | { role: "ADMIN" }
  | { role: "SUPERVISOR" };

export function UsagePageContent(props: Props) {
  const t = useTranslations("usage");
  const canCreate = props.role === "ADMIN" || props.role === "USER";
  const [activeTab, setActiveTab] = useState(canCreate ? "log" : "history");

  return (
    <Box p={{ base: 4, md: 8 }}>
      <Heading size={{ base: "md", md: "lg" }} mb={6}>
        {t("title")}
      </Heading>

      <TabsRoot
        value={activeTab}
        onValueChange={(e) => setActiveTab(e.value)}
        lazyMount
      >
        <TabsList mb={6} flexWrap="wrap">
          {canCreate && <TabsTrigger value="log">{t("logUsage")}</TabsTrigger>}
          <TabsTrigger value="history">{t("history")}</TabsTrigger>
        </TabsList>

        {canCreate && (
          <TabsContent value="log">
            <Box maxW={{ base: "100%", md: "520px" }}>
              {props.role === "USER" && (
                <Box
                  mb={4}
                  px={4}
                  py={3}
                  bg="blue.50"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="blue.200"
                >
                  <Text fontSize="sm" color="blue.700">{t("workerTeamLocked")}</Text>
                </Box>
              )}
              <UsageForm
                role={props.role === "USER" ? "USER" : "ADMIN"}
                lockedTeamId={props.role === "USER" ? props.teamId : undefined}
                lockedTeamName={props.role === "USER" ? props.teamName : undefined}
                onSuccess={() => setActiveTab("history")}
              />
            </Box>
          </TabsContent>
        )}

        <TabsContent value="history">
          <Stack gap={4}>
            <Text fontSize="sm" color="gray.500">{t("historySubtitle")}</Text>
            {props.role === "USER" ? (
              <UsageHistory mode="team" teamId={props.teamId} />
            ) : (
              <UsageHistory mode="all" />
            )}
          </Stack>
        </TabsContent>
      </TabsRoot>
    </Box>
  );
}
