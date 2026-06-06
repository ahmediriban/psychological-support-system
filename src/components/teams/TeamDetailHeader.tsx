"use client";

import { Badge, Box, HStack, Heading, Skeleton, Text } from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { Link } from "../../i18n/navigation";
import { useTeam } from "../../hooks/teams/useTeams";

type Props = {
  teamId: string;
  role: "ADMIN" | "SUPERVISOR" | "USER";
};

export function TeamDetailHeader({ teamId, role }: Props) {
  const t = useTranslations("teams");
  const { data: team, isLoading } = useTeam(teamId);

  const responsibleWorker = team?.users.find((u) => u.isTeamLeader) ?? team?.users.find((u) => u.role === "USER") ?? null;
  const memberCount = team?.users.filter((u) => u.role === "USER").length ?? 0;

  return (
    <Box mb={6}>
      {role === "ADMIN" && <Link href="/teams">
        <Text fontSize="sm" color="blue.500" mb={3} display="inline-block">
          ← {t("backToTeams")}
        </Text>
      </Link>}
      {isLoading ? (
        <Skeleton h="32px" w="200px" mb={2} />
      ) : (
        <HStack gap={3} flexWrap="wrap">
          <Heading size={{ base: "lg", md: "xl" }}>{team?.name}</Heading>
          {responsibleWorker ? (
            <Badge colorPalette="green">
              {responsibleWorker.name ?? responsibleWorker.email}
            </Badge>
          ) : (
            <Badge colorPalette="gray">{t("noWorker")}</Badge>
          )}
          {memberCount > 1 && (
            <Badge colorPalette="blue" variant="subtle">
              {t("membersCount", { count: memberCount })}
            </Badge>
          )}
        </HStack>
      )}
    </Box>
  );
}
