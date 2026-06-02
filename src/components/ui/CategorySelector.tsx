"use client";

import { Button, HStack, Text } from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import type { ItemCategoryEnum } from "../../schemas/items/create-item.schema";

const CATEGORIES: ItemCategoryEnum[] = ["MATERIALS_STATIONERY", "FIRST_AID", "HYGIENE", "PRINTING", "HOSPITALITY"];

type Props = {
  value: ItemCategoryEnum;
  onChange: (cat: ItemCategoryEnum) => void;
};

export function CategorySelector({ value, onChange }: Props) {
  const t = useTranslations("categories");

  return (
    <HStack gap={2} flexWrap="wrap">
      <Text fontSize="sm" color="gray.500" flexShrink={0}>
        {t("filterBy")}:
      </Text>
      {CATEGORIES.map((cat) => (
        <Button
          key={cat}
          size="sm"
          variant={value === cat ? "solid" : "outline"}
          colorPalette={value === cat ? "blue" : "gray"}
          onClick={() => onChange(cat)}
          borderRadius="full"
        >
          {t(cat)}
        </Button>
      ))}
    </HStack>
  );
}
