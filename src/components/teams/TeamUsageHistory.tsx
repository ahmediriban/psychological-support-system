"use client";

import {
  Badge,
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
import { useTeamUsagePaged } from "../../hooks/teams/useTeams";
import { Pagination } from "../ui/Pagination";

type Props = { teamId: string };

export function TeamUsageHistory({ teamId }: Props) {
  const t = useTranslations("teams");
  const tu = useTranslations("usage");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useTeamUsagePaged(teamId, page);

  if (isLoading && !data) return <Skeleton h="120px" />;
  if (isError) return <Text color="red.500">{t("error")}</Text>;

  const usage = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 12;

  if (usage.length === 0 && page === 1) {
    return (
      <EmptyStateRoot>
        <EmptyStateTitle>{t("usageEmpty")}</EmptyStateTitle>
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
              <Table.ColumnHeader>{t("quantity")}</Table.ColumnHeader>
              <Table.ColumnHeader>{tu("usageType")}</Table.ColumnHeader>
              <Table.ColumnHeader>{t("worker")}</Table.ColumnHeader>
              <Table.ColumnHeader>{tu("createdBy")}</Table.ColumnHeader>
              <Table.ColumnHeader>{t("purpose")}</Table.ColumnHeader>
              <Table.ColumnHeader>{t("location")}</Table.ColumnHeader>
              <Table.ColumnHeader>{t("date")}</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {usage.map((entry) => {
              const isLogOnly = entry.quantity === 0;
              return (
                <Table.Row key={entry.id}>
                  <Table.Cell fontWeight="medium">{entry.item.name}</Table.Cell>
                  <Table.Cell>{entry.quantity}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={isLogOnly ? "blue" : "orange"} size="sm">
                      {isLogOnly ? tu("logOnly") : tu("consume")}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell color="gray.700">
                    {(entry as any).teamLeader?.name ?? (entry as any).teamLeader?.email ?? "—"}
                  </Table.Cell>
                  <Table.Cell color="gray.500">
                    {entry.user?.name ?? entry.user?.email ?? "—"}
                  </Table.Cell>
                  <Table.Cell>{entry.purpose}</Table.Cell>
                  <Table.Cell color="gray.500">{entry.location ?? "—"}</Table.Cell>
                  <Table.Cell color="gray.500" whiteSpace="nowrap">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </Table.Cell>
                </Table.Row>
              );
            })}
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
