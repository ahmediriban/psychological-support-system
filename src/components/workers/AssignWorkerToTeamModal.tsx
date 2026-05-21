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
import { useTeams } from "../../hooks/teams/useTeams";
import { useAssignWorkerToTeam } from "../../hooks/workers/useWorkers";
import type { Worker } from "../../types/worker";

type Props = {
  worker: Worker | null;
  open: boolean;
  onClose: () => void;
};

export function AssignWorkerToTeamModal({ worker, open, onClose }: Props) {
  const t = useTranslations("workers");
  const { data: teams = [], isLoading } = useTeams();
  const mutation = useAssignWorkerToTeam();
  const [selectedTeamId, setSelectedTeamId] = useState("");

  function handleClose() {
    setSelectedTeamId("");
    mutation.reset();
    onClose();
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!worker || !selectedTeamId) return;
    mutation.mutate(
      { workerId: worker.id, teamId: selectedTeamId },
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
              {t("assignTeam")} — {worker?.name ?? worker?.email}
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
                  <Field.Label>{t("selectTeam")}</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                    >
                      <option value="">{t("selectTeam")}</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  {teams.length === 0 && !isLoading && (
                    <Field.HelperText>{t("noTeams")}</Field.HelperText>
                  )}
                </Field.Root>
                <Button
                  type="submit"
                  colorPalette="teal"
                  w="full"
                  loading={mutation.isPending}
                  disabled={!selectedTeamId}
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
