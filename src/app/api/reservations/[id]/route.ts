import {
  deleteRequest,
  getRequest,
} from "@/server/api/controllers/requests.controller";
import { routeWithParams } from "@/server/api/handler";

// GET /api/reservations/[id] — car-rental alias of /api/requests/[id].
export const GET = routeWithParams((req, params) => getRequest(req, params.id));

// DELETE /api/reservations/[id] — cancel.
export const DELETE = routeWithParams((req, params) =>
  deleteRequest(req, params.id),
);
