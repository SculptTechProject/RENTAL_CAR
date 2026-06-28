import { createRequest } from "@/server/api/controllers/requests.controller";
import { route } from "@/server/api/handler";

// POST /api/requests — create a request (reservation).
export const POST = route(createRequest);
