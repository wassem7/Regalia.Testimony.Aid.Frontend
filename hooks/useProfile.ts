"use client";

import { useQuery } from "@tanstack/react-query";
import { apiConfigured, apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { toProfile, type ApiProfile, type Profile } from "@/lib/types";

const DEMO_PROFILE: Profile = {
  name: "Ruth Adeyemi",
  tkn: "TKN-4471",
  imageUrl: null,
  role: "Super Admin",
};

async function fetchProfile(): Promise<Profile | null> {
  if (!apiConfigured) return DEMO_PROFILE;
  try {
    const raw = await apiFetch<ApiProfile>("/api/admin/testimony-aid/profile");
    return toProfile(raw);
  } catch {
    // Leave null on failure; the sidebar renders a neutral placeholder.
    return null;
  }
}

/** Loads the signed-in admin's profile for the sidebar. */
export function useProfile(): Profile | null {
  const query = useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchProfile,
  });
  return query.data ?? null;
}
