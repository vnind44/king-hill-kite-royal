import { authClient } from "@/lib/auth/client";

const BEARER_KEY = "grok-auth.bearer-token";

/** Live preview iframes cannot keep __Host- cookies. Persist Better Auth's token. */
export function persistAuthToken(token?: string | null) {
  if (!token || typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(BEARER_KEY, token);
  } catch {
    /* storage blocked */
  }
}

export async function completeEmailAuth(result: {
  error?: { message?: string } | null;
  data?: { token?: string | null } | null;
}) {
  if (result.error) {
    throw new Error(result.error.message || "Could not sign in.");
  }
  persistAuthToken(result.data?.token ?? null);
  await authClient.getSession();
}
