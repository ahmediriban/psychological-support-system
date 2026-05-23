"use client";

import {
  Box,
  EmptyStateRoot,
  EmptyStateTitle,
  Skeleton,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useTeamDistributionPaged } from "../../hooks/teams/useTeams";
import { Pagination } from "../ui/Pagination";

type Props = { teamId: string };

export function TeamDistributionHistory({ teamId }: Props) {
  const t = useTranslations("teams");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useTeamDistributionPaged(teamId, page);

  if (isLoading && !data) return <Skeleton h="120px" />;
  if (isError) return <Text color="red.500">{t("error")}</Text>;

  const distributions = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 12;

  if (distributions.length === 0 && page === 1) {
    return (
      <EmptyStateRoot>
        <EmptyStateTitle>{t("distributionEmpty")}</EmptyStateTitle>
      </EmptyStateRoot>
    );
  }

  return (
    <Stack gap={4}>
      <Box overflowX="auto" opacity={isLoading ? 0.6 : 1} transition="opacity 0.15s">
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

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onChange={setPage}
        />
      )}
    </Stack>
  );
}
