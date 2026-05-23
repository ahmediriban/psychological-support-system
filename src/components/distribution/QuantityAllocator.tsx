"use client";

import {
  Box,
  HStack,
  Input,
  Separator,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useTeams } from "../../hooks/teams/useTeams";

export type TeamAllocation = {
  teamId: string;
  teamName: string;
  quantity: number;
};

type Props = {
  allocations: Map<string, TeamAllocation>;
  onChange: (allocations: Map<string, TeamAllocation>) => void;
  category?: string;
  maxTotal?: number;
};

export function QuantityAllocator({ allocations, onChange, category, maxTotal }: Props) {
  const t = useTranslations("distribution");
  const { data: allTeams = [], isLoading, isError } = useTeams();
  const teams = category
    ? allTeams.filter((t) => t.categories.includes(category as any))
    : allTeams;

  const total = Array.from(allocations.values()).reduce((s, a) => s + a.quantity, 0);
  const remaining = maxTotal !== undefined ? maxTotal - total : undefined;

  function toggleTeam(teamId: string, teamName: string) {
    const next = new Map(allocations);
    if (next.has(teamId)) {
      next.delete(teamId);
    } else {
      next.set(teamId, { teamId, teamName, quantity: 1 });
    }
    onChange(next);
  }

  function setQuantity(teamId: string, teamName: string, raw: string) {
    const quantity = parseInt(raw, 10);
    if (isNaN(quantity) || quantity < 0) return;
    // Enforce max: don't allow going over total budget
    if (maxTotal !== undefined) {
      const otherTotal = Array.from(allocations.values())
        .filter((a) => a.teamId !== teamId)
        .reduce((s, a) => s + a.quantity, 0);
      if (quantity + otherTotal > maxTotal) return;
    }
    const next = new Map(allocations);
    next.set(teamId, { teamId, teamName, quantity });
    onChange(next);
  }

  if (isLoading) {
    return (
      <Stack gap={3}>
        {[1, 2, 3].map((i) => <Skeleton key={i} h="56px" borderRadius="md" />)}
      </Stack>
    );
  }

  if (isError) return <Text color="red.500">{t("errorTeams")}</Text>;
  if (teams.length === 0) return <Text color="gray.500">{t("noTeams")}</Text>;

  return (
    <Stack gap={3}>
      <Text fontSize="sm" color="gray.500">{t("selectTeamsHint")}</Text>

      {maxTotal !== undefined && (
        <HStack
          px={4}
          py={2}
          bg="blue.50"
          borderRadius="md"
          justify="space-between"
          _dark={{ bg: "blue.900" }}
        >
          <Text fontSize="sm" fontWeight="semibold" color="blue.700" _dark={{ color: "blue.200" }}>
            {t("available")}:
          </Text>
          <Text
            fontSize="sm"
            fontWeight="bold"
            color={remaining === 0 ? "red.500" : "blue.700"}
            _dark={{ color: remaining === 0 ? "red.300" : "blue.200" }}
          >
            {remaining}
          </Text>
        </HStack>
      )}

      {teams.map((team) => {
        const alloc = allocations.get(team.id);
        const isSelected = !!alloc;

        return (
          <Box
            key={team.id}
            borderWidth="1px"
            borderColor={isSelected ? "blue.500" : "gray.200"}
            borderRadius="md"
            overflow="hidden"
            transition="all 0.1s"
          >
            <HStack
              px={4}
              py={3}
              cursor="pointer"
              bg={isSelected ? "blue.50" : "white"}
              _dark={{ bg: isSelected ? "blue.900" : "transparent" }}
              onClick={() => toggleTeam(team.id, team.name)}
              justify="space-between"
            >
              <Text fontWeight={isSelected ? "semibold" : "medium"} fontSize="sm">
                {team.name}
              </Text>
              <Box
                w={5}
                h={5}
                borderRadius="sm"
                borderWidth="2px"
                borderColor={isSelected ? "blue.500" : "gray.300"}
                bg={isSelected ? "blue.500" : "transparent"}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                {isSelected && (
                  <Text color="white" fontSize="xs" lineHeight={1} fontWeight="bold">
                    ✓
                  </Text>
                )}
              </Box>
            </HStack>

            {isSelected && (
              <>
                <Separator />
                <HStack px={4} py={2} gap={3} bg="gray.50" _dark={{ bg: "gray.800" }}>
                  <Text fontSize="sm" color="gray.600" flexShrink={0}>
                    {t("quantity")}:
                  </Text>
                  <Input
                    type="number"
                    min={1}
                    max={maxTotal !== undefined ? maxTotal : undefined}
                    size="sm"
                    value={alloc.quantity || ""}
                    onChange={(e) => setQuantity(team.id, team.name, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    w="full"
                    maxW="120px"
                  />
                  {maxTotal !== undefined && (
                    <Text fontSize="xs" color="gray.400">
                      {t("maxQuantity")}: {maxTotal}
                    </Text>
                  )}
                </HStack>
              </>
            )}
          </Box>
        );
      })}

      {total > 0 && (
        <HStack
          justify="space-between"
          pt={3}
          borderTopWidth="1px"
          borderColor="gray.200"
        >
          <Text fontWeight="semibold" fontSize="sm">{t("totalQuantity")}:</Text>
          <Text
            fontWeight="bold"
            color={maxTotal !== undefined && total > maxTotal ? "red.500" : "blue.600"}
          >
            {total}
            {maxTotal !== undefined && ` / ${maxTotal}`}
          </Text>
        </HStack>
      )}
    </Stack>
  );
}
