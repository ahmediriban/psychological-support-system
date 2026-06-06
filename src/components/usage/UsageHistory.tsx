"use client";

import {
  Badge,
  Box,
  EmptyStateRoot,
  EmptyStateTitle,
  HStack,
  Skeleton,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useTeamUsagePaged, useUsageHistoryPaged } from "../../hooks/usage/useUsage";
import { Pagination } from "../ui/Pagination";

type Props =
  | { mode: "team"; teamId: string }
  | { mode: "all" };

export function UsageHistory(props: Props) {
  const t = useTranslations("usage");
  const [page, setPage] = useState(1);

  const allQuery = useUsageHistoryPaged(page);
  const teamQuery = useTeamUsagePaged(props.mode === "team" ? props.teamId : "", page);

  const { data, isLoading, isError } = props.mode === "team" ? teamQuery : allQuery;

  if (isLoading && !data) {
    return (
      <Stack gap={3}>
        {[1, 2, 3].map((i) => <Skeleton key={i} h="56px" borderRadius="md" />)}
      </Stack>
    );
  }

  if (isError) return <Text color="red.500">{t("errorHistory")}</Text>;

  const records = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 12;

  if (records.length === 0 && page === 1) {
    return (
      <EmptyStateRoot>
        <EmptyStateTitle>{t("noHistory")}</EmptyStateTitle>
      </EmptyStateRoot>
    );
  }

  return (
    <Stack gap={4}>
      <Box overflowX="auto" opacity={isLoading ? 0.6 : 1} transition="opacity 0.15s">
        <Table.Root variant="outline" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>{t("date")}</Table.ColumnHeader>
              {props.mode === "all" && <Table.ColumnHeader>{t("team")}</Table.ColumnHeader>}
              <Table.ColumnHeader>{t("item")}</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">{t("quantity")}</Table.ColumnHeader>
              <Table.ColumnHeader>{t("usageType")}</Table.ColumnHeader>
              <Table.ColumnHeader>{t("by")}</Table.ColumnHeader>
              <Table.ColumnHeader>{t("createdBy")}</Table.ColumnHeader>
              <Table.ColumnHeader>{t("purpose")}</Table.ColumnHeader>
              <Table.ColumnHeader>{t("location")}</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {records.map((record) => {
              const isLogOnly = record.quantity === 0;
              return (
                <Table.Row key={record.id}>
                  <Table.Cell whiteSpace="nowrap" color="gray.500" fontSize="xs">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  {props.mode === "all" && (
                    <Table.Cell fontSize="sm">{record.team.name}</Table.Cell>
                  )}
                  <Table.Cell>
                    <HStack gap={1}>
                      <Text fontWeight="medium" fontSize="sm">{record.item.name}</Text>
                      {record.item.unit && (
                        <Badge colorPalette="gray" fontSize="xs">{record.item.unit}</Badge>
                      )}
                    </HStack>
                  </Table.Cell>
                  <Table.Cell textAlign="end" fontWeight="bold">{record.quantity}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={isLogOnly ? "blue" : "orange"} size="sm">
                      {isLogOnly ? t("logOnly") : t("consume")}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell fontSize="xs" color="gray.700" whiteSpace="nowrap">
                    {record.teamLeader?.name ?? record.teamLeader?.email ?? "—"}
                  </Table.Cell>
                  <Table.Cell fontSize="xs" color="gray.500" whiteSpace="nowrap">
                    {record.user?.name ?? record.user?.email ?? "—"}
                  </Table.Cell>
                  <Table.Cell fontSize="sm" color="gray.700" maxW="200px">
                    <Text truncate>{record.purpose}</Text>
                  </Table.Cell>
                  <Table.Cell fontSize="sm" color="gray.500" maxW="160px">
                    <Text truncate>{record.location ?? "—"}</Text>
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
