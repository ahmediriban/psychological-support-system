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
import { useItemsWithAvailable, type ItemWithAvailable } from "../../hooks/items/useItems";

type Props = {
  selectedItemId: string | null;
  onSelect: (item: ItemWithAvailable) => void;
  category?: string;
};

export function ItemSelector({ selectedItemId, onSelect, category }: Props) {
  const t = useTranslations("distribution");
  const ti = useTranslations("items");
  const { data: items = [], isLoading, isError } = useItemsWithAvailable(category);

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} h="88px" borderRadius="md" />)}
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
          const outOfStock = item.availableQuantity === 0;
          return (
            <CardRoot
              key={item.id}
              size="sm"
              variant="outline"
              cursor={outOfStock ? "not-allowed" : "pointer"}
              borderColor={isSelected ? "blue.500" : outOfStock ? "red.200" : "gray.200"}
              bg={isSelected ? "blue.50" : outOfStock ? "red.50" : "white"}
              _dark={{ bg: isSelected ? "blue.900" : outOfStock ? "red.950" : "transparent" }}
              onClick={() => !outOfStock && onSelect(item)}
              transition="all 0.1s"
              opacity={outOfStock ? 0.7 : 1}
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
                <Box mt={2}>
                  <Text fontSize="xs" color={outOfStock ? "red.500" : "green.600"} fontWeight="semibold">
                    {ti("available")}: {item.availableQuantity}
                    {item.unit ? ` ${item.unit}` : ""}
                  </Text>
                </Box>
              </CardBody>
            </CardRoot>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
