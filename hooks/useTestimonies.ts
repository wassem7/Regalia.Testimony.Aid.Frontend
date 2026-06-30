"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiConfigured, apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { seedTestimonies } from "@/lib/seed";
import type { PagedResult, Testimony } from "@/lib/types";

export interface TestimonyStats {
  pendingCount: number;
  liveTotal: number;
  approvedThisWeek: number;
}

const EMPTY_STATS: TestimonyStats = {
  pendingCount: 0,
  liveTotal: 0,
  approvedThisWeek: 0,
};

/**
 * Stat counters for the queue header. Reads the wall clock, so it is derived
 * from the fetched list rather than stored.
 */
function computeStats(testimonies: Testimony[]): TestimonyStats {
  const weekAgo = Date.now() - 7 * 86400_000;
  let pendingCount = 0;
  let liveTotal = 0;
  let approvedThisWeek = 0;

  for (const t of testimonies) {
    if (t.status === "pending") pendingCount++;
    if (t.status === "accepted") {
      liveTotal++;
      if (t.approvedAt && new Date(t.approvedAt).getTime() >= weekAgo)
        approvedThisWeek++;
    }
  }
  return { pendingCount, liveTotal, approvedThisWeek };
}

/** Fetches the admin testimony list. Falls back to seed data with no backend. */
async function fetchTestimonies(): Promise<Testimony[]> {
  if (!apiConfigured) {
    // Simulate a brief load so skeletons are visible in standalone mode.
    await new Promise((r) => setTimeout(r, 700));
    return seedTestimonies();
  }
  const page = await apiFetch<PagedResult<Testimony>>(
    "/api/testimony-aid?pageSize=100",
  );
  return page.items;
}

/**
 * Loads the admin testimony list and exposes an approve action.
 * Backed by TanStack Query, so the list is fetched once and shared (cached)
 * across every route that reads it.
 */
export function useTestimonies() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.testimonies,
    queryFn: fetchTestimonies,
  });

  const testimonies = query.data ?? [];
  const stats = query.data ? computeStats(query.data) : EMPTY_STATS;

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!apiConfigured) return;
      try {
        await apiFetch(`/api/testimony-aid/${id}/approve`, { method: "POST" });
      } catch {
        throw new Error("Could not publish — please try again.");
      }
    },
    // Optimistically flip the row to accepted; revert the cache on failure.
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.testimonies });
      const previous = queryClient.getQueryData<Testimony[]>(
        queryKeys.testimonies,
      );
      const nowIso = new Date().toISOString();
      queryClient.setQueryData<Testimony[]>(queryKeys.testimonies, (old) =>
        (old ?? []).map((t) =>
          t.id === id
            ? { ...t, status: "accepted" as const, approvedAt: nowIso }
            : t,
        ),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.testimonies, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testimonies });
    },
  });

  return {
    testimonies,
    loading: query.isLoading,
    error: query.error ? errorMessage(query.error) : null,
    stats,
    lastUpdated: query.dataUpdatedAt || null,
    reload: () => query.refetch(),
    approve: (id: string) => approveMutation.mutateAsync(id),
  };
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Failed to load testimonies";
}
