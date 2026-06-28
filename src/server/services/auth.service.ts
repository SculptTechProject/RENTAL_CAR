import type { User } from "@prisma/client";
import type { AuthenticatedUser } from "@/types";
import { hashPassword, verifyPassword } from "../auth/password";
import { ConflictError, UnauthorizedError } from "../errors";
import { userRepository } from "../repositories/user.repository";
import type { LoginInput, RegisterInput } from "../validators";

// =============================================================================
// Auth service: registration + credential check. Passwords are bcrypt-hashed;
// login errors are deliberately generic to avoid user enumeration.
// =============================================================================

function toAuthenticatedUser(user: User): AuthenticatedUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthenticatedUser> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("Użytkownik z tym adresem e-mail już istnieje.");
    }
    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: "USER", // forced — no self-elevation
    });
    return toAuthenticatedUser(user);
  },

  async login(input: LoginInput): Promise<AuthenticatedUser> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) throw new UnauthorizedError("Nieprawidłowy e-mail lub hasło.");
    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Nieprawidłowy e-mail lub hasło.");
    return toAuthenticatedUser(user);
  },
};
