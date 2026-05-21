import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateItemInput } from "../../schemas/items/create-item.schema";
import type { UpdateItemInput } from "../../schemas/items/update-item.schema";
import type { Item } from "../../types/item";

const QUERY_KEY = ["items"] as const;

async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export function useItems() {
  return useQuery<Item[]>({
    queryKey: QUERY_KEY,
    queryFn: () => apiFetch<Item[]>("/api/items"),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation<Item, Error, CreateItemInput>({
    mutationFn: (data) =>
      apiFetch<Item>("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation<Item, Error, { id: string } & UpdateItemInput>({
    mutationFn: ({ id, ...data }) =>
      apiFetch<Item>(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      apiFetch<void>(`/api/items/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
