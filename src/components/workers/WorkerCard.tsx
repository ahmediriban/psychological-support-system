"use client";

import {
  Badge,
  Box,
  CardBody,
  CardRoot,
  HStack,
  IconButton,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { LuMail, LuPencil, LuTrash2, LuUser } from "react-icons/lu";
import { Tooltip } from "../ui/tooltip";
import { DeleteWorkerDialog } from "./DeleteWorkerDialog";
import { EditWorkerDialog } from "./EditWorkerDialog";
import { useState } from "react";
import type { Worker } from "../../types/worker";

type Props = {
  worker: Worker;
  isAdmin: boolean;
};

export function WorkerCard({ worker, isAdmin }: Props) {
  const t = useTranslations("workers");
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <CardRoot size="md" variant="outline" h="full" overflow="hidden">
      <CardBody p={0}>
        <VStack align="stretch" gap={0} h="full">

          {/* Main content */}
          <Box p={5} flex={1}>
            <VStack align="stretch" gap={3}>

              {/* Avatar + name */}
              <HStack gap={3} align="start">
                <Box
                  w={10}
                  h={10}
                  borderRadius="full"
                  bg={worker.team ? "blue.100" : "gray.100"}
                  _dark={{ bg: worker.team ? "blue.900" : "gray.800" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <LuUser
                    size={18}
                    color={worker.team ? "var(--chakra-colors-blue-500)" : "var(--chakra-colors-gray-400)"}
                  />
                </Box>
                <Box minW={0} flex={1}>
                  <Text fontWeight="semibold" fontSize="md" lineClamp={1}>
                    {worker.name ?? worker.email}
                  </Text>
                  {worker.name && (
                    <HStack gap={1} mt={0.5}>
                      <LuMail size={11} color="var(--chakra-colors-gray-400)" />
                      <Text fontSize="xs" color="gray.500" truncate>
                        {worker.email}
                      </Text>
                    </HStack>
                  )}
                </Box>
              </HStack>

              {/* Team status */}
              {worker.team ? (
                <HStack gap={2} p={2.5} borderRadius="md" bg="blue.50" _dark={{ bg: "blue.950" }}>
                  <Box w={1.5} h={1.5} borderRadius="full" bg="blue.400" flexShrink={0} />
                  <Text fontSize="xs" color="blue.700" _dark={{ color: "blue.300" }} fontWeight="medium" truncate>
                    {worker.team.name}
                  </Text>
                  <Badge colorPalette="blue" fontSize="2xs" ms="auto" flexShrink={0}>
                    {t("assigned")}
                  </Badge>
                </HStack>
              ) : (
                <HStack gap={2} p={2.5} borderRadius="md" bg="gray.50" _dark={{ bg: "gray.900" }}>
                  <Box w={1.5} h={1.5} borderRadius="full" bg="gray.300" flexShrink={0} />
                  <Text fontSize="xs" color="gray.400" fontWeight="medium">
                    {t("noTeam")}
                  </Text>
                </HStack>
              )}
            </VStack>
          </Box>

          {/* Action bar — admin only */}
          {isAdmin && (
            <>
              <Separator />
              <HStack
                px={4}
                py={3}
                gap={1}
                justify="flex-end"
                bg="gray.50"
                _dark={{ bg: "gray.900" }}
              >
                <Tooltip content={t("editWorker")}>
                  <IconButton
                    aria-label={t("editWorker")}
                    size="sm"
                    variant="ghost"
                    colorPalette="gray"
                    onClick={() => setShowEdit(true)}
                  >
                    <LuPencil />
                  </IconButton>
                </Tooltip>

                <Tooltip content={t("deleteWorker")}>
                  <IconButton
                    aria-label={t("deleteWorker")}
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => setShowDelete(true)}
                  >
                    <LuTrash2 />
                  </IconButton>
                </Tooltip>
              </HStack>
            </>
          )}
        </VStack>
      </CardBody>

      <EditWorkerDialog worker={worker} open={showEdit} onClose={() => setShowEdit(false)} />
      <DeleteWorkerDialog worker={worker} open={showDelete} onClose={() => setShowDelete(false)} />
    </CardRoot>
  );
}
