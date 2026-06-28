import { SignJWT, jwtVerify } from "jose";
import { ROLES, type AuthenticatedUser, type UserRole } from "@/types";
import { env } from "../env";

// =============================================================================
// Session token = signed JWT (HS256). The signature is created with AUTH_SECRET,
// so the payload (including the role) cannot be forged or modified by the client.
// =============================================================================

const ALG = "HS256";
const secretKey = new TextEncoder().encode(env.authSecret);

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** Sign a session token for a user. */
export async function signSession(user: AuthenticatedUser): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: ALG })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + env.sessionMaxAge)
    .sign(secretKey);
}

/** Verify a session token. Returns the principal, or null if invalid/expired. */
export async function verifySession(
  token: string,
): Promise<AuthenticatedUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: [ALG],
    });
    if (!payload.sub || !isUserRole(payload.role)) return null;
    return {
      id: payload.sub,
      email: typeof payload.email === "string" ? payload.email : "",
      name: typeof payload.name === "string" ? payload.name : "",
      role: payload.role,
    };
  } catch {
    return null;
  }
}
