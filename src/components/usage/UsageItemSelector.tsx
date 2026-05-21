"use client";

import {
  Badge,
  Box,
  CardBody,
  CardRoot,
  HStack,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useTeamStock } from "../../hooks/teams/useTeams";

export type StockItem = {
  itemId: string;
  itemName: string;
  itemUnit: string | null;
  available: number;
};

type Props = {
  teamId: string;
  selectedItemId: string | null;
  onSelect: (item: StockItem) => void;
};

export function UsageItemSelector({ teamId, selectedItemId, onSelect }: Props) {
  const t = useTranslations("usage");
  const { data: stock = [], isLoading, isError } = useTeamStock(teamId);

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} h="72px" borderRadius="md" />)}
      </SimpleGrid>
    );
  }

  if (isError) return <Text color="red.500">{t("errorStock")}</Text>;

  // Only items with stock > 0 are selectable
  const available = stock.filter((s) => s.quantity > 0);

  if (available.length === 0) {
    return (
      <Box
        px={4}
        py={6}
        borderWidth="1px"
        borderRadius="md"
        borderColor="orange.200"
        bg="orange.50"
        textAlign="center"
      >
        <Text color="orange.700" fontWeight="medium">{t("noStock")}</Text>
        <Text color="orange.500" fontSize="sm" mt={1}>{t("noStockHint")}</Text>
      </Box>
    );
  }

  return (
    <Stack gap={2}>
      <Text fontSize="sm" color="gray.500">{t("selectItemHint")}</Text>
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
        {available.map((s) => {
          const isSelected = s.item.id === selectedItemId;
          return (
            <CardRoot
              key={s.item.id}
              size="sm"
              variant="outline"
              cursor="pointer"
              borderColor={isSelected ? "green.500" : "gray.200"}
              bg={isSelected ? "green.50" : "white"}
              _dark={{ bg: isSelected ? "green.900" : "transparent" }}
              onClick={() =>
                onSelect({
                  itemId: s.item.id,
                  itemName: s.item.name,
                  itemUnit: s.item.unit,
                  available: s.quantity,
                })
              }
              transition="all 0.1s"
            >
              <CardBody>
                <HStack justify="space-between" align="start">
                  <Box>
                    <Text fontWeight={isSelected ? "semibold" : "medium"} fontSize="sm">
                      {s.item.name}
                    </Text>
                    {s.item.unit && (
                      <Badge colorPalette={isSelected ? "green" : "gray"} mt={1} fontSize="xs">
                        {s.item.unit}
                      </Badge>
                    )}
                  </Box>
                  <Badge colorPalette={isSelected ? "green" : "blue"} flexShrink={0}>
                    {s.quantity}
                  </Badge>
                </HStack>
              </CardBody>
            </CardRoot>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
