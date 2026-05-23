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
import { useDistributionsPaged } from "../../hooks/distribution/useDistributions";
import { Pagination } from "../ui/Pagination";

export function DistributionHistory() {
  const t = useTranslations("distribution");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useDistributionsPaged(page);

  if (isLoading && !data) {
    return (
      <Stack gap={3}>
        {[1, 2, 3].map((i) => <Skeleton key={i} h="60px" borderRadius="md" />)}
      </Stack>
    );
  }

  if (isError) {
    return <Text color="red.500">{t("errorHistory")}</Text>;
  }

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
              <Table.ColumnHeader>{t("item")}</Table.ColumnHeader>
              <Table.ColumnHeader>{t("teams")}</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">{t("total")}</Table.ColumnHeader>
              <Table.ColumnHeader>{t("by")}</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {records.map((record) => {
              const meta = record.metadata;
              return (
                <Table.Row key={record.id}>
                  <Table.Cell whiteSpace="nowrap" color="gray.500" fontSize="xs">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <HStack gap={1}>
                      <Text fontWeight="medium">{meta.itemName}</Text>
                      {meta.itemUnit && (
                        <Badge colorPalette="gray" fontSize="xs">{meta.itemUnit}</Badge>
                      )}
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>
                    <Stack gap={0.5}>
                      {meta.teams.map((team) => (
                        <Text key={team.teamId} fontSize="xs" color="gray.600">
                          {team.teamName}: <strong>{team.quantity}</strong>
                        </Text>
                      ))}
                    </Stack>
                  </Table.Cell>
                  <Table.Cell textAlign="end" fontWeight="bold">
                    {meta.totalQuantity}
                  </Table.Cell>
                  <Table.Cell fontSize="xs" color="gray.500" whiteSpace="nowrap">
                    {record.user.name ?? record.user.email}
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
