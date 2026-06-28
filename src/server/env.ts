// =============================================================================
// Server-side environment configuration (read once, validated).
// Never import this from client components.
// =============================================================================

const DEV_FALLBACK_SECRET =
  "dev-only-secret-change-me-please-use-a-long-random-string";

const isProd = process.env.NODE_ENV === "production";

function resolveAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    if (isProd) {
      throw new Error(
        "AUTH_SECRET must be set to a strong value in production.",
      );
    }
    // Dev convenience only — replace in .env for anything real.
    return DEV_FALLBACK_SECRET;
  }
  return secret;
}

function resolveSessionMaxAge(): number {
  const n = Number(process.env.AUTH_SESSION_MAX_AGE);
  return Number.isFinite(n) && n > 0 ? n : 60 * 60 * 24 * 7; // 7 days
}

export const env = {
  isProd,
  authSecret: resolveAuthSecret(),
  cookieName: process.env.AUTH_COOKIE_NAME ?? "zpo_session",
  sessionMaxAge: resolveSessionMaxAge(),
} as const;
