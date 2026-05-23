"use client";

import {
  Box,
  Button,
  HStack,
  Heading,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useWorkers } from "../../hooks/workers/useWorkers";
import { CreateWorkerDialog } from "./CreateWorkerDialog";
import { WorkerList } from "./WorkerList";

type Props = {
  role: "ADMIN" | "SUPERVISOR";
};

export function WorkersPageContent({ role }: Props) {
  const t = useTranslations("workers");
  const isAdmin = role === "ADMIN";

  const { data: workers = [], isLoading, isError } = useWorkers();
  const [showCreate, setShowCreate] = useState(false);

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
      <HStack justify="space-between" mb={6} gap={3}>
        <Heading size={{ base: "md", md: "lg" }}>{t("title")}</Heading>
        {isAdmin && (
          <Button
            colorPalette="blue"
            size={{ base: "sm", md: "md" }}
            onClick={() => setShowCreate(true)}
          >
            {t("addWorker")}
          </Button>
        )}
      </HStack>

      <WorkerList workers={workers} isAdmin={isAdmin} />

      <CreateWorkerDialog open={showCreate} onClose={() => setShowCreate(false)} />
    </Box>
  );
}
