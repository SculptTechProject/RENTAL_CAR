import {
  adminCreateResource,
  adminListResources,
} from "@/server/api/controllers/resources.controller";
import { route } from "@/server/api/handler";

// GET /api/admin/cars — car-rental alias of /api/admin/resources (ADMIN).
export const GET = route(adminListResources);

// POST /api/admin/cars — add a car (ADMIN).
export const POST = route(adminCreateResource);
