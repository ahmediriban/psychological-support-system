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
import { useItemSearch, type ItemWithAvailable } from "../../hooks/items/useItems";

type Props = {
  selectedItemId: string | null;
  onSelect: (item: ItemWithAvailable) => void;
  onClear: () => void;
  category?: string;
};

export function ItemSelector({ selectedItemId, onSelect, onClear, category }: Props) {
  const t = useTranslations("distribution");
  const ti = useTranslations("items");

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results = [], isLoading } = useItemSearch(query, category);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // When category changes, clear any query so results refresh
  useEffect(() => {
    setQuery("");
  }, [category]);

  const selectedItem = results.find((i) => i.id === selectedItemId) ?? null;

  function handleInputChange(value: string) {
    setQuery(value);
    setIsOpen(true);
  }

  function handleSelect(item: ItemWithAvailable) {
    if (item.availableQuantity === 0) return;
    onSelect(item);
    setQuery("");
    setIsOpen(false);
  }

  function handleFocus() {
    setIsOpen(true);
  }

  return (
    <Stack gap={3}>
      <Text fontSize="sm" color="gray.500">{t("selectItemHint")}</Text>

      {/* Selected item chip */}
      {selectedItem && (
        <Box
          px={3}
          py={2}
          borderRadius="md"
          bg="blue.50"
          borderWidth="1px"
          borderColor="blue.300"
          _dark={{ bg: "blue.900", borderColor: "blue.600" }}
        >
          <HStack justify="space-between" gap={2}>
            <Box minW={0}>
              <Text fontWeight="semibold" fontSize="sm" truncate>
                {selectedItem.name}
              </Text>
              <HStack gap={1} mt={0.5}>
                {selectedItem.unit && (
                  <Badge colorPalette="blue" fontSize="xs">{selectedItem.unit}</Badge>
                )}
                <Text fontSize="xs" color="green.600" fontWeight="medium">
                  {ti("available")}: {selectedItem.availableQuantity}
                  {selectedItem.unit ? ` ${selectedItem.unit}` : ""}
                </Text>
              </HStack>
            </Box>
            <Text
              fontSize="xs"
              color="blue.500"
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

      {/* Search input + dropdown */}
      <Box ref={containerRef} position="relative">
        <Input
          placeholder={t("searchItemPlaceholder")}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
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
            maxH="300px"
            overflowY="auto"
          >
            {isLoading ? (
              <HStack px={4} py={3} gap={2}>
                <Spinner size="sm" />
                <Text fontSize="sm" color="gray.500">{t("searching")}</Text>
              </HStack>
            ) : results.length === 0 ? (
              <Box px={4} py={3}>
                <Text fontSize="sm" color="gray.500">{t("noItems")}</Text>
              </Box>
            ) : (
              results.map((item) => {
                const isSelected = item.id === selectedItemId;
                const outOfStock = item.availableQuantity === 0;
                return (
                  <HStack
                    key={item.id}
                    px={4}
                    py={3}
                    gap={3}
                    cursor={outOfStock ? "not-allowed" : "pointer"}
                    bg={isSelected ? "blue.50" : "transparent"}
                    _dark={{
                      bg: isSelected ? "blue.900" : "transparent",
                      borderColor: "gray.700",
                      _hover: { bg: outOfStock ? undefined : isSelected ? "blue.800" : "gray.700" },
                    }}
                    opacity={outOfStock ? 0.5 : 1}
                    _hover={{ bg: outOfStock ? undefined : isSelected ? "blue.100" : "gray.50" }}
                    borderBottomWidth="1px"
                    borderColor="gray.100"
                    _last={{ borderBottomWidth: 0 }}
                    onClick={() => handleSelect(item)}
                    justify="space-between"
                  >
                    <Box minW={0} flex={1}>
                      <HStack gap={2}>
                        <Text fontSize="sm" fontWeight={isSelected ? "semibold" : "normal"} truncate>
                          {item.name}
                        </Text>
                        {item.unit && (
                          <Badge colorPalette="gray" fontSize="xs" flexShrink={0}>
                            {item.unit}
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color={outOfStock ? "red.500" : "green.600"}
                      flexShrink={0}
                    >
                      {outOfStock ? t("outOfStock") : `${ti("available")}: ${item.availableQuantity}`}
                    </Text>
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
