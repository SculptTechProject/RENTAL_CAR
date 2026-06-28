import { NextResponse } from "next/server";
import { openApiSpec } from "@/server/api/openapi";

// GET /api/api-docs — raw OpenAPI spec (public). Rendered by /api-docs.
export function GET() {
  return NextResponse.json(openApiSpec);
}
