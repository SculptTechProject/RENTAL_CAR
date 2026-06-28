import type { AuthenticatedUser } from "@/types";
import type { IPermissionPolicy } from "../core/interfaces";

// =============================================================================
// AUTHORIZATION POLICY (ownership rules).
//
//   USER  -> can only access/manage THEIR OWN requests.
//   ADMIN -> can access/manage everything.
//
// These pure functions are the single place that answers "is this allowed?".
// They are called by the services BEFORE returning or mutating data, so a USER
// can never read or cancel someone else's reservation by guessing an id.
// =============================================================================

/** Minimal shape needed to decide ownership. */
export interface OwnedRequest {
  userId: string;
  status?: string;
}

export function canAccessRequest(
  user: AuthenticatedUser,
  request: OwnedRequest,
): boolean {
  return user.role === "ADMIN" || request.userId === user.id;
}

export function canManageRequest(
  user: AuthenticatedUser,
  request: OwnedRequest,
): boolean {
  if (user.role === "ADMIN") return true;
  // The owner may manage (e.g. cancel) their own request.
  return request.userId === user.id;
}

/** The same rules exposed as a generic IPermissionPolicy implementation. */
export const reservationPolicy: IPermissionPolicy<OwnedRequest> = {
  canAccess: canAccessRequest,
  canManage: canManageRequest,
};
