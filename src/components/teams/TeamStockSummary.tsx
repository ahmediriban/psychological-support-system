"use client";

import {
  Box,
  EmptyStateRoot,
  EmptyStateTitle,
  Skeleton,
  Table,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useTeamStock } from "../../hooks/teams/useTeams";

type Props = { teamId: string };

export function TeamStockSummary({ teamId }: Props) {
  const t = useTranslations("teams");
  const { data: stock = [], isLoading, isError } = useTeamStock(teamId);

  if (isLoading) return <Skeleton h="120px" />;
  if (isError) return <Text color="red.500">{t("error")}</Text>;
  if (stock.length === 0) {
    return (
      <EmptyStateRoot>
        <EmptyStateTitle>{t("stockEmpty")}</EmptyStateTitle>
      </EmptyStateRoot>
    );
  }

  return (
    <Box overflowX="auto">
      <Table.Root variant="outline" size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>{t("item")}</Table.ColumnHeader>
            <Table.ColumnHeader>{t("unit")}</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">{t("quantity")}</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {stock.map((entry) => (
            <Table.Row key={entry.id}>
              <Table.Cell fontWeight="medium">{entry.item.name}</Table.Cell>
              <Table.Cell color="gray.500">{entry.item.unit ?? "—"}</Table.Cell>
              <Table.Cell textAlign="end">{entry.quantity}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
