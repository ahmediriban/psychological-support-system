"use client";

import {
  Badge,
  Box,
  Button,
  CardBody,
  CardRoot,
  HStack,
  Heading,
  StatLabel,
  StatRoot,
  StatValueText,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { Link } from "../../i18n/navigation";
import type { TeamSummary } from "../../types/team";
import { DeleteTeamDialog } from "./DeleteTeamDialog";
import { useState } from "react";

type Props = {
  team: TeamSummary;
  isAdmin: boolean;
  onAssignWorker: (team: TeamSummary) => void;
};

export function TeamCard({ team, isAdmin, onAssignWorker }: Props) {
  const t = useTranslations("teams");
  const responsibleWorker = team.users[0] ?? null;
  const [showDelete, setShowDelete] = useState(false);
  return (
    <CardRoot size="md" variant="outline" h="full">
      <CardBody>
        <VStack align="stretch" gap={4} h="full">
          <Box>
            <Heading size="md" mb={1}>
              {team.name}
            </Heading>
            {responsibleWorker ? (
              <Badge colorPalette="green" fontSize="xs">
                {responsibleWorker.name ?? responsibleWorker.email}
              </Badge>
            ) : (
              <Text fontSize="xs" color="gray.400">
                {t("noWorker")}
              </Text>
            )}
          </Box>

          <HStack gap={4} justify="start">
            <StatRoot size="sm">
              <StatLabel>{t("stockItems")}</StatLabel>
              <StatValueText>{team._count.stocks}</StatValueText>
            </StatRoot>
            <StatRoot size="sm">
              <StatLabel>{t("usageRecords")}</StatLabel>
              <StatValueText>{team._count.usages}</StatValueText>
            </StatRoot>
          </HStack>

          <HStack gap={2} mt="auto" flexWrap="wrap">
            <Link href={`/teams/${team.id}`}>
              <Button size="sm" variant="outline" colorPalette="blue" w={{ base: "full", sm: "auto" }}>
                {t("viewDetails")}
              </Button>
            </Link>
              <Button size="sm" variant="outline" colorPalette="red" w={{ base: "full", sm: "auto" }} onClick={() => setShowDelete(true)}>
                {t("deleteTeam")}
              </Button>
            {isAdmin && (
              <Button
                size="sm"
                variant="ghost"
                colorPalette="gray"
                w={{ base: "full", sm: "auto" }}
                onClick={() => onAssignWorker(team)}
              >
                {t("assignWorker")}
              </Button>
            )}
          </HStack>
        </VStack>
      </CardBody>
      <DeleteTeamDialog team={team} open={showDelete} onClose={() => setShowDelete(false)} />
    </CardRoot>
  );
}
