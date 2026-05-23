import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateUsageInput } from "../../schemas/usage/create-usage.schema";
import type { UsageRecord } from "../../types/usage";

const QUERY_KEY = ["usage"] as const;

type PagedResponse<T> = { data: T[]; total: number; page: number; pageSize: number; totalPages: number };

async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

// All usage (ADMIN / SUPERVISOR)
export function useUsageHistory() {
  return useQuery<UsageRecord[]>({
    queryKey: QUERY_KEY,
    queryFn: () => apiFetch<UsageRecord[]>("/api/usage"),
  });
}

export function useUsageHistoryPaged(page: number) {
  return useQuery<PagedResponse<UsageRecord>>({
    queryKey: [...QUERY_KEY, "paged", page],
    queryFn: () => apiFetch<PagedResponse<UsageRecord>>(`/api/usage?page=${page}`),
    placeholderData: (prev) => prev,
  });
}

// Single team usage (filtered server-side; workers use this automatically)
export function useTeamUsage(teamId: string) {
  return useQuery<UsageRecord[]>({
    queryKey: [...QUERY_KEY, "team", teamId],
    queryFn: () => apiFetch<UsageRecord[]>(`/api/usage?teamId=${teamId}`),
    enabled: !!teamId,
  });
}

export function useTeamUsagePaged(teamId: string, page: number) {
  return useQuery<PagedResponse<UsageRecord>>({
    queryKey: [...QUERY_KEY, "team", teamId, "paged", page],
    queryFn: () => apiFetch<PagedResponse<UsageRecord>>(`/api/usage?teamId=${teamId}&page=${page}`),
    enabled: !!teamId,
    placeholderData: (prev) => prev,
  });
}

export function useCreateUsage() {
  const queryClient = useQueryClient();
  return useMutation<UsageRecord, Error, CreateUsageInput>({
    mutationFn: (data) =>
      apiFetch<UsageRecord>("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: (record) => {
      // Invalidate both the global list and the specific team list
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["teams", record.teamId, "stock"] });
      queryClient.invalidateQueries({ queryKey: ["teams", record.teamId, "usage"] });
    },
  });
}
