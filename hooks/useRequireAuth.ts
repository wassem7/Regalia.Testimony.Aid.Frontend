"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/api";

const subscribe = (onChange: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

// `true` only on the client (after hydration); `false` on the server snapshot.
const useHasMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

// Live auth state read from localStorage (an external store).
const useAuthed = () =>
  useSyncExternalStore(
    subscribe,
    () => isAuthenticated(),
    () => false,
  );

/**
 * Client-side route guard. Redirects to /login only after the component has
 * mounted on the client and confirmed there is no session — so an authenticated
 * user is never bounced during the SSR/hydration window on a hard refresh.
 * In standalone mode `isAuthenticated()` is always true.
 */
export function useRequireAuth(): boolean {
  const router = useRouter();
  const mounted = useHasMounted();
  const authed = useAuthed();

  useEffect(() => {
    if (mounted && !authed) router.replace("/login");
  }, [mounted, authed, router]);

  return mounted && authed;
}
