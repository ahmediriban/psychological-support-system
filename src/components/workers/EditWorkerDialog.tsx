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
import { useUpdateWorker } from "../../hooks/workers/useWorkers";
import type { Worker } from "../../types/worker";
import { WorkerForm, type WorkerFormData } from "./WorkerForm";

type Props = {
  worker: Worker | null;
  open: boolean;
  onClose: () => void;
};

export function EditWorkerDialog({ worker, open, onClose }: Props) {
  const t = useTranslations("workers");
  const mutation = useUpdateWorker();

  function handleSubmit(data: WorkerFormData) {
    if (!worker) return;
    mutation.mutate(
      { id: worker.id, name: data.name, email: data.email },
      { onSuccess: onClose }
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editWorker")}</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody pb={6}>
            {mutation.isError && (
              <Text color="red.500" mb={3} fontSize="sm">
                {mutation.error.message}
              </Text>
            )}
            <WorkerForm
              mode="edit"
              defaultValues={worker ?? undefined}
              onSubmit={handleSubmit}
              isLoading={mutation.isPending}
            />
          </DialogBody>
        </DialogContent>
      </DialogPositioner>
    </Dialog.Root>
  );
}
