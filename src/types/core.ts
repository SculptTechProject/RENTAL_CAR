// =============================================================================
// Generic core types: entities, Result, domain errors, API envelopes, algorithm.
// =============================================================================

/** Every persisted entity has at least these fields. */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A half-open date window [startDate, endDate).
 * Used by the availability (collision) and scheduling algorithms.
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// -----------------------------------------------------------------------------
// Result<T, E> — explicit success/failure without throwing.
// Used by the PURE domain layer (algorithms) so callers must handle both cases.
// -----------------------------------------------------------------------------

export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E = DomainError> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

export const isOk = <T, E>(r: Result<T, E>): r is Ok<T> => r.ok;
export const isErr = <T, E>(r: Result<T, E>): r is Err<E> => !r.ok;

// -----------------------------------------------------------------------------
// Domain errors — plain data describing a broken business rule.
// The HTTP layer (src/server/errors) maps these to status codes; the domain
// layer never imports HTTP concerns.
// -----------------------------------------------------------------------------

export interface DomainError {
  code: string;
  message: string;
  details?: unknown;
}

/** A specific business rule that was violated (e.g. "DATE_RANGE_INVALID"). */
export interface DomainRuleViolation extends DomainError {
  rule: string;
}

export const ruleViolation = (
  rule: string,
  message: string,
  details?: unknown,
): DomainRuleViolation => ({ code: "DOMAIN_RULE_VIOLATION", rule, message, details });

// -----------------------------------------------------------------------------
// API envelopes — every REST response uses this shape.
// -----------------------------------------------------------------------------

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: unknown } };

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// -----------------------------------------------------------------------------
// AlgorithmResult<T> — any domain algorithm returns its details plus the list
// of human-readable rules it applied (great for explaining results in the UI
// and during the oral defense).
// -----------------------------------------------------------------------------

export type AlgorithmResult<T> = T & { appliedRules: string[] };
