import { logout } from "@/server/api/controllers/auth.controller";
import { route } from "@/server/api/handler";

// POST /api/auth/logout
export const POST = route(() => logout());
