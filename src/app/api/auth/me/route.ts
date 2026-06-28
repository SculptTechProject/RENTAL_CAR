import { me } from "@/server/api/controllers/auth.controller";
import { route } from "@/server/api/handler";

// GET /api/auth/me — current principal (or null).
export const GET = route(() => me());
