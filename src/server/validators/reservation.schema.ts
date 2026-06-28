import { z } from "zod";
import { RESERVATION_STATUSES } from "@/types";

// Body for POST /api/requests (POST /api/reservations).
// `carId` is the current-domain name for the generic `resourceId`.
export const createReservationSchema = z
  .object({
    carId: z.string().min(1, "Wymagane id samochodu."),
    startDate: z.coerce.date({ invalid_type_error: "Nieprawidłowa data od." }),
    endDate: z.coerce.date({ invalid_type_error: "Nieprawidłowa data do." }),
    // Basic sanity only — the business rule (min. 18) is enforced by the
    // pricing algorithm, so the domain layer stays the authority.
    driverAge: z.coerce.number().int().min(16).max(120),
    withInsurance: z.boolean().default(false),
  })
  .refine((d) => d.endDate > d.startDate, {
    message: "Data zakończenia musi być po dacie rozpoczęcia.",
    path: ["endDate"],
  });
export type CreateReservationInput = z.infer<typeof createReservationSchema>;

// Body for admin status updates (PATCH).
export const updateStatusSchema = z.object({
  status: z.enum(RESERVATION_STATUSES),
});
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
