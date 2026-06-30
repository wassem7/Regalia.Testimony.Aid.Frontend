"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiConfigured, apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { seedTestimonies } from "@/lib/seed";
import type {
  AdminUpdateTestimonyPayload,
  CreateTestimonyPayload,
  PagedResult,
  Testimony,
} from "@/lib/types";

export interface ArchiveFilters {
  search: string;
  category: string; // "" = any
  source: string; // "" = any
  status: string; // "" = any
}

const PAGE_SIZE = 12;

interface ArchivePage {
  items: Testimony[];
  total: number;
}

/** Filtered seed data for standalone mode (mirrors the backend filters). */
function filterSeed(filters: ArchiveFilters): Testimony[] {
  const q = filters.search.trim().toLowerCase();
  return seedTestimonies().filter((t) => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.category && t.category !== filters.category) return false;
    if (filters.source && t.source !== filters.source) return false;
    if (
      q &&
      !(t.title + " " + t.body + " " + t.submitterName).toLowerCase().includes(q)
    )
      return false;
    return true;
  });
}

async function fetchArchive(
  query: string,
  filters: ArchiveFilters,
  page: number,
): Promise<ArchivePage> {
  if (!apiConfigured) {
    await new Promise((r) => setTimeout(r, 400));
    const all = filterSeed(filters);
    const start = (page - 1) * PAGE_SIZE;
    return { items: all.slice(start, start + PAGE_SIZE), total: all.length };
  }
  const res = await apiFetch<PagedResult<Testimony>>(
    `/api/testimony-aid?${query}`,
  );
  return { items: res.items, total: res.totalCount };
}

/**
 * The archive: a searchable/filterable list over ALL testimonies, plus
 * admin create/edit. Falls back to local seed data with no backend.
 */
export function useArchive() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ArchiveFilters>({
    search: "",
    category: "",
    source: "",
    status: "",
  });
  const [page, setPage] = useState(1);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.search.trim()) p.set("search", filters.search.trim());
    if (filters.category) p.set("category", filters.category);
    if (filters.source) p.set("source", filters.source);
    if (filters.status) p.set("status", filters.status);
    p.set("pageNumber", String(page));
    p.set("pageSize", String(PAGE_SIZE));
    return p.toString();
  }, [filters, page]);

  const query = useQuery({
    queryKey: queryKeys.archive(queryString),
    queryFn: () => fetchArchive(queryString, filters, page),
    // Keep the previous page's rows visible while the next page loads.
    placeholderData: (prev) => prev,
  });

  const updateFilters = useCallback((patch: Partial<ArchiveFilters>) => {
    setPage(1);
    setFilters((f) => ({ ...f, ...patch }));
  }, []);

  const createMutation = useMutation({
    mutationFn: async (payload: CreateTestimonyPayload) => {
      if (!apiConfigured) return;
      await apiFetch("/api/testimony-aid", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archive"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.testimonies });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: AdminUpdateTestimonyPayload;
    }) => {
      if (!apiConfigured) return;
      await apiFetch(`/api/testimony-aid/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archive"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.testimonies });
    },
  });

  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return {
    items: query.data?.items ?? [],
    total,
    loading: query.isLoading,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Failed to load archive"
      : null,
    filters,
    updateFilters,
    page,
    setPage,
    pageCount,
    pageSize: PAGE_SIZE,
    reload: () => query.refetch(),
    create: (payload: CreateTestimonyPayload) =>
      createMutation.mutateAsync(payload),
    update: (id: string, payload: AdminUpdateTestimonyPayload) =>
      updateMutation.mutateAsync({ id, payload }),
  };
}
