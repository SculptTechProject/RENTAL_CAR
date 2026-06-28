import { register } from "@/server/api/controllers/auth.controller";
import { route } from "@/server/api/handler";

// POST /api/auth/register
export const POST = route(register);
