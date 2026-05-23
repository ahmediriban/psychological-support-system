import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateDistributionInput } from "../../schemas/distribution/create-distribution.schema";
import type { DistributionRecord } from "../../types/distribution";

const QUERY_KEY = ["distributions"] as const;

export type PagedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export function useDistributions() {
  return useQuery<DistributionRecord[]>({
    queryKey: QUERY_KEY,
    queryFn: () => apiFetch<DistributionRecord[]>("/api/distribution"),
  });
}

export function useDistributionsPaged(page: number, category?: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (category) params.set("category", category);
  return useQuery<PagedResponse<DistributionRecord>>({
    queryKey: [...QUERY_KEY, "paged", page, category],
    queryFn: () => apiFetch<PagedResponse<DistributionRecord>>(`/api/distribution?${params.toString()}`),
    placeholderData: (prev) => prev,
  });
}

export function useDistribution(id: string) {
  return useQuery<DistributionRecord>({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => apiFetch<DistributionRecord>(`/api/distribution/${id}`),
    enabled: !!id,
  });
}

export function useCreateDistribution() {
  const queryClient = useQueryClient();
  return useMutation<DistributionRecord, Error, CreateDistributionInput>({
    mutationFn: (data) =>
      apiFetch<DistributionRecord>("/api/distribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      // Invalidate team stock since we just updated it
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}
