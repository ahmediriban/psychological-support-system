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
import { useTeamDistribution } from "../../hooks/teams/useTeams";

type Props = { teamId: string };

export function TeamDistributionHistory({ teamId }: Props) {
  const t = useTranslations("teams");
  const { data: distributions = [], isLoading, isError } = useTeamDistribution(teamId);

  if (isLoading) return <Skeleton h="120px" />;
  if (isError) return <Text color="red.500">{t("error")}</Text>;
  if (distributions.length === 0) {
    return (
      <EmptyStateRoot>
        <EmptyStateTitle>{t("distributionEmpty")}</EmptyStateTitle>
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
            <Table.ColumnHeader>{t("quantity")}</Table.ColumnHeader>
            <Table.ColumnHeader>{t("note")}</Table.ColumnHeader>
            <Table.ColumnHeader>{t("date")}</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {distributions.map((entry) => (
            <Table.Row key={entry.id}>
              <Table.Cell fontWeight="medium">{entry.item.name}</Table.Cell>
              <Table.Cell color="gray.500">{entry.item.unit ?? "—"}</Table.Cell>
              <Table.Cell>{entry.quantity}</Table.Cell>
              <Table.Cell color="gray.500">{entry.note ?? "—"}</Table.Cell>
              <Table.Cell color="gray.500" whiteSpace="nowrap">
                {new Date(entry.createdAt).toLocaleDateString()}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
