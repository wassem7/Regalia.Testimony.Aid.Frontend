import type { ApiEnvelope } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const TOKEN_KEY = "testimony-aid-token";
const REFRESH_KEY = "testimony-aid-refresh-token";

/** Whether a real backend is configured. When false, hooks use local seed data. */
export const apiConfigured = BASE_URL.length > 0;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setTokens(token: string, refreshToken?: string | null): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) window.localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

/**
 * Whether the user is authenticated. In standalone mode (no backend configured)
 * this always returns true so the dashboard is reachable with demo data.
 */
export function isAuthenticated(): boolean {
  if (!apiConfigured) return true;
  return getToken() !== null;
}

/** Clears the session and sends the user to the login screen. */
function forceLogout(): void {
  clearTokens();
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Single-flight refresh: concurrent 401s share one refresh request.
let refreshInFlight: Promise<string | null> | null = null;

/**
 * Exchanges the stored refresh token for a new access token (rotating the
 * refresh token). Returns the new access token, or null if refresh failed.
 * De-duplicated so parallel 401s trigger only one refresh call.
 */
async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const body = (await res.json()) as ApiEnvelope<{
        token: string;
        refreshToken: string;
      }>;

      if (!res.ok || body.isSuccess === false || !body.result?.token) {
        return null;
      }

      setTokens(body.result.token, body.result.refreshToken);
      return body.result.token;
    } catch {
      return null;
    }
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

function buildHeaders(token: string | null, init: RequestInit): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init.headers,
  };
}

/**
 * Calls the backend and unwraps the `ApiResponseV2<T>` envelope.
 *
 * On a 401 (expired/invalid token) it transparently refreshes the access
 * token once and retries the request. If refresh fails, the session is
 * cleared and the user is redirected to /login.
 *
 * Throws `ApiError` on any other non-2xx response or unsuccessful envelope.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders(getToken(), init),
  });

  // Token expired/invalid — try a one-time refresh + retry.
  if (res.status === 401 && !isRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, init, true);
    }
    forceLogout();
    throw new ApiError("Session expired", 401);
  }

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // non-JSON response
  }

  if (res.status === 401) {
    // Retry already attempted (or this IS the retry) and still unauthorized.
    forceLogout();
    throw new ApiError(body?.message || "Session expired", 401);
  }

  if (!res.ok || (body && body.isSuccess === false)) {
    const message =
      body?.message || body?.errors?.[0] || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return (body ? body.result : (undefined as T)) as T;
}
