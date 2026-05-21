"use client";

import {
  Badge,
  Box,
  HStack,
  Input,
  Separator,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import type { TeamAllocation } from "./QuantityAllocator";
import type { Item } from "../../types/item";

type Props = {
  item: Item;
  allocations: TeamAllocation[];
  note: string;
  onNoteChange: (note: string) => void;
};

export function DistributionSummary({ item, allocations, note, onNoteChange }: Props) {
  const t = useTranslations("distribution");
  const total = allocations.reduce((s, a) => s + a.quantity, 0);

  return (
    <Stack gap={5}>
      {/* Item */}
      <Box>
        <Text fontSize="xs" color="gray.500" mb={1} textTransform="uppercase" letterSpacing="wide">
          {t("item")}
        </Text>
        <HStack gap={2}>
          <Text fontWeight="semibold" fontSize="lg">{item.name}</Text>
          {item.unit && <Badge colorPalette="gray">{item.unit}</Badge>}
        </HStack>
      </Box>

      <Separator />

      {/* Teams breakdown */}
      <Box>
        <Text fontSize="xs" color="gray.500" mb={2} textTransform="uppercase" letterSpacing="wide">
          {t("distribution")}
        </Text>
        <Box overflowX="auto">
          <Table.Root variant="outline" size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{t("team")}</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">{t("quantity")}</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {allocations.map((a) => (
                <Table.Row key={a.teamId}>
                  <Table.Cell>{a.teamName}</Table.Cell>
                  <Table.Cell textAlign="end" fontWeight="medium">{a.quantity}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>

      {/* Total */}
      <HStack justify="space-between" px={1}>
        <Text fontWeight="semibold">{t("totalQuantity")}</Text>
        <Text fontWeight="bold" fontSize="lg">{total}</Text>
      </HStack>

      <Separator />

      {/* Note */}
      <Box>
        <Text fontSize="sm" mb={1} fontWeight="medium">{t("note")}</Text>
        <Input
          placeholder={t("notePlaceholder")}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          size="sm"
        />
      </Box>
    </Stack>
  );
}
