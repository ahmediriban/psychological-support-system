"use client";

import {
  Badge,
  Box,
  Button,
  EmptyStateRoot,
  EmptyStateTitle,
  HStack,
  Skeleton,
  Table,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useTeamStock } from "../../hooks/teams/useTeams";
import type { ItemCategoryEnum } from "../../schemas/items/create-item.schema";

const CATEGORY_COLORS: Record<string, string> = {
  MATERIALS_STATIONERY: "blue",
  FIRST_AID: "red",
  HYGIENE: "green",
  PRINTING: "orange",
};

type Props = { teamId: string };

export function TeamStockSummary({ teamId }: Props) {
  const t = useTranslations("teams");
  const tc = useTranslations("categories");
  const { data: stock = [], isLoading, isError } = useTeamStock(teamId);

  const [activeCategory, setActiveCategory] = useState<ItemCategoryEnum | null>(null);

  if (isLoading) return <Skeleton h="120px" />;
  if (isError) return <Text color="red.500">{t("error")}</Text>;
  if (stock.length === 0) {
    return (
      <EmptyStateRoot>
        <EmptyStateTitle>{t("stockEmpty")}</EmptyStateTitle>
      </EmptyStateRoot>
    );
  }

  // Derive categories present in this team's stock (preserve insertion order)
  const presentCategories = Array.from(
    new Set(stock.map((e) => e.item.category))
  ) as ItemCategoryEnum[];

  const filtered = activeCategory
    ? stock.filter((e) => e.item.category === activeCategory)
    : stock;

  return (
    <Box>
      {/* Category filter bar */}
      <HStack gap={2} mb={4} flexWrap="wrap">
        <Text fontSize="sm" color="gray.500" flexShrink={0}>
          {tc("filterBy")}:
        </Text>
        <Button
          size="sm"
          variant={activeCategory === null ? "solid" : "outline"}
          colorPalette={activeCategory === null ? "blue" : "gray"}
          borderRadius="full"
          onClick={() => setActiveCategory(null)}
        >
          {t("allCategories")}
        </Button>
        {presentCategories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={activeCategory === cat ? "solid" : "outline"}
            colorPalette={activeCategory === cat ? CATEGORY_COLORS[cat] : "gray"}
            borderRadius="full"
            onClick={() => setActiveCategory(cat)}
          >
            {tc(cat)}
          </Button>
        ))}
      </HStack>

      <Box overflowX="auto">
        {filtered.length === 0 ? (
          <EmptyStateRoot>
            <EmptyStateTitle>{t("stockEmpty")}</EmptyStateTitle>
          </EmptyStateRoot>
        ) : (
          <Table.Root variant="outline" size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t("item")}</Table.ColumnHeader>
                <Table.ColumnHeader>{t("unit")}</Table.ColumnHeader>
                <Table.ColumnHeader>{tc("category")}</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">{t("quantity")}</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.map((entry) => (
                <Table.Row key={entry.id}>
                  <Table.Cell fontWeight="medium">{entry.item.name}</Table.Cell>
                  <Table.Cell color="gray.500">{entry.item.unit ?? "—"}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={CATEGORY_COLORS[entry.item.category] ?? "gray"} fontSize="xs">
                      {tc(entry.item.category)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="end">{entry.quantity}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Box>
    </Box>
  );
}
