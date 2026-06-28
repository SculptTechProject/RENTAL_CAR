import { getResource } from "@/server/api/controllers/resources.controller";
import { routeWithParams } from "@/server/api/handler";

// GET /api/resources/[id]
export const GET = routeWithParams((req, params) => getResource(req, params.id));
