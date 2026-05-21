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
import { useDeleteWorker } from "../../hooks/workers/useWorkers";
import type { Worker } from "../../types/worker";

type Props = {
  worker: Worker | null;
  open: boolean;
  onClose: () => void;
};

export function DeleteWorkerDialog({ worker, open, onClose }: Props) {
  const t = useTranslations("workers");
  const mutation = useDeleteWorker();

  function handleConfirm() {
    if (!worker) return;
    mutation.mutate(worker.id, { onSuccess: onClose });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteWorker")}</DialogTitle>
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
                {t("deleteWorker")}
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </Dialog.Root>
  );
}
