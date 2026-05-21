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
import type { Worker } from "../../types/worker";
import { AssignWorkerToTeamModal } from "./AssignWorkerToTeamModal";
import { CreateWorkerDialog } from "./CreateWorkerDialog";
import { DeleteWorkerDialog } from "./DeleteWorkerDialog";
import { EditWorkerDialog } from "./EditWorkerDialog";
import { WorkerList } from "./WorkerList";

type Props = {
  role: "ADMIN" | "SUPERVISOR";
};

export function WorkersPageContent({ role }: Props) {
  const t = useTranslations("workers");
  const isAdmin = role === "ADMIN";

  const { data: workers = [], isLoading, isError } = useWorkers();

  const [showCreate, setShowCreate] = useState(false);
  const [editWorker, setEditWorker] = useState<Worker | null>(null);
  const [deleteWorker, setDeleteWorker] = useState<Worker | null>(null);
  const [assignWorker, setAssignWorker] = useState<Worker | null>(null);

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

      <WorkerList
        workers={workers}
        isAdmin={isAdmin}
        onEdit={setEditWorker}
        onDelete={setDeleteWorker}
        onAssignTeam={setAssignWorker}
      />

      <CreateWorkerDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />

      <EditWorkerDialog
        worker={editWorker}
        open={!!editWorker}
        onClose={() => setEditWorker(null)}
      />

      <DeleteWorkerDialog
        worker={deleteWorker}
        open={!!deleteWorker}
        onClose={() => setDeleteWorker(null)}
      />

      <AssignWorkerToTeamModal
        worker={assignWorker}
        open={!!assignWorker}
        onClose={() => setAssignWorker(null)}
      />
    </Box>
  );
}
