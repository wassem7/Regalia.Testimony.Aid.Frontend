"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiConfigured, apiFetch } from "@/lib/api";
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

interface State {
  items: Testimony[];
  total: number;
  loading: boolean;
  error: string | null;
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

/**
 * The archive: a searchable/filterable list over ALL testimonies, plus
 * admin create/edit. Falls back to local seed data with no backend.
 */
export function useArchive() {
  const [filters, setFilters] = useState<ArchiveFilters>({
    search: "",
    category: "",
    source: "",
    status: "",
  });
  const [page, setPage] = useState(1);
  const [state, setState] = useState<State>({
    items: [],
    total: 0,
    loading: true,
    error: null,
  });

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

  // Pure loader: everything it needs (the query + seed inputs) is passed in,
  // so it keeps stable [] deps and never reads/writes refs during render.
  const load = useCallback(
    async (
      query: string,
      seedFilters: ArchiveFilters,
      seedPage: number,
      signal?: { cancelled: boolean },
    ) => {
      const commit = (next: State) => {
        if (!signal?.cancelled) setState(next);
      };

      if (!apiConfigured) {
        await new Promise((r) => setTimeout(r, 400));
        const all = filterSeed(seedFilters);
        const start = (seedPage - 1) * PAGE_SIZE;
        commit({
          items: all.slice(start, start + PAGE_SIZE),
          total: all.length,
          loading: false,
          error: null,
        });
        return;
      }

      try {
        const res = await apiFetch<PagedResult<Testimony>>(
          `/api/testimony-aid?${query}`,
        );
        commit({ items: res.items, total: res.totalCount, loading: false, error: null });
      } catch (err) {
        commit({
          items: [],
          total: 0,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load archive",
        });
      }
    },
    [],
  );

  // Refetch whenever the query (filters/page) changes.
  useEffect(() => {
    const signal = { cancelled: false };
    void load(queryString, filters, page, signal);
    return () => {
      signal.cancelled = true;
    };
  }, [load, queryString, filters, page]);

  const reload = useCallback(
    () => load(queryString, filters, page),
    [load, queryString, filters, page],
  );

  const updateFilters = useCallback((patch: Partial<ArchiveFilters>) => {
    setPage(1);
    setFilters((f) => ({ ...f, ...patch }));
  }, []);

  const create = useCallback(async (payload: CreateTestimonyPayload) => {
    if (!apiConfigured) return;
    await apiFetch("/api/testimony-aid", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }, []);

  const update = useCallback(
    async (id: string, payload: AdminUpdateTestimonyPayload) => {
      if (!apiConfigured) return;
      await apiFetch(`/api/testimony-aid/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    [],
  );

  const pageCount = Math.max(1, Math.ceil(state.total / PAGE_SIZE));

  return {
    ...state,
    filters,
    updateFilters,
    page,
    setPage,
    pageCount,
    pageSize: PAGE_SIZE,
    reload,
    create,
    update,
  };
}
