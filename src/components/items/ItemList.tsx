"use client";

import { EmptyStateDescription, EmptyStateRoot, EmptyStateTitle, SimpleGrid } from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import type { ItemWithAvailable } from "../../hooks/items/useItems";
import type { Item } from "../../types/item";
import { ItemCard } from "./ItemCard";

type Props = {
  items: ItemWithAvailable[];
  isAdmin: boolean;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
};

export function ItemList({ items, isAdmin, onEdit, onDelete }: Props) {
  const t = useTranslations("items");

  if (items.length === 0) {
    return (
      <EmptyStateRoot>
        <EmptyStateTitle>{t("noItems")}</EmptyStateTitle>
        {isAdmin && (
          <EmptyStateDescription>{t("addItem")}</EmptyStateDescription>
        )}
      </EmptyStateRoot>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
          availableQuantity={item.availableQuantity}
        />
      ))}
    </SimpleGrid>
  );
}
