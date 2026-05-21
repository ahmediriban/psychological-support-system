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
import { useDeleteTeam } from "../../hooks/teams/useTeams";
import type { TeamSummary } from "../../types/team";

type Props = {
  team: TeamSummary | null;
  open: boolean;
  onClose: () => void;
};

export function DeleteTeamDialog({ team, open, onClose }: Props) {
  const t = useTranslations("teams");
  const mutation = useDeleteTeam();

  function handleConfirm() {
    if (!team) return;
    mutation.mutate(team.id, { onSuccess: onClose });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteTeam")}</DialogTitle>
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
                {t("deleteTeam")}
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </Dialog.Root>
  );
}
