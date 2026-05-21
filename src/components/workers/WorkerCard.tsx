"use client";

import {
  Badge,
  Box,
  CardBody,
  CardRoot,
  HStack,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import type { Worker } from "../../types/worker";

type Props = {
  worker: Worker;
  isAdmin: boolean;
  onEdit: (worker: Worker) => void;
  onDelete: (worker: Worker) => void;
  onAssignTeam: (worker: Worker) => void;
};

export function WorkerCard({ worker, isAdmin, onEdit, onDelete, onAssignTeam }: Props) {
  const t = useTranslations("workers");

  return (
    <CardRoot size="sm" variant="outline">
      <CardBody>
        <HStack justify="space-between" align="start" gap={3}>
          <Box flex={1} minW={0}>
            <Text fontWeight="semibold" truncate>
              {worker.name ?? worker.email}
            </Text>
            <Text fontSize="sm" color="gray.500" truncate>
              {worker.email}
            </Text>
            <Badge
              colorPalette={worker.team ? "green" : "gray"}
              mt={1}
              fontSize="xs"
            >
              {worker.team ? worker.team.name : t("noTeam")}
            </Badge>
          </Box>

          {isAdmin && (
            <HStack gap={1} flexShrink={0}>
              <IconButton
                aria-label={t("assignTeam")}
                size="sm"
                variant="ghost"
                colorPalette="teal"
                onClick={() => onAssignTeam(worker)}
              >
                🏷️
              </IconButton>
              <IconButton
                aria-label={t("editWorker")}
                size="sm"
                variant="ghost"
                colorPalette="blue"
                onClick={() => onEdit(worker)}
              >
                ✏️
              </IconButton>
              <IconButton
                aria-label={t("deleteWorker")}
                size="sm"
                variant="ghost"
                colorPalette="red"
                onClick={() => onDelete(worker)}
              >
                🗑️
              </IconButton>
            </HStack>
          )}
        </HStack>
      </CardBody>
    </CardRoot>
  );
}
