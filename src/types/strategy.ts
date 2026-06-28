import type { PermissionContext } from "./auth";

// =============================================================================
// Generic strategy + policy contracts.
//
// A DomainStrategy is a pluggable, pure piece of business logic (pricing,
// assignment, scheduling...). A DomainPolicy answers "is this principal allowed
// to view/manage this subject?". Concrete implementations live in
// src/server/domain/strategies and src/server/domain/policies.
// =============================================================================

/** A pluggable, pure unit of domain logic. */
export interface DomainStrategy<TInput, TResult> {
  readonly name: string;
  execute(input: TInput): TResult;
}

/** An authorization policy for a given subject type (e.g. a Reservation). */
export interface DomainPolicy<TSubject> {
  readonly name: string;
  canView(ctx: PermissionContext, subject: TSubject): boolean;
  canManage(ctx: PermissionContext, subject: TSubject): boolean;
}
