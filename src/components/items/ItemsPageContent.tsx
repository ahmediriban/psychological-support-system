"use client";

import {
  Box,
  Button,
  Dialog,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogPositioner,
  DialogTitle,
  HStack,
  Heading,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCreateItem, useItemsWithAvailable } from "../../hooks/items/useItems";
import { useSelectedCategory } from "../../hooks/useSelectedCategory";
import type { Item } from "../../types/item";
import { CategorySelector } from "../ui/CategorySelector";
import { DeleteItemDialog } from "./DeleteItemDialog";
import { EditItemDialog } from "./EditItemDialog";
import { ItemForm } from "./ItemForm";
import { ItemList } from "./ItemList";

type Props = {
  role: "ADMIN" | "SUPERVISOR";
};

export function ItemsPageContent({ role }: Props) {
  const t = useTranslations("items");
  const isAdmin = role === "ADMIN";

  const { category, setCategory } = useSelectedCategory();
  const { data: items = [], isLoading, isError } = useItemsWithAvailable(category);
  const createMutation = useCreateItem();

  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [deleteItem, setDeleteItem] = useState<Item | null>(null);

  if (isLoading) {
    return (
      <Box p={{ base: 4, md: 8 }} display="flex" justifyContent="center">
        <Spinner size="lg" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={{ base: 4, md: 8 }}>
        <Text color="red.500">{t("error")}</Text>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }}>
      <HStack justify="space-between" mb={4} gap={3} flexWrap="wrap">
        <Heading size={{ base: "md", md: "lg" }}>{t("title")}</Heading>
        {isAdmin && (
          <Button
            colorPalette="blue"
            size={{ base: "sm", md: "md" }}
            onClick={() => setShowCreate(true)}
          >
            {t("addItem")}
          </Button>
        )}
      </HStack>

      <Box mb={6}>
        <CategorySelector value={category} onChange={setCategory} />
      </Box>

      <ItemList
        items={items}
        isAdmin={isAdmin}
        onEdit={setEditItem}
        onDelete={setDeleteItem}
      />

      {/* Create dialog */}
      <Dialog.Root open={showCreate} onOpenChange={(e) => !e.open && setShowCreate(false)}>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addItem")}</DialogTitle>
              <DialogCloseTrigger />
            </DialogHeader>
            <DialogBody pb={6}>
              {createMutation.isError && (
                <Text color="red.500" mb={3} fontSize="sm">
                  {createMutation.error.message}
                </Text>
              )}
              <ItemForm
                defaultValues={{ name: "", category }}
                onSubmit={(data) =>
                  createMutation.mutate(data, { onSuccess: () => setShowCreate(false) })
                }
                isLoading={createMutation.isPending}
              />
            </DialogBody>
          </DialogContent>
        </DialogPositioner>
      </Dialog.Root>

      <EditItemDialog
        item={editItem}
        open={!!editItem}
        onClose={() => setEditItem(null)}
      />

      <DeleteItemDialog
        item={deleteItem}
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
      />
    </Box>
  );
}
