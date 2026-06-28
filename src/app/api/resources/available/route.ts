import { listAvailableResources } from "@/server/api/controllers/resources.controller";
import { route } from "@/server/api/handler";

// GET /api/resources/available?startDate&endDate&carClass
export const GET = route(listAvailableResources);
