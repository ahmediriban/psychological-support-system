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
import { useTeamUsage } from "../../hooks/teams/useTeams";

type Props = { teamId: string };

export function TeamUsageHistory({ teamId }: Props) {
  const t = useTranslations("teams");
  const { data: usage = [], isLoading, isError } = useTeamUsage(teamId);

  if (isLoading) return <Skeleton h="120px" />;
  if (isError) return <Text color="red.500">{t("error")}</Text>;
  if (usage.length === 0) {
    return (
      <EmptyStateRoot>
        <EmptyStateTitle>{t("usageEmpty")}</EmptyStateTitle>
      </EmptyStateRoot>
    );
  }

  return (
    <Box overflowX="auto">
      <Table.Root variant="outline" size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>{t("item")}</Table.ColumnHeader>
            <Table.ColumnHeader>{t("quantity")}</Table.ColumnHeader>
            <Table.ColumnHeader>{t("worker")}</Table.ColumnHeader>
            <Table.ColumnHeader>{t("purpose")}</Table.ColumnHeader>
            <Table.ColumnHeader>{t("date")}</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {usage.map((entry) => (
            <Table.Row key={entry.id}>
              <Table.Cell fontWeight="medium">{entry.item.name}</Table.Cell>
              <Table.Cell>{entry.quantity}</Table.Cell>
              <Table.Cell color="gray.500">
                {entry.user?.name ?? entry.user?.email ?? "—"}
              </Table.Cell>
              <Table.Cell>{entry.purpose}</Table.Cell>
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
