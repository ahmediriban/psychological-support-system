"use client";

import {
  Badge,
  Box,
  CardBody,
  CardRoot,
  HStack,
  Heading,
  IconButton,
  Separator,
  StatLabel,
  StatRoot,
  StatValueText,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Tooltip } from "../ui/tooltip";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LuEye, LuPencil, LuTrash2, LuUserPlus } from "react-icons/lu";
import { Link } from "../../i18n/navigation";
import type { TeamSummary } from "../../types/team";
import { DeleteTeamDialog } from "./DeleteTeamDialog";
import { EditTeamDialog } from "./EditTeamDialog";

type Props = {
  team: TeamSummary;
  isAdmin: boolean;
  onAssignWorker: (team: TeamSummary) => void;
};

const CATEGORY_COLORS: Record<string, string> = {
  MATERIALS_STATIONERY: "blue",
  FIRST_AID: "red",
  HYGIENE: "green",
  PRINTING: "orange",
  HOSPITALITY: "purple",
};

export function TeamCard({ team, isAdmin, onAssignWorker }: Props) {
  const t = useTranslations("teams");
  const tc = useTranslations("categories");
  const responsibleWorker = team.users[0] ?? null;
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  return (
    <CardRoot size="md" variant="outline" h="full" overflow="hidden">
      <CardBody p={0}>
        <VStack align="stretch" gap={0} h="full">

          {/* Main content */}
          <Box p={5} flex={1}>
            <VStack align="stretch" gap={4}>

              {/* Name + categories */}
              <Box>
                <Heading size="md" mb={2} lineClamp={1}>
                  {team.name}
                </Heading>
                <HStack gap={1} flexWrap="wrap" mb={2}>
                  {team.categories.map((cat) => (
                    <Badge
                      key={cat}
                      colorPalette={CATEGORY_COLORS[cat] ?? "gray"}
                      fontSize="xs"
                      borderRadius="full"
                      px={2}
                    >
                      {tc(cat)}
                    </Badge>
                  ))}
                </HStack>
                {responsibleWorker ? (
                  <HStack gap={1}>
                    <Box w={1.5} h={1.5} borderRadius="full" bg="green.400" flexShrink={0} />
                    <Text fontSize="xs" color="gray.500" truncate>
                      {responsibleWorker.name ?? responsibleWorker.email}
                    </Text>
                  </HStack>
                ) : (
                  <HStack gap={1}>
                    <Box w={1.5} h={1.5} borderRadius="full" bg="gray.300" flexShrink={0} />
                    <Text fontSize="xs" color="gray.400">{t("noWorker")}</Text>
                  </HStack>
                )}
              </Box>

              {/* Stats */}
              <HStack
                gap={0}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                borderColor="gray.100"
                _dark={{ borderColor: "gray.700" }}
              >
                <Box
                  flex={1}
                  px={3}
                  py={2}
                  bg="gray.50"
                  borderInlineEndWidth="1px"
                  borderColor="gray.100"
                  _dark={{ bg: "gray.800", borderColor: "gray.700" }}
                >
                  <StatRoot size="sm">
                    <StatLabel fontSize="2xs" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                      {t("stockItems")}
                    </StatLabel>
                    <StatValueText fontSize="xl" fontWeight="bold" color="blue.600" _dark={{ color: "blue.300" }}>
                      {team._count.stocks}
                    </StatValueText>
                  </StatRoot>
                </Box>
                <Box
                  flex={1}
                  px={3}
                  py={2}
                  bg="gray.50"
                  _dark={{ bg: "gray.800" }}
                >
                  <StatRoot size="sm">
                    <StatLabel fontSize="2xs" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                      {t("usageRecords")}
                    </StatLabel>
                    <StatValueText fontSize="xl" fontWeight="bold" color="purple.600" _dark={{ color: "purple.300" }}>
                      {team._count.usages}
                    </StatValueText>
                  </StatRoot>
                </Box>
              </HStack>

            </VStack>
          </Box>

          {/* Action bar */}
          <Separator />
          <HStack
            px={4}
            py={3}
            gap={1}
            justify="space-between"
            bg="gray.50"
            _dark={{ bg: "gray.900" }}
          >
            {/* Primary: view details */}
            <Tooltip content={t("viewDetails")}>
              <Link href={`/teams/${team.id}`}>
                <IconButton
                  aria-label={t("viewDetails")}
                  size="sm"
                  variant="ghost"
                  colorPalette="blue"
                >
                  <LuEye />
                </IconButton>
              </Link>
            </Tooltip>

            {/* Admin actions */}
            {isAdmin && (
              <HStack gap={1}>
                <Tooltip content={t("assignWorker")}>
                  <IconButton
                    aria-label={t("assignWorker")}
                    size="sm"
                    variant="ghost"
                    colorPalette="gray"
                    onClick={() => onAssignWorker(team)}
                  >
                    <LuUserPlus />
                  </IconButton>
                </Tooltip>

                <Tooltip content={t("editTeam")}>
                  <IconButton
                    aria-label={t("editTeam")}
                    size="sm"
                    variant="ghost"
                    colorPalette="gray"
                    onClick={() => setShowEdit(true)}
                  >
                    <LuPencil />
                  </IconButton>
                </Tooltip>

                <Tooltip content={t("deleteTeam")}>
                  <IconButton
                    aria-label={t("deleteTeam")}
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => setShowDelete(true)}
                  >
                    <LuTrash2 />
                  </IconButton>
                </Tooltip>
              </HStack>
            )}
          </HStack>

        </VStack>
      </CardBody>

      <DeleteTeamDialog team={team} open={showDelete} onClose={() => setShowDelete(false)} />
      <EditTeamDialog team={team} open={showEdit} onClose={() => setShowEdit(false)} />
    </CardRoot>
  );
}
