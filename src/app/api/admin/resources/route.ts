import {
  adminCreateResource,
  adminListResources,
} from "@/server/api/controllers/resources.controller";
import { route } from "@/server/api/handler";

// GET /api/admin/resources — full fleet (ADMIN only).
export const GET = route(adminListResources);

// POST /api/admin/resources — add a resource (ADMIN only).
export const POST = route(adminCreateResource);
