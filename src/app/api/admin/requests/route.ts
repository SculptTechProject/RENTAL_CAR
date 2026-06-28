import { adminListRequests } from "@/server/api/controllers/requests.controller";
import { route } from "@/server/api/handler";

// GET /api/admin/requests — every request (ADMIN only).
export const GET = route(adminListRequests);
