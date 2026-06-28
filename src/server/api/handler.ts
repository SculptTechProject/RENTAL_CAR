import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import type { ApiResponse } from "@/types";
import { AppError } from "../errors";
import type { ControllerResult } from "./responses";

// =============================================================================
// Route wrappers + central error handling.
//
//   route(controller)            -> for static routes        GET(req)
//   routeWithParams(controller)  -> for dynamic [id] routes  GET(req, { params })
//
// Both catch errors and map them to the JSON error contract:
//   ZodError -> 400, AppError -> its status, anything else -> 500.
// This is why route.ts files stay tiny and never contain business logic.
// =============================================================================

type StaticController = (
  req: NextRequest,
) => Promise<ControllerResult<unknown>>;

type DynamicController = (
  req: NextRequest,
  params: { id: string },
) => Promise<ControllerResult<unknown>>;

interface DynamicContext {
  params: Promise<{ id: string }>;
}

export function route(controller: StaticController) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const result = await controller(req);
      return NextResponse.json(result.body, { status: result.status });
    } catch (error) {
      return handleApiError(error);
    }
  };
}

export function routeWithParams(controller: DynamicController) {
  return async (
    req: NextRequest,
    ctx: DynamicContext,
  ): Promise<NextResponse> => {
    try {
      const params = await ctx.params;
      const result = await controller(req, params);
      return NextResponse.json(result.body, { status: result.status });
    } catch (error) {
      return handleApiError(error);
    }
  };
}

export function handleApiError(
  error: unknown,
): NextResponse<ApiResponse<never>> {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Nieprawidłowe dane wejściowe.",
          details: error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status },
    );
  }

  // Unknown -> 500 (never leak internals to the client).
  console.error("Unhandled API error:", error);
  return NextResponse.json(
    {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Wewnętrzny błąd serwera." },
    },
    { status: 500 },
  );
}
