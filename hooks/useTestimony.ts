"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiConfigured, apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { seedTestimonies } from "@/lib/seed";
import type { AdminUpdateTestimonyPayload, Testimony } from "@/lib/types";

async function fetchTestimony(id: string): Promise<Testimony> {
  if (!apiConfigured) {
    await new Promise((r) => setTimeout(r, 400));
    const found = seedTestimonies().find((t) => t.id === id);
    if (!found) throw new Error("Testimony not found");
    return found;
  }
  return apiFetch<Testimony>(`/api/testimony-aid/${id}`);
}

/**
 * Loads a single testimony by id for the detail page.
 * Falls back to local seed data when no backend is configured.
 */
export function useTestimony(id: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.testimony(id),
    queryFn: () => fetchTestimony(id),
    enabled: id.length > 0,
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: AdminUpdateTestimonyPayload) => {
      if (!apiConfigured) return;
      await apiFetch(`/api/testimony-aid/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    // Refresh this testimony and the shared list once the edit lands.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testimony(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.testimonies });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      if (!apiConfigured) return;
      await apiFetch(`/api/testimony-aid/${id}`, { method: "DELETE" });
    },
    // Drop it from the shared list so the queue/archive update immediately.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testimonies });
    },
  });

  return {
    testimony: query.data ?? null,
    loading: query.isLoading,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Failed to load testimony"
      : null,
    reload: () => query.refetch(),
    update: (payload: AdminUpdateTestimonyPayload) =>
      updateMutation.mutateAsync(payload),
    remove: () => removeMutation.mutateAsync(),
  };
}
