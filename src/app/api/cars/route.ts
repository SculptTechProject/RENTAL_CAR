import { listResources } from "@/server/api/controllers/resources.controller";
import { route } from "@/server/api/handler";

// GET /api/cars — car-rental alias of GET /api/resources.
export const GET = route(listResources);
