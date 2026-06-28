import { login } from "@/server/api/controllers/auth.controller";
import { route } from "@/server/api/handler";

// POST /api/auth/login
export const POST = route(login);
