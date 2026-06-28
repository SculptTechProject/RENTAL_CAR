import { z } from "zod";
import { CAR_CLASSES } from "@/types";

// Body for POST /api/admin/resources (POST /api/admin/cars).
export const createCarSchema = z.object({
  brand: z.string().min(1, "Marka jest wymagana.").max(60),
  model: z.string().min(1, "Model jest wymagany.").max(60),
  carClass: z.enum(CAR_CLASSES),
  pricePerDay: z.coerce
    .number({ invalid_type_error: "Cena musi być liczbą." })
    .positive("Cena musi być dodatnia.")
    .max(100_000),
  isActive: z.boolean().default(true),
});
export type CreateCarInput = z.infer<typeof createCarSchema>;

// Query for GET /api/resources/available (and GET /api/cars/available).
export const availabilityQuerySchema = z
  .object({
    startDate: z.coerce.date({ invalid_type_error: "Nieprawidłowa data od." }),
    endDate: z.coerce.date({ invalid_type_error: "Nieprawidłowa data do." }),
    carClass: z.enum(CAR_CLASSES).optional(),
  })
  .refine((d) => d.endDate > d.startDate, {
    message: "Data zakończenia musi być po dacie rozpoczęcia.",
    path: ["endDate"],
  });
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
