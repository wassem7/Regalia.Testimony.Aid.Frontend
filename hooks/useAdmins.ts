"use client";

import { useCallback, useEffect, useState } from "react";
import { apiConfigured, apiFetch } from "@/lib/api";
import { seedAdmins } from "@/lib/seed";
import {
  roleValue,
  toAdmin,
  type Admin,
  type AdminRole,
  type ApiAdmin,
} from "@/lib/types";

/**
 * Loads the testimony-aid admin list and exposes toggle/remove actions.
 * Falls back to local seed data when no backend is configured.
 */
export function useAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (signal?: { cancelled: boolean }) => {
    const setIfLive = <T,>(setter: (v: T) => void, value: T) => {
      if (!signal?.cancelled) setter(value);
    };

    if (!apiConfigured) {
      setIfLive(setAdmins, seedAdmins());
      setIfLive(setLoading, false);
      return;
    }
    try {
      const rows = await apiFetch<ApiAdmin[]>("/api/testimony-aid-admin");
      setIfLive(setAdmins, rows.map(toAdmin));
    } catch {
      setIfLive(setAdmins, []);
    } finally {
      setIfLive(setLoading, false);
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
    setLoading(true);
    void load();
  }, [load]);

  const toggle = useCallback(
    async (id: string) => {
      const target = admins.find((a) => a.id === id);
      if (!target) return;

      setAdmins((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)),
      );

      if (!apiConfigured) return;
      // Deactivation maps to the backend soft-delete; reactivation re-adds.
      try {
        if (target.isActive) {
          await apiFetch(`/api/testimony-aid-admin/${id}`, { method: "DELETE" });
        }
      } catch {
        setAdmins((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isActive: target.isActive } : a)),
        );
      }
    },
    [admins],
  );

  const remove = useCallback(
    async (id: string) => {
      const prev = admins;
      setAdmins((cur) => cur.filter((a) => a.id !== id));

      if (!apiConfigured) return;
      try {
        await apiFetch(`/api/testimony-aid-admin/${id}`, { method: "DELETE" });
      } catch {
        setAdmins(prev);
      }
    },
    [admins],
  );

  /** Add an admin by TKN + role. Throws (with the API message) on failure. */
  const add = useCallback(
    async (tkn: string, role: AdminRole) => {
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
      // Reload so the row shows the member's real name (not just the TKN).
      await load();
    },
    [load],
  );

  return { admins, loading, reload, toggle, remove, add };
}
