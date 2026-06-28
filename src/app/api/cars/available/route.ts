import { listAvailableResources } from "@/server/api/controllers/resources.controller";
import { route } from "@/server/api/handler";

// GET /api/cars/available — car-rental alias of /api/resources/available.
export const GET = route(listAvailableResources);
