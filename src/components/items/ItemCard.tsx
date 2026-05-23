"use client";

import { Badge, Box, CardBody, CardRoot, HStack, IconButton, Separator, Text } from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import type { Item } from "../../types/item";

const CATEGORY_COLORS: Record<string, string> = {
  MATERIALS_STATIONERY: "blue",
  FIRST_AID: "red",
  HYGIENE: "green",
};

type Props = {
  item: Item;
  isAdmin: boolean;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
};

export function ItemCard({ item, isAdmin, onEdit, onDelete }: Props) {
  const t = useTranslations("items");
  const tc = useTranslations("categories");
  const color = CATEGORY_COLORS[item.category] ?? "gray";

  return (
    <CardRoot size="sm" variant="outline">
      <CardBody>
        <HStack justify="space-between" align="start" gap={3}>
          <Box flex={1} minW={0}>
            <Text fontWeight="semibold" truncate>
              {item.name}
            </Text>
            <HStack gap={1} mt={1} flexWrap="wrap">
              <Badge colorPalette={color} fontSize="xs">
                {tc(item.category)}
              </Badge>
              {item.unit && (
                <Badge colorPalette="gray" fontSize="xs">
                  {item.unit}
                </Badge>
              )}
            </HStack>
          </Box>

          {isAdmin && (
            <HStack gap={1} flexShrink={0}>
              <IconButton
                aria-label={t("editItem")}
                size="sm"
                variant="ghost"
                colorPalette="blue"
                onClick={() => onEdit(item)}
              >
                ✏️
              </IconButton>
              <IconButton
                aria-label={t("deleteItem")}
                size="sm"
                variant="ghost"
                colorPalette="red"
                onClick={() => onDelete(item)}
              >
                🗑️
              </IconButton>
            </HStack>
          )}
        </HStack>

        <Separator my={2} />

        <HStack fontSize="xs" color="gray.600">
          <Box>
            <Text color="gray.400">{t("totalQuantity")}</Text>
            <Text fontWeight="semibold" fontSize="sm">
              {item.totalQuantity}
              {item.unit ? ` ${item.unit}` : ""}
            </Text>
          </Box>
        </HStack>
      </CardBody>
    </CardRoot>
  );
}
