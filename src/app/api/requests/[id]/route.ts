import {
  deleteRequest,
  getRequest,
} from "@/server/api/controllers/requests.controller";
import { routeWithParams } from "@/server/api/handler";

// GET /api/requests/[id] — owner or admin only.
export const GET = routeWithParams((req, params) => getRequest(req, params.id));

// DELETE /api/requests/[id] — cancel; owner or admin only.
export const DELETE = routeWithParams((req, params) =>
  deleteRequest(req, params.id),
);
