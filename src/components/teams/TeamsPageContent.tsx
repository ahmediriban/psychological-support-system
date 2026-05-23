"use client";

import { Box, Button, HStack, Heading, Spinner, Text } from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useTeams } from "../../hooks/teams/useTeams";
import type { TeamSummary } from "../../types/team";
import { AssignWorkerModal } from "./AssignWorkerModal";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { TeamList } from "./TeamList";

type Props = {
  role: "ADMIN" | "SUPERVISOR";
};

export function TeamsPageContent({ role }: Props) {
  const t = useTranslations("teams");
  const isAdmin = role === "ADMIN";

  const { data: teams = [], isLoading, isError } = useTeams();

  const [showCreate, setShowCreate] = useState(false);
  const [assignTeam, setAssignTeam] = useState<TeamSummary | null>(null);

  if (isLoading) {
    return (
      <Box p={{ base: 4, md: 8 }} display="flex" justifyContent="center">
        <Spinner size="lg" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={{ base: 4, md: 8 }}>
        <Text color="red.500">{t("error")}</Text>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }}>
      <HStack justify="space-between" mb={6} gap={3} flexWrap="wrap">
        <Heading size={{ base: "md", md: "lg" }}>{t("title")}</Heading>
        {isAdmin && (
          <Button
            colorPalette="blue"
            size={{ base: "sm", md: "md" }}
            onClick={() => setShowCreate(true)}
          >
            {t("createTeam")}
          </Button>
        )}
      </HStack>

      <TeamList
        teams={teams}
        isAdmin={isAdmin}
        onAssignWorker={setAssignTeam}
      />

      <CreateTeamDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />

      <AssignWorkerModal
        team={assignTeam}
        open={!!assignTeam}
        onClose={() => setAssignTeam(null)}
      />
    </Box>
  );
}
