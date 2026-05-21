"use client";

import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogPositioner,
  DialogTitle,
  Field,
  NativeSelect,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAssignWorker, useWorkers } from "../../hooks/teams/useTeams";
import type { TeamSummary } from "../../types/team";

type Props = {
  team: TeamSummary | null;
  open: boolean;
  onClose: () => void;
};

export function AssignWorkerModal({ team, open, onClose }: Props) {
  const t = useTranslations("teams");
  const { data: workers = [], isLoading } = useWorkers();
  const mutation = useAssignWorker();
  const [selectedUserId, setSelectedUserId] = useState("");

  function handleClose() {
    setSelectedUserId("");
    mutation.reset();
    onClose();
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!team || !selectedUserId) return;
    mutation.mutate(
      { teamId: team.id, userId: selectedUserId },
      { onSuccess: handleClose }
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && handleClose()}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("assignWorker")} — {team?.name}
            </DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody pb={6}>
            {mutation.isError && (
              <Text color="red.500" mb={3} fontSize="sm">
                {mutation.error.message}
              </Text>
            )}
            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                <Field.Root>
                  <Field.Label>{t("selectWorker")}</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                      <option value="">{t("selectWorker")}</option>
                      {workers.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name ?? w.email}
                          {w.teamId ? ` (${t("assigned")})` : ""}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  {workers.length === 0 && !isLoading && (
                    <Field.HelperText>{t("noWorkers")}</Field.HelperText>
                  )}
                </Field.Root>
                <Button
                  type="submit"
                  colorPalette="blue"
                  w="full"
                  loading={mutation.isPending}
                  disabled={!selectedUserId}
                >
                  {t("save")}
                </Button>
              </Stack>
            </form>
          </DialogBody>
        </DialogContent>
      </DialogPositioner>
    </Dialog.Root>
  );
}
