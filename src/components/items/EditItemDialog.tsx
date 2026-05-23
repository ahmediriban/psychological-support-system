"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogPositioner,
  DialogTitle,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useUpdateItem } from "../../hooks/items/useItems";
import type { CreateItemInput } from "../../schemas/items/create-item.schema";
import type { Item } from "../../types/item";
import { ItemForm } from "./ItemForm";

type Props = {
  item: Item | null;
  open: boolean;
  onClose: () => void;
};

export function EditItemDialog({ item, open, onClose }: Props) {
  const t = useTranslations("items");
  const mutation = useUpdateItem();

  function handleSubmit(data: CreateItemInput) {
    if (!item) return;
    mutation.mutate(
      { id: item.id, ...data },
      { onSuccess: onClose }
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editItem")}</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody pb={6}>
            {mutation.isError && (
              <Text color="red.500" mb={3} fontSize="sm">
                {mutation.error.message}
              </Text>
            )}
            <ItemForm
              defaultValues={item ?? undefined}
              onSubmit={handleSubmit}
              isLoading={mutation.isPending}
            />
          </DialogBody>
        </DialogContent>
      </DialogPositioner>
    </Dialog.Root>
  );
}
