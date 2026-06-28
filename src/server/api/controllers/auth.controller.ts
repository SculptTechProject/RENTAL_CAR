import type { NextRequest } from "next/server";
import type { AuthenticatedUser } from "@/types";
import {
  clearSessionCookie,
  getCurrentUser,
  setSessionCookie,
} from "../../auth";
import { authService } from "../../services";
import { loginSchema, registerSchema } from "../../validators";
import { parseJson } from "../parse";
import { created, ok, type ControllerResult } from "../responses";

export async function register(
  req: NextRequest,
): Promise<ControllerResult<{ user: AuthenticatedUser }>> {
  const input = registerSchema.parse(await parseJson(req));
  const user = await authService.register(input);
  await setSessionCookie(user); // log the new user in immediately
  return created({ user });
}

export async function login(
  req: NextRequest,
): Promise<ControllerResult<{ user: AuthenticatedUser }>> {
  const input = loginSchema.parse(await parseJson(req));
  const user = await authService.login(input);
  await setSessionCookie(user);
  return ok({ user });
}

export async function logout(): Promise<ControllerResult<{ ok: true }>> {
  await clearSessionCookie();
  return ok({ ok: true });
}

export async function me(): Promise<
  ControllerResult<{ user: AuthenticatedUser | null }>
> {
  const user = await getCurrentUser();
  return ok({ user });
}
