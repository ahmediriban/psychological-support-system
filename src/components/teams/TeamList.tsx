"use client";

import { EmptyStateRoot, EmptyStateTitle, SimpleGrid } from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import type { TeamSummary } from "../../types/team";
import { TeamCard } from "./TeamCard";

type Props = {
  teams: TeamSummary[];
  isAdmin: boolean;
  onAssignWorker: (team: TeamSummary) => void;
};

export function TeamList({ teams, isAdmin, onAssignWorker }: Props) {
  const t = useTranslations("teams");

  if (teams.length === 0) {
    return (
      <EmptyStateRoot>
        <EmptyStateTitle>{t("noTeams")}</EmptyStateTitle>
      </EmptyStateRoot>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          isAdmin={isAdmin}
          onAssignWorker={onAssignWorker}
        />
      ))}
    </SimpleGrid>
  );
}
