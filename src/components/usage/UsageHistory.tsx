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
import { useTeamUsage, useUsageHistory } from "../../hooks/usage/useUsage";

type Props =
  | { mode: "team"; teamId: string }
  | { mode: "all" };

export function UsageHistory(props: Props) {
  const t = useTranslations("usage");

  const allQuery = useUsageHistory();
  const teamQuery = useTeamUsage(props.mode === "team" ? props.teamId : "");

  const { data = [], isLoading, isError } =
    props.mode === "team" ? teamQuery : allQuery;

  if (isLoading) {
    return (
      <Stack gap={3}>
        {[1, 2, 3].map((i) => <Skeleton key={i} h="56px" borderRadius="md" />)}
      </Stack>
    );
  }

  if (isError) return <Text color="red.500">{t("errorHistory")}</Text>;

  if (data.length === 0) {
    return (
      <EmptyStateRoot>
        <EmptyStateTitle>{t("noHistory")}</EmptyStateTitle>
      </EmptyStateRoot>
    );
  }

  return (
    <Box overflowX="auto">
      <Table.Root variant="outline" size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>{t("date")}</Table.ColumnHeader>
            {props.mode === "all" && <Table.ColumnHeader>{t("team")}</Table.ColumnHeader>}
            <Table.ColumnHeader>{t("item")}</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">{t("quantity")}</Table.ColumnHeader>
            <Table.ColumnHeader>{t("purpose")}</Table.ColumnHeader>
            <Table.ColumnHeader>{t("by")}</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((record) => (
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
              <Table.Cell fontSize="sm" color="gray.700" maxW="200px">
                <Text truncate>{record.purpose}</Text>
              </Table.Cell>
              <Table.Cell fontSize="xs" color="gray.500" whiteSpace="nowrap">
                {record.user?.name ?? record.user?.email ?? "—"}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
