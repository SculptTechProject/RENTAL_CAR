import type { NextRequest } from "next/server";
import { requireRole, requireUser } from "../../auth";
import { reservationService } from "../../services";
import { createReservationSchema } from "../../validators";
import { parseJson } from "../parse";
import { toReservationDTO } from "../presenters";
import { created, ok } from "../responses";

// POST /api/requests  (alias: /api/reservations) — create a reservation.
export async function createRequest(req: NextRequest) {
  const user = await requireUser();
  const input = createReservationSchema.parse(await parseJson(req));
  const { request, result } = await reservationService.create(user, input);
  // Return the persisted reservation AND the price breakdown the backend used.
  return created({
    reservation: toReservationDTO(request),
    price: result,
  });
}

// GET /api/requests/my  (alias: /api/reservations/my)
export async function listMyRequests(_req: NextRequest) {
  const user = await requireUser();
  const items = await reservationService.listForUser(user);
  return ok(items.map(toReservationDTO));
}

// GET /api/requests/[id] — owner or admin only.
export async function getRequest(_req: NextRequest, id: string) {
  const user = await requireUser();
  const reservation = await reservationService.getForUser(user, id);
  return ok(toReservationDTO(reservation));
}

// DELETE /api/requests/[id] — cancel; owner or admin only.
export async function deleteRequest(_req: NextRequest, id: string) {
  const user = await requireUser();
  const reservation = await reservationService.cancel(user, id);
  return ok(toReservationDTO(reservation));
}

// GET /api/admin/requests  (alias: /api/admin/reservations) — ADMIN.
export async function adminListRequests(_req: NextRequest) {
  const admin = await requireRole("ADMIN");
  const items = await reservationService.listAll(admin);
  return ok(items.map(toReservationDTO));
}
