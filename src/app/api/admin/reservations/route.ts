import { adminListRequests } from "@/server/api/controllers/requests.controller";
import { route } from "@/server/api/handler";

// GET /api/admin/reservations — car-rental alias of /api/admin/requests.
export const GET = route(adminListRequests);
