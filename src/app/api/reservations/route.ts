import { createRequest } from "@/server/api/controllers/requests.controller";
import { route } from "@/server/api/handler";

// POST /api/reservations — car-rental alias of POST /api/requests.
export const POST = route(createRequest);
