"use client";

import {
  Box,
  Heading,
  Separator,
  Stack,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useSelectedCategory } from "../../hooks/useSelectedCategory";
import { CategorySelector } from "../ui/CategorySelector";
import { DistributionForm } from "./DistributionForm";
import { DistributionHistory } from "./DistributionHistory";

type Props = {
  role: "ADMIN" | "SUPERVISOR";
};

export function DistributionPageContent({ role }: Props) {
  const t = useTranslations("distribution");
  const isAdmin = role === "ADMIN";
  const [activeTab, setActiveTab] = useState(isAdmin ? "create" : "history");
  const { category, setCategory } = useSelectedCategory();

  return (
    <Box p={{ base: 4, md: 8 }}>
      <Heading size={{ base: "md", md: "lg" }} mb={4}>
        {t("title")}
      </Heading>

      <Box mb={6}>
        <CategorySelector value={category} onChange={setCategory} />
      </Box>

      <TabsRoot
        value={activeTab}
        onValueChange={(e) => setActiveTab(e.value)}
        lazyMount
      >
        <TabsList mb={6} flexWrap="wrap">
          {isAdmin && (
            <TabsTrigger value="create">{t("newDistribution")}</TabsTrigger>
          )}
          <TabsTrigger value="history">{t("history")}</TabsTrigger>
        </TabsList>

        {isAdmin && (
          <TabsContent value="create">
            <Box maxW={{ base: "100%", md: "560px" }}>
              <DistributionForm
                key={category}
                onSuccess={() => setActiveTab("history")}
                category={category}
              />
            </Box>
          </TabsContent>
        )}

        <TabsContent value="history">
          <Stack gap={4}>
            <Text fontSize="sm" color="gray.500">{t("historySubtitle")}</Text>
            <DistributionHistory category={category} />
          </Stack>
        </TabsContent>
      </TabsRoot>
    </Box>
  );
}
