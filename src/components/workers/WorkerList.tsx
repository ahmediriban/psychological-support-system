"use client";

import { EmptyStateRoot, EmptyStateTitle, SimpleGrid } from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import type { Worker } from "../../types/worker";
import { WorkerCard } from "./WorkerCard";

type Props = {
  workers: Worker[];
  isAdmin: boolean;
  onEdit: (worker: Worker) => void;
  onDelete: (worker: Worker) => void;
  onAssignTeam: (worker: Worker) => void;
};

export function WorkerList({ workers, isAdmin, onEdit, onDelete, onAssignTeam }: Props) {
  const t = useTranslations("workers");

  if (workers.length === 0) {
    return (
      <EmptyStateRoot>
        <EmptyStateTitle>{t("noWorkers")}</EmptyStateTitle>
      </EmptyStateRoot>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
      {workers.map((worker) => (
        <WorkerCard
          key={worker.id}
          worker={worker}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssignTeam={onAssignTeam}
        />
      ))}
    </SimpleGrid>
  );
}
