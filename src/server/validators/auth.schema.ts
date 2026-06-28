import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres e-mail."),
  password: z.string().min(1, "Hasło jest wymagane."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Imię musi mieć min. 2 znaki.").max(80),
  email: z.string().email("Nieprawidłowy adres e-mail."),
  password: z.string().min(8, "Hasło musi mieć min. 8 znaków.").max(100),
  // NOTE: there is intentionally NO `role` field. A user can never choose their
  // own role during self-registration (no privilege escalation). Admins are
  // created via the seed only.
});
export type RegisterInput = z.infer<typeof registerSchema>;
