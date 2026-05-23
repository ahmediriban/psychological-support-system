"use client";

import {
  Badge,
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
  Field,
  HStack,
  NativeSelect,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAssignWorker, useWorkers } from "../../hooks/teams/useTeams";
import type { TeamSummary } from "../../types/team";

type Props = {
  team: TeamSummary | null;
  open: boolean;
  onClose: () => void;
};

export function AssignWorkerModal({ team, open, onClose }: Props) {
  const t = useTranslations("teams");
  const { data: allWorkers = [], isLoading } = useWorkers();
  const mutation = useAssignWorker();

  const currentWorker = team?.users[0] ?? null;
  const [selectedUserId, setSelectedUserId] = useState(currentWorker?.id ?? "");

  // Sync pre-selection when modal opens for a different team
  useEffect(() => {
    setSelectedUserId(currentWorker?.id ?? "");
    mutation.reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team?.id, open]);

  // Only show workers that are free OR already on this team
  const availableWorkers = allWorkers.filter(
    (w) => !w.teamId || w.teamId === team?.id
  );

  function handleClose() {
    setSelectedUserId(currentWorker?.id ?? "");
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

            {/* Current worker chip */}
            {currentWorker && (
              <Box mb={4} p={3} borderRadius="md" bg="green.50" borderWidth="1px" borderColor="green.200"
                _dark={{ bg: "green.900", borderColor: "green.700" }}>
                <Text fontSize="xs" color="green.600" mb={1} fontWeight="semibold">
                  {t("currentWorker")}
                </Text>
                <HStack gap={2}>
                  <Box w={2} h={2} borderRadius="full" bg="green.400" flexShrink={0} />
                  <Text fontSize="sm" fontWeight="medium">
                    {currentWorker.name ?? currentWorker.email}
                  </Text>
                  <Badge colorPalette="green" fontSize="xs">{t("assigned")}</Badge>
                </HStack>
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                <Field.Root>
                  <Field.Label>
                    {currentWorker ? t("replaceWorker") : t("selectWorker")}
                  </Field.Label>
                  {availableWorkers.length === 0 && !isLoading ? (
                    <Text fontSize="sm" color="gray.500">{t("noAvailableWorkers")}</Text>
                  ) : (
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                      >
                        <option value="">{t("selectWorker")}</option>
                        {availableWorkers.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name ?? w.email}
                            {w.teamId === team?.id ? ` (${t("current")})` : ""}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  )}
                </Field.Root>

                <Button
                  type="submit"
                  colorPalette="blue"
                  w="full"
                  loading={mutation.isPending}
                  disabled={!selectedUserId || selectedUserId === currentWorker?.id}
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
