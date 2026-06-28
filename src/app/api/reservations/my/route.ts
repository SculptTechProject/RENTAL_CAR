import { listMyRequests } from "@/server/api/controllers/requests.controller";
import { route } from "@/server/api/handler";

// GET /api/reservations/my — car-rental alias of /api/requests/my.
export const GET = route(listMyRequests);
