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
import { useCreateWorker } from "../../hooks/workers/useWorkers";
import { WorkerForm, type WorkerFormData } from "./WorkerForm";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateWorkerDialog({ open, onClose }: Props) {
  const t = useTranslations("workers");
  const mutation = useCreateWorker();

  function handleSubmit(data: WorkerFormData) {
    if (!data.password) return;
    mutation.mutate(
      { name: data.name, email: data.email, password: data.password },
      { onSuccess: onClose }
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addWorker")}</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody pb={6}>
            {mutation.isError && (
              <Text color="red.500" mb={3} fontSize="sm">
                {mutation.error.message}
              </Text>
            )}
            <WorkerForm
              mode="create"
              onSubmit={handleSubmit}
              isLoading={mutation.isPending}
            />
          </DialogBody>
        </DialogContent>
      </DialogPositioner>
    </Dialog.Root>
  );
}
