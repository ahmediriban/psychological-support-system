"use client";

import {
  Badge,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogPositioner,
  DialogTitle,
  HStack,
  RadioGroup,
  Separator,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LuCrown } from "react-icons/lu";
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

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [leaderId, setLeaderId] = useState<string>("");

  useEffect(() => {
    if (!open || !team) return;
    const currentIds = team.users.map((u) => u.id);
    const currentLeader = team.users.find((u) => u.isTeamLeader)?.id ?? currentIds[0] ?? "";
    setSelectedIds(currentIds);
    setLeaderId(currentLeader);
    mutation.reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team?.id, open]);

  // Workers free OR already on this team
  const availableWorkers = allWorkers.filter(
    (w) => !w.teamId || w.teamId === team?.id
  );

  function toggleMember(id: string) {
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      // If we removed the current leader, reset leader to first remaining
      if (!next.includes(leaderId)) setLeaderId(next[0] ?? "");
      return next;
    });
  }

  function handleClose() {
    mutation.reset();
    onClose();
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!team || selectedIds.length === 0 || !leaderId) return;
    mutation.mutate(
      { teamId: team.id, userIds: selectedIds, leaderId },
      { onSuccess: handleClose }
    );
  }

  const isUnchanged =
    selectedIds.length === team?.users.length &&
    team.users.every((u) => selectedIds.includes(u.id)) &&
    leaderId === (team.users.find((u) => u.isTeamLeader)?.id ?? team.users[0]?.id ?? "");

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && handleClose()}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent maxW={{ base: "95vw", md: "480px" }}>
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
              <Stack gap={5}>
                {/* Member selection */}
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={3} color="gray.600"
                    _dark={{ color: "gray.300" }}>
                    {t("selectMembers")}
                  </Text>

                  {isLoading ? (
                    <Text fontSize="sm" color="gray.400">{t("noWorkers")}</Text>
                  ) : availableWorkers.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">{t("noAvailableWorkers")}</Text>
                  ) : (
                    <VStack align="stretch" gap={0} borderWidth="1px" borderRadius="lg" overflow="hidden"
                      borderColor="gray.200" _dark={{ borderColor: "gray.700" }}>
                      {availableWorkers.map((w, i) => {
                        const isChecked = selectedIds.includes(w.id);
                        const isLeader = leaderId === w.id && isChecked;
                        return (
                          <Box key={w.id}>
                            {i > 0 && <Separator />}
                            <HStack
                              px={4} py={3} gap={3}
                              cursor="pointer"
                              bg={isChecked ? "blue.50" : "white"}
                              _dark={{ bg: isChecked ? "blue.900" : "gray.800" }}
                              _hover={{ bg: isChecked ? "blue.100" : "gray.50",
                                _dark: { bg: isChecked ? "blue.800" : "gray.700" } }}
                              onClick={() => toggleMember(w.id)}
                            >
                              <Checkbox.Root
                                checked={isChecked}
                                onCheckedChange={() => toggleMember(w.id)}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Checkbox.HiddenInput />
                                <Checkbox.Control />
                              </Checkbox.Root>

                              <Box flex={1} minW={0}>
                                <Text fontSize="sm" fontWeight="medium" truncate>
                                  {w.name ?? w.email}
                                </Text>
                                {w.name && (
                                  <Text fontSize="xs" color="gray.500" truncate>{w.email}</Text>
                                )}
                              </Box>

                              {isLeader && (
                                <Badge colorPalette="yellow" size="sm" gap={1}>
                                  <LuCrown size={10} />
                                  {t("leader")}
                                </Badge>
                              )}
                            </HStack>
                          </Box>
                        );
                      })}
                    </VStack>
                  )}
                </Box>

                {/* Leader selection — only visible when ≥1 member chosen */}
                {selectedIds.length > 0 && (
                  <Box
                    p={4} borderRadius="lg" bg="yellow.50" borderWidth="1px" borderColor="yellow.200"
                    _dark={{ bg: "yellow.900", borderColor: "yellow.700" }}
                  >
                    <HStack gap={2} mb={3}>
                      <LuCrown size={14} />
                      <Text fontSize="sm" fontWeight="semibold" color="yellow.700"
                        _dark={{ color: "yellow.300" }}>
                        {t("teamLeader")}
                      </Text>
                    </HStack>
                    <RadioGroup.Root
                      value={leaderId}
                      onValueChange={(e) => setLeaderId(e.value ?? "")}
                    >
                      <Stack gap={2}>
                        {selectedIds.map((id) => {
                          const w = allWorkers.find((x) => x.id === id);
                          if (!w) return null;
                          return (
                            <RadioGroup.Item key={id} value={id}>
                              <RadioGroup.ItemHiddenInput />
                              <RadioGroup.ItemIndicator />
                              <RadioGroup.ItemText fontSize="sm">
                                {w.name ?? w.email}
                              </RadioGroup.ItemText>
                            </RadioGroup.Item>
                          );
                        })}
                      </Stack>
                    </RadioGroup.Root>
                  </Box>
                )}

                <Button
                  type="submit"
                  colorPalette="blue"
                  w="full"
                  loading={mutation.isPending}
                  disabled={selectedIds.length === 0 || !leaderId || isUnchanged}
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
