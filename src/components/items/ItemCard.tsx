"use client";

import { Badge, Box, CardBody, CardRoot, HStack, IconButton, Text } from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import type { Item } from "../../types/item";

type Props = {
  item: Item;
  isAdmin: boolean;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
};

export function ItemCard({ item, isAdmin, onEdit, onDelete }: Props) {
  const t = useTranslations("items");

  return (
    <CardRoot size="sm" variant="outline">
      <CardBody>
        <HStack justify="space-between" align="start" gap={3}>
          <Box flex={1} minW={0}>
            <Text fontWeight="semibold" truncate>
              {item.name}
            </Text>
            {item.unit && (
              <Badge colorPalette="gray" mt={1} fontSize="xs">
                {item.unit}
              </Badge>
            )}
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
      </CardBody>
    </CardRoot>
  );
}
