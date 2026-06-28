import type { Car } from "@prisma/client";
import type { CarDTO, ReservationDTO } from "@/types";
import type {
  ReservationWithCar,
  ReservationWithRelations,
} from "../repositories";

// =============================================================================
// Presenters: map Prisma entities (Decimal, Date) to JSON-safe DTOs
// (number, ISO string). This is the boundary that keeps Prisma types out of
// the API responses.
// =============================================================================

export function toCarDTO(car: Car): CarDTO {
  return {
    id: car.id,
    brand: car.brand,
    model: car.model,
    carClass: car.carClass,
    pricePerDay: Number(car.pricePerDay),
    isActive: car.isActive,
    createdAt: car.createdAt.toISOString(),
    updatedAt: car.updatedAt.toISOString(),
  };
}

export function toReservationDTO(
  r: ReservationWithCar | ReservationWithRelations,
): ReservationDTO {
  const user = "user" in r ? r.user : undefined;
  return {
    id: r.id,
    userId: r.userId,
    carId: r.carId,
    startDate: r.startDate.toISOString(),
    endDate: r.endDate.toISOString(),
    driverAge: r.driverAge,
    withInsurance: r.withInsurance,
    status: r.status,
    totalPrice: Number(r.totalPrice),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    car: r.car ? toCarDTO(r.car) : undefined,
    user: user
      ? { id: user.id, name: user.name, email: user.email }
      : undefined,
  };
}
