"use client";

import { useCallback, useEffect, useState } from "react";
import { apiConfigured, apiFetch } from "@/lib/api";
import { seedTestimonies } from "@/lib/seed";
import type { AdminUpdateTestimonyPayload, Testimony } from "@/lib/types";

interface State {
  testimony: Testimony | null;
  loading: boolean;
  error: string | null;
}

/**
 * Loads a single testimony by id for the detail page.
 * Falls back to local seed data when no backend is configured.
 */
export function useTestimony(id: string) {
  const [state, setState] = useState<State>({
    testimony: null,
    loading: true,
    error: null,
  });

  const load = useCallback(
    async (signal?: { cancelled: boolean }) => {
      const commit = (next: State) => {
        if (!signal?.cancelled) setState(next);
      };

      if (!apiConfigured) {
        await new Promise((r) => setTimeout(r, 400));
        const found = seedTestimonies().find((t) => t.id === id) ?? null;
        commit({
          testimony: found,
          loading: false,
          error: found ? null : "Testimony not found",
        });
        return;
      }

      try {
        const testimony = await apiFetch<Testimony>(`/api/testimony-aid/${id}`);
        commit({ testimony, loading: false, error: null });
      } catch (err) {
        commit({
          testimony: null,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load testimony",
        });
      }
    },
    [id],
  );

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

  /** Admin-edit this testimony, then refresh it. */
  const update = useCallback(
    async (payload: AdminUpdateTestimonyPayload) => {
      if (apiConfigured) {
        await apiFetch(`/api/testimony-aid/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      await load();
    },
    [id, load],
  );

  return { ...state, reload, update };
}
