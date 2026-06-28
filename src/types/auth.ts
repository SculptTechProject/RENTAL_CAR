import type { UserRole } from "./enums";

/**
 * The authenticated principal, decoded from the signed session token.
 * This is the ONLY source of truth for "who is calling" on the backend.
 * The role here is signed by the server (jose / HS256) and cannot be forged
 * by the client.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/** Context passed to permission policies. */
export interface PermissionContext {
  user: AuthenticatedUser;
}

/** Payload stored inside the session JWT. */
export interface SessionTokenPayload {
  sub: string; // user id
  email: string;
  name: string;
  role: UserRole;
}
