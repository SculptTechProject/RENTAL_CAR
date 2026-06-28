import { listResources } from "@/server/api/controllers/resources.controller";
import { route } from "@/server/api/handler";

// GET /api/resources — catalogue of bookable resources (cars).
export const GET = route(listResources);
