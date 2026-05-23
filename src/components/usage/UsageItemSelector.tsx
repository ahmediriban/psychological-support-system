"use client";

import {
  Badge,
  Box,
  HStack,
  Input,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useTeamStockSearch } from "../../hooks/teams/useTeams";

export type StockItem = {
  itemId: string;
  itemName: string;
  itemUnit: string | null;
  available: number;
};

type Props = {
  teamId: string;
  category: string;
  selectedItemId: string | null;
  onSelect: (item: StockItem) => void;
  onClear: () => void;
};

export function UsageItemSelector({ teamId, category, selectedItemId, onSelect, onClear }: Props) {
  const t = useTranslations("usage");

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results = [], isLoading } = useTeamStockSearch(teamId, query, category);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset query when team or category changes
  useEffect(() => {
    setQuery("");
    setIsOpen(false);
  }, [teamId, category]);

  const selectedResult = results.find((s) => s.item.id === selectedItemId) ?? null;

  function handleSelect(s: (typeof results)[number]) {
    onSelect({
      itemId: s.item.id,
      itemName: s.item.name,
      itemUnit: s.item.unit,
      available: s.quantity,
    });
    setQuery("");
    setIsOpen(false);
  }

  return (
    <Stack gap={3}>
      {/* Selected item chip */}
      {selectedResult && (
        <Box
          px={3}
          py={2}
          borderRadius="md"
          bg="green.50"
          borderWidth="1px"
          borderColor="green.300"
          _dark={{ bg: "green.900", borderColor: "green.600" }}
        >
          <HStack justify="space-between" gap={2}>
            <Box minW={0}>
              <Text fontWeight="semibold" fontSize="sm" truncate>
                {selectedResult.item.name}
              </Text>
              <HStack gap={1} mt={0.5}>
                {selectedResult.item.unit && (
                  <Badge colorPalette="green" fontSize="xs">{selectedResult.item.unit}</Badge>
                )}
                <Text fontSize="xs" color="green.700" fontWeight="medium">
                  {t("available")}: {selectedResult.quantity}
                  {selectedResult.item.unit ? ` ${selectedResult.item.unit}` : ""}
                </Text>
              </HStack>
            </Box>
            <Text
              fontSize="xs"
              color="green.600"
              cursor="pointer"
              flexShrink={0}
              onClick={() => {
                onClear();
                setQuery("");
                setIsOpen(true);
              }}
            >
              {t("changeItem")}
            </Text>
          </HStack>
        </Box>
      )}

      {/* No stock at all (empty results and no query) */}
      {!isLoading && results.length === 0 && !query && !selectedItemId && (
        <Box
          px={4}
          py={5}
          borderWidth="1px"
          borderRadius="md"
          borderColor="orange.200"
          bg="orange.50"
          _dark={{ bg: "orange.950", borderColor: "orange.700" }}
          textAlign="center"
        >
          <Text color="orange.700" fontWeight="medium">{t("noStock")}</Text>
          <Text color="orange.500" fontSize="sm" mt={1}>{t("noStockHint")}</Text>
        </Box>
      )}

      {/* Search input + dropdown */}
      <Box ref={containerRef} position="relative">
        <Input
          placeholder={t("searchItemPlaceholder")}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
        />

        {isOpen && (
          <Box
            position="absolute"
            top="calc(100% + 4px)"
            left={0}
            right={0}
            zIndex={50}
            bg="white"
            _dark={{ bg: "gray.800", borderColor: "gray.600" }}
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="md"
            boxShadow="md"
            maxH="280px"
            overflowY="auto"
          >
            {isLoading ? (
              <HStack px={4} py={3} gap={2}>
                <Spinner size="sm" />
                <Text fontSize="sm" color="gray.500">{t("searching")}</Text>
              </HStack>
            ) : results.length === 0 ? (
              <Box px={4} py={3}>
                <Text fontSize="sm" color="gray.500">
                  {query ? t("noMatchingStock") : t("noStock")}
                </Text>
              </Box>
            ) : (
              results.map((s) => {
                const isSelected = s.item.id === selectedItemId;
                return (
                  <HStack
                    key={s.item.id}
                    px={4}
                    py={3}
                    gap={3}
                    cursor="pointer"
                    bg={isSelected ? "green.50" : "transparent"}
                    _dark={{
                      bg: isSelected ? "green.900" : "transparent",
                      borderColor: "gray.700",
                      _hover: { bg: isSelected ? "green.800" : "gray.700" },
                    }}
                    _hover={{ bg: isSelected ? "green.100" : "gray.50" }}
                    borderBottomWidth="1px"
                    borderColor="gray.100"
                    _last={{ borderBottomWidth: 0 }}
                    onClick={() => handleSelect(s)}
                    justify="space-between"
                  >
                    <Box minW={0} flex={1}>
                      <HStack gap={2}>
                        <Text fontSize="sm" fontWeight={isSelected ? "semibold" : "normal"} truncate>
                          {s.item.name}
                        </Text>
                        {s.item.unit && (
                          <Badge colorPalette="gray" fontSize="xs" flexShrink={0}>
                            {s.item.unit}
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                    <Badge colorPalette={isSelected ? "green" : "blue"} flexShrink={0}>
                      {s.quantity}
                    </Badge>
                  </HStack>
                );
              })
            )}
          </Box>
        )}
      </Box>
    </Stack>
  );
}
