import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { AssignWorkerInput } from "../../schemas/teams/assign-worker.schema";
import type { CreateTeamInput } from "../../schemas/teams/create-team.schema";
import type {
  DistributionEntry,
  StockEntry,
  TeamDetail,
  TeamSummary,
  TeamWorker,
  UsageEntry,
} from "../../types/team";

async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

// ─── Teams list ───────────────────────────────────────────────────────────────

export function useTeams() {
  return useQuery<TeamSummary[]>({
    queryKey: ["teams"],
    queryFn: () => apiFetch<TeamSummary[]>("/api/teams"),
  });
}

// ─── Single team ──────────────────────────────────────────────────────────────

export function useTeam(teamId: string) {
  return useQuery<TeamDetail>({
    queryKey: ["teams", teamId],
    queryFn: () => apiFetch<TeamDetail>(`/api/teams/${teamId}`),
    enabled: !!teamId,
  });
}

// ─── Workers (for assignment select) ─────────────────────────────────────────

export function useWorkers() {
  return useQuery<TeamWorker[]>({
    queryKey: ["workers"],
    queryFn: () => apiFetch<TeamWorker[]>("/api/teams/workers"),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation<TeamDetail, Error, CreateTeamInput>({
    mutationFn: (data) =>
      apiFetch<TeamDetail>("/api/teams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation<TeamDetail, Error, { id: string } & CreateTeamInput>({
    mutationFn: ({ id, ...data }) =>
      apiFetch<TeamDetail>(`/api/teams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => apiFetch<void>(`/api/teams/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useAssignWorker() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, AssignWorkerInput>({
    mutationFn: (data) =>
      apiFetch<unknown>("/api/teams/assign-worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
  });
}

// ─── Team detail sub-queries ──────────────────────────────────────────────────

export function useTeamStock(teamId: string) {
  return useQuery<StockEntry[]>({
    queryKey: ["teams", teamId, "stock"],
    queryFn: () => apiFetch<StockEntry[]>(`/api/teams/${teamId}/stock`),
    enabled: !!teamId,
  });
}

export function useTeamStockSearch(teamId: string, query: string, category?: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  const params = new URLSearchParams({ q: debouncedQuery });
  if (category) params.set("category", category);

  return useQuery<StockEntry[]>({
    queryKey: ["teams", teamId, "stock", "search", debouncedQuery, category],
    queryFn: () => apiFetch<StockEntry[]>(`/api/teams/${teamId}/stock?${params.toString()}`),
    enabled: !!teamId && !!category,
    staleTime: 30_000,
  });
}

type PagedResponse<T> = { data: T[]; total: number; page: number; pageSize: number; totalPages: number };

export function useTeamUsage(teamId: string) {
  return useQuery<UsageEntry[]>({
    queryKey: ["teams", teamId, "usage"],
    queryFn: () => apiFetch<UsageEntry[]>(`/api/teams/${teamId}/usage`),
    enabled: !!teamId,
  });
}

export function useTeamUsagePaged(teamId: string, page: number) {
  return useQuery<PagedResponse<UsageEntry>>({
    queryKey: ["teams", teamId, "usage", "paged", page],
    queryFn: () => apiFetch<PagedResponse<UsageEntry>>(`/api/teams/${teamId}/usage?page=${page}`),
    enabled: !!teamId,
    placeholderData: (prev) => prev,
  });
}

export function useTeamDistribution(teamId: string) {
  return useQuery<DistributionEntry[]>({
    queryKey: ["teams", teamId, "distribution"],
    queryFn: () => apiFetch<DistributionEntry[]>(`/api/teams/${teamId}/distribution`),
    enabled: !!teamId,
  });
}

export function useTeamDistributionPaged(teamId: string, page: number) {
  return useQuery<PagedResponse<DistributionEntry>>({
    queryKey: ["teams", teamId, "distribution", "paged", page],
    queryFn: () => apiFetch<PagedResponse<DistributionEntry>>(`/api/teams/${teamId}/distribution?page=${page}`),
    enabled: !!teamId,
    placeholderData: (prev) => prev,
  });
}
