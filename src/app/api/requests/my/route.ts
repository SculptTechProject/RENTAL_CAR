import { listMyRequests } from "@/server/api/controllers/requests.controller";
import { route } from "@/server/api/handler";

// GET /api/requests/my — the current user's own requests.
export const GET = route(listMyRequests);
