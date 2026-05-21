import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateWorkerInput } from "../../schemas/workers/create-worker.schema";
import type { UpdateWorkerInput } from "../../schemas/workers/update-worker.schema";
import type { AssignTeamInput } from "../../schemas/workers/assign-team.schema";
import type { Worker } from "../../types/worker";

const QUERY_KEY = ["workers"] as const;

async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export function useWorkers() {
  return useQuery<Worker[]>({
    queryKey: QUERY_KEY,
    queryFn: () => apiFetch<Worker[]>("/api/workers"),
  });
}

export function useWorker(workerId: string) {
  return useQuery<Worker>({
    queryKey: [...QUERY_KEY, workerId],
    queryFn: () => apiFetch<Worker>(`/api/workers/${workerId}`),
    enabled: !!workerId,
  });
}

export function useCreateWorker() {
  const queryClient = useQueryClient();
  return useMutation<Worker, Error, CreateWorkerInput>({
    mutationFn: (data) =>
      apiFetch<Worker>("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateWorker() {
  const queryClient = useQueryClient();
  return useMutation<Worker, Error, { id: string } & UpdateWorkerInput>({
    mutationFn: ({ id, ...data }) =>
      apiFetch<Worker>(`/api/workers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteWorker() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      apiFetch<void>(`/api/workers/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useAssignWorkerToTeam() {
  const queryClient = useQueryClient();
  return useMutation<Worker, Error, AssignTeamInput>({
    mutationFn: (data) =>
      apiFetch<Worker>("/api/workers/assign-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}
