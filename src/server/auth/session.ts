import { cookies } from "next/headers";
import type { AuthenticatedUser, UserRole } from "@/types";
import { env } from "../env";
import { ForbiddenError, UnauthorizedError } from "../errors";
import { signSession, verifySession } from "./token";

// =============================================================================
// CENTRAL AUTH HELPERS — the security backbone used by every protected route.
//
//   getCurrentUser()  -> principal or null   (read-only, safe in RSC)
//   requireUser()     -> principal or 401
//   requireRole(role) -> principal or 401/403
//
// All checks happen on the SERVER against the signed cookie. Hiding buttons in
// the UI is NOT a security mechanism here — these functions are.
// =============================================================================

/** Read + verify the session cookie. Returns null when not logged in. */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const store = await cookies();
  const token = store.get(env.cookieName)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Require a logged-in user, otherwise throw 401. */
export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

/** Require a logged-in user with the given role, otherwise throw 401/403. */
export async function requireRole(role: UserRole): Promise<AuthenticatedUser> {
  const user = await requireUser();
  if (user.role !== role) {
    throw new ForbiddenError(`Operacja wymaga roli: ${role}.`);
  }
  return user;
}

/** Issue the httpOnly session cookie (used by login/register). */
export async function setSessionCookie(user: AuthenticatedUser): Promise<void> {
  const token = await signSession(user);
  const store = await cookies();
  store.set(env.cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProd,
    path: "/",
    maxAge: env.sessionMaxAge,
  });
}

/** Clear the session cookie (logout). */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(env.cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProd,
    path: "/",
    maxAge: 0,
  });
}
