"use client";

import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogTitle,
  HStack,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useDeleteItem } from "../../hooks/items/useItems";
import type { Item } from "../../types/item";

type Props = {
  item: Item | null;
  open: boolean;
  onClose: () => void;
};

export function DeleteItemDialog({ item, open, onClose }: Props) {
  const t = useTranslations("items");
  const mutation = useDeleteItem();

  function handleConfirm() {
    if (!item) return;
    mutation.mutate(item.id, { onSuccess: onClose });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteItem")}</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <Text>{t("confirmDelete")}</Text>
            <Text color="red.500" fontSize="sm" mt={1}>
              {t("deleteWarning")}
            </Text>
            {mutation.isError && (
              <Text color="red.500" fontSize="sm" mt={2}>
                {mutation.error.message}
              </Text>
            )}
          </DialogBody>
          <DialogFooter>
            <HStack gap={3} w="full" justify="flex-end">
              <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
                {t("cancel")}
              </Button>
              <Button
                colorPalette="red"
                loading={mutation.isPending}
                onClick={handleConfirm}
              >
                {t("deleteItem")}
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </Dialog.Root>
  );
}
