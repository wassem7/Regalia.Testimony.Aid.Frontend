"use client";

import { useCallback, useEffect, useState } from "react";
import { apiConfigured, apiFetch } from "@/lib/api";
import { toProfile, type ApiProfile, type Profile } from "@/lib/types";

const DEMO_PROFILE: Profile = {
  name: "Ruth Adeyemi",
  tkn: "TKN-4471",
  imageUrl: null,
  role: "Super Admin",
};

/** Loads the signed-in admin's profile for the sidebar. */
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const load = useCallback(async (signal?: { cancelled: boolean }) => {
    const commit = (p: Profile) => {
      if (!signal?.cancelled) setProfile(p);
    };

    if (!apiConfigured) {
      // Yield so this never sets state synchronously within the effect.
      await Promise.resolve();
      commit(DEMO_PROFILE);
      return;
    }
    try {
      const raw = await apiFetch<ApiProfile>("/api/admin/testimony-aid/profile");
      commit(toProfile(raw));
    } catch {
      // Leave null on failure; the sidebar renders a neutral placeholder.
    }
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };
    void load(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [load]);

  return profile;
}
