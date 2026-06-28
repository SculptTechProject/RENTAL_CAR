import type { DomainRuleViolation } from "@/types";

// =============================================================================
// HTTP-facing error hierarchy.
//
// Services/controllers throw these; the API handler (src/server/api/handler.ts)
// maps `status` + `code` to the JSON error response. This is how we get a
// consistent 400 / 401 / 403 / 404 / 409 / 500 contract.
// =============================================================================

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** 400 — input failed validation (Zod) or a domain rule rejected the input. */
export class ValidationError extends AppError {
  constructor(message = "Nieprawidłowe dane wejściowe.", details?: unknown) {
    super(400, "VALIDATION_ERROR", message, details);
  }
}

/** 401 — no/invalid session. */
export class UnauthorizedError extends AppError {
  constructor(message = "Wymagane uwierzytelnienie.") {
    super(401, "UNAUTHORIZED", message);
  }
}

/** 403 — authenticated but not allowed. */
export class ForbiddenError extends AppError {
  constructor(message = "Brak uprawnień do tej operacji.") {
    super(403, "FORBIDDEN", message);
  }
}

/** 404 — resource does not exist. */
export class NotFoundError extends AppError {
  constructor(message = "Nie znaleziono zasobu.") {
    super(404, "NOT_FOUND", message);
  }
}

/** 409 — conflict, e.g. overlapping reservation. */
export class ConflictError extends AppError {
  constructor(message = "Konflikt — zasób jest już zajęty.", details?: unknown) {
    super(409, "CONFLICT", message, details);
  }
}

/** 500 — unexpected. */
export class InternalError extends AppError {
  constructor(message = "Wewnętrzny błąd serwera.") {
    super(500, "INTERNAL_ERROR", message);
  }
}

/** Convert a pure-domain rule violation into a 400 HTTP error. */
export function fromRuleViolation(v: DomainRuleViolation): ValidationError {
  return new ValidationError(v.message, { rule: v.rule });
}
