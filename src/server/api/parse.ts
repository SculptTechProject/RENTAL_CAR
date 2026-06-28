import type { NextRequest } from "next/server";
import { ValidationError } from "../errors";

/** Safely read a JSON body; a malformed body becomes a 400. */
export async function parseJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ValidationError("Treść żądania musi być poprawnym JSON.");
  }
}

/** Turn the query string into a plain object for Zod parsing. */
export function searchParamsToObject(req: NextRequest): Record<string, string> {
  return Object.fromEntries(new URL(req.url).searchParams.entries());
}
