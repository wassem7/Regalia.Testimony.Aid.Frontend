"use client";

import { useCallback, useEffect, useState } from "react";
import { apiConfigured, apiFetch } from "@/lib/api";
import { seedTestimonies } from "@/lib/seed";
import type { PagedResult, Testimony } from "@/lib/types";

export interface TestimonyStats {
  pendingCount: number;
  liveTotal: number;
  approvedThisWeek: number;
}

interface State {
  testimonies: Testimony[];
  stats: TestimonyStats;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const EMPTY_STATS: TestimonyStats = {
  pendingCount: 0,
  liveTotal: 0,
  approvedThisWeek: 0,
};

/**
 * Stat counters for the queue header. Reads the wall clock, so it is computed
 * at load time (off the render path) rather than during render.
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

/**
 * Loads the admin testimony list and exposes an approve action.
 * Falls back to local seed data when no backend is configured.
 */
export function useTestimonies() {
  const [state, setState] = useState<State>({
    testimonies: [],
    stats: EMPTY_STATS,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const load = useCallback(async (signal?: { cancelled: boolean }) => {
    const commit = (next: State) => {
      if (!signal?.cancelled) setState(next);
    };

    if (!apiConfigured) {
      // Simulate a brief load so skeletons are visible in standalone mode.
      await new Promise((r) => setTimeout(r, 700));
      const items = seedTestimonies();
      commit({
        testimonies: items,
        stats: computeStats(items),
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });
      return;
    }

    try {
      const page = await apiFetch<PagedResult<Testimony>>(
        "/api/testimony-aid?pageSize=100",
      );
      commit({
        testimonies: page.items,
        stats: computeStats(page.items),
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      commit({
        testimonies: [],
        stats: EMPTY_STATS,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load testimonies",
        lastUpdated: null,
      });
    }
  }, []);

  // Fetch on mount using the canonical cancellable-effect pattern.
  useEffect(() => {
    const signal = { cancelled: false };
    void load(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [load]);

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    void load();
  }, [load]);

  /** Approve (publish) a testimony. Optimistic; reverts on failure. */
  const approve = useCallback(
    async (id: string) => {
      const nowIso = new Date().toISOString();
      const prev = state.testimonies;

      setState((s) => {
        const testimonies = s.testimonies.map((t) =>
          t.id === id ? { ...t, status: "accepted" as const, approvedAt: nowIso } : t,
        );
        return { ...s, testimonies, stats: computeStats(testimonies) };
      });

      if (!apiConfigured) return;

      try {
        await apiFetch(`/api/testimony-aid/${id}/approve`, { method: "POST" });
      } catch {
        setState((s) => ({ ...s, testimonies: prev, stats: computeStats(prev) }));
        throw new Error("Could not publish — please try again.");
      }
    },
    [state.testimonies],
  );

  return {
    testimonies: state.testimonies,
    loading: state.loading,
    error: state.error,
    stats: state.stats,
    lastUpdated: state.lastUpdated,
    reload,
    approve,
  };
}
