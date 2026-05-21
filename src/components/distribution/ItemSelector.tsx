"use client";

import {
  Badge,
  Box,
  CardBody,
  CardRoot,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useItems } from "../../hooks/items/useItems";
import type { Item } from "../../types/item";

type Props = {
  selectedItemId: string | null;
  onSelect: (item: Item) => void;
};

export function ItemSelector({ selectedItemId, onSelect }: Props) {
  const t = useTranslations("distribution");
  const { data: items = [], isLoading, isError } = useItems();

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} h="72px" borderRadius="md" />)}
      </SimpleGrid>
    );
  }

  if (isError) {
    return <Text color="red.500">{t("errorItems")}</Text>;
  }

  if (items.length === 0) {
    return <Text color="gray.500">{t("noItems")}</Text>;
  }

  return (
    <Stack gap={2}>
      <Text fontSize="sm" color="gray.500" mb={1}>{t("selectItemHint")}</Text>
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
        {items.map((item) => {
          const isSelected = item.id === selectedItemId;
          return (
            <CardRoot
              key={item.id}
              size="sm"
              variant="outline"
              cursor="pointer"
              borderColor={isSelected ? "blue.500" : "gray.200"}
              bg={isSelected ? "blue.50" : "white"}
              _dark={{ bg: isSelected ? "blue.900" : "transparent" }}
              onClick={() => onSelect(item)}
              transition="all 0.1s"
            >
              <CardBody>
                <Text fontWeight={isSelected ? "semibold" : "medium"}>
                  {item.name}
                </Text>
                {item.unit && (
                  <Badge colorPalette={isSelected ? "blue" : "gray"} mt={1} fontSize="xs">
                    {item.unit}
                  </Badge>
                )}
              </CardBody>
            </CardRoot>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
