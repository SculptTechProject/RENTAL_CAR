import type { ApiResponse } from "@/types";

// =============================================================================
// Controller result helpers. A controller returns { status, body } and the
// route wrapper (handler.ts) serialises it. Every body uses the ApiResponse
// envelope: { success: true, data } | { success: false, error }.
// =============================================================================

export interface ControllerResult<T> {
  status: number;
  body: ApiResponse<T>;
}

export function ok<T>(data: T, status = 200): ControllerResult<T> {
  return { status, body: { success: true, data } };
}

export function created<T>(data: T): ControllerResult<T> {
  return ok(data, 201);
}
