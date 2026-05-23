import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { CreateItemInput } from "../../schemas/items/create-item.schema";
import type { BulkImportInput } from "../../schemas/items/bulk-import.schema";
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

export function useItems(category?: string) {
  const url = category ? `/api/items?category=${category}` : "/api/items";
  return useQuery<Item[]>({
    queryKey: [...QUERY_KEY, category],
    queryFn: () => apiFetch<Item[]>(url),
  });
}

export type ItemWithAvailable = Item & { availableQuantity: number };

export type PagedItemsResponse = {
  data: ItemWithAvailable[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
};

// Unpaginated — used by distribution item selector (needs all items)
export function useItemsWithAvailable(category?: string) {
  const url = category ? `/api/items/available?category=${category}` : "/api/items/available";
  return useQuery<ItemWithAvailable[]>({
    queryKey: ["items", "available", category],
    queryFn: () => apiFetch<ItemWithAvailable[]>(url),
  });
}

// Paginated — used by the items management page
export function useItemsWithAvailablePaged(category: string | undefined, page: number) {
  const params = new URLSearchParams({ page: String(page) });
  if (category) params.set("category", category);
  const url = `/api/items/available?${params.toString()}`;
  return useQuery<PagedItemsResponse>({
    queryKey: ["items", "available", "paged", category, page],
    queryFn: () => apiFetch<PagedItemsResponse>(url),
    placeholderData: (prev) => prev,
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

// Search items with debounce — used by autocomplete item selector
export function useItemSearch(query: string, category?: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  const params = new URLSearchParams({ q: debouncedQuery });
  if (category) params.set("category", category);

  return useQuery<ItemWithAvailable[]>({
    queryKey: ["items", "search", debouncedQuery, category],
    queryFn: () => apiFetch<ItemWithAvailable[]>(`/api/items-search?${params.toString()}`),
    staleTime: 30_000,
  });
}

export function useBulkImportItems() {
  const queryClient = useQueryClient();
  return useMutation<{ imported: number }, Error, BulkImportInput>({
    mutationFn: (data) =>
      apiFetch<{ imported: number }>("/api/items/bulk-import", {
        method: "POST",
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
