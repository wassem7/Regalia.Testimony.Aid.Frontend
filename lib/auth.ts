import { apiConfigured, apiFetch, clearTokens, setTokens } from "./api";

interface LoginResult {
  token: string;
  refreshToken?: string | null;
}

/**
 * Authenticates a Testimony Aid admin against the backend and stores the tokens.
 * In standalone mode (no backend configured) any credentials are accepted so
 * the dashboard can be explored with demo data.
 */
export async function login(tkn: string, password: string): Promise<void> {
  if (!apiConfigured) {
    setTokens("demo-token");
    return;
  }

  const result = await apiFetch<LoginResult>("/api/admin/testimony-aid/login", {
    method: "POST",
    body: JSON.stringify({ tkn, password }),
  });

  setTokens(result.token, result.refreshToken);
}

export function logout(): void {
  clearTokens();
}
