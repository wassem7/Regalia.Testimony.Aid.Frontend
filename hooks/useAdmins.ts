"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiConfigured, apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { seedAdmins } from "@/lib/seed";
import {
  roleValue,
  toAdmin,
  type Admin,
  type AdminRole,
  type ApiAdmin,
} from "@/lib/types";

async function fetchAdmins(): Promise<Admin[]> {
  if (!apiConfigured) return seedAdmins();
  try {
    const rows = await apiFetch<ApiAdmin[]>("/api/testimony-aid-admin");
    return rows.map(toAdmin);
  } catch {
    return [];
  }
}

/**
 * Loads the testimony-aid admin list and exposes toggle/remove/add actions.
 * Falls back to local seed data when no backend is configured.
 */
export function useAdmins() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.admins,
    queryFn: fetchAdmins,
  });

  const admins = query.data ?? [];

  const setAdmins = (updater: (prev: Admin[]) => Admin[]) =>
    queryClient.setQueryData<Admin[]>(queryKeys.admins, (old) =>
      updater(old ?? []),
    );

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const target = admins.find((a) => a.id === id);
      if (!apiConfigured || !target) return;
      // Deactivation maps to the backend soft-delete; reactivation re-adds.
      if (target.isActive) {
        await apiFetch(`/api/testimony-aid-admin/${id}`, { method: "DELETE" });
      }
    },
    onMutate: (id: string) => {
      const previous = admins;
      setAdmins((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.admins, context.previous);
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!apiConfigured) return;
      await apiFetch(`/api/testimony-aid-admin/${id}`, { method: "DELETE" });
    },
    onMutate: (id: string) => {
      const previous = admins;
      setAdmins((prev) => prev.filter((a) => a.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.admins, context.previous);
      }
    },
  });

  const addMutation = useMutation({
    mutationFn: async ({ tkn, role }: { tkn: string; role: AdminRole }) => {
      if (!apiConfigured) {
        setAdmins((cur) => [
          {
            id: crypto.randomUUID(),
            name: tkn,
            tkn,
            role,
            lastLoginAt: null,
            isActive: true,
          },
          ...cur,
        ]);
        return;
      }
      await apiFetch("/api/testimony-aid-admin", {
        method: "POST",
        body: JSON.stringify({ tkn, role: roleValue(role) }),
      });
    },
    // Reload so the row shows the member's real name (not just the TKN).
    onSuccess: () => {
      if (apiConfigured) {
        queryClient.invalidateQueries({ queryKey: queryKeys.admins });
      }
    },
  });

  return {
    admins,
    loading: query.isLoading,
    reload: () => query.refetch(),
    toggle: (id: string) => toggleMutation.mutateAsync(id),
    remove: (id: string) => removeMutation.mutateAsync(id),
    add: (tkn: string, role: AdminRole) => addMutation.mutateAsync({ tkn, role }),
  };
}
