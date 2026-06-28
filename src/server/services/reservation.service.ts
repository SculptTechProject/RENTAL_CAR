import { isErr, type AuthenticatedUser } from "@/types";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  fromRuleViolation,
} from "../errors";
import { canAccessRequest, canManageRequest } from "../domain/policies/reservation.policy";
import {
  calculateRentalPrice,
  checkResourceAvailability,
  type RentalPriceBreakdown,
} from "../domain/strategies";
import { carRepository } from "../repositories/car.repository";
import {
  reservationRepository,
  type ReservationWithCar,
  type ReservationWithRelations,
} from "../repositories/reservation.repository";

// =============================================================================
// Reservation service = the use-case orchestrator (the "algorithm pipeline").
//
//   create():  validate resource -> check collision -> run pricing algorithm
//              -> persist with the BACKEND-computed price.
//
// The price is taken from `calculateRentalPrice`, never from the client input.
// Authorization (ownership) is enforced here, before any data is returned or
// mutated — not in the UI.
// =============================================================================

export interface CreateReservationServiceInput {
  carId: string;
  startDate: Date;
  endDate: Date;
  driverAge: number;
  withInsurance: boolean;
}

export const reservationService = {
  async create(
    user: AuthenticatedUser,
    input: CreateReservationServiceInput,
  ): Promise<{ request: ReservationWithCar; result: RentalPriceBreakdown }> {
    // 1) Resource must exist and be bookable.
    const car = await carRepository.findById(input.carId);
    if (!car || !car.isActive) {
      throw new NotFoundError("Samochód nie istnieje lub jest niedostępny.");
    }

    const range = { startDate: input.startDate, endDate: input.endDate };

    // 2) Availability / collision check — on the BACKEND (DB + pure function).
    const existing = await reservationRepository.findOverlapping(car.id, range);
    const availability = checkResourceAvailability(range, existing);
    if (!availability.available) {
      throw new ConflictError(
        "Samochód jest już zarezerwowany w wybranym terminie.",
        { conflicts: availability.conflicts.length },
      );
    }

    // 3) Run the pricing algorithm using the price FROM THE DATABASE.
    const priced = calculateRentalPrice({
      pricePerDay: Number(car.pricePerDay),
      carClass: car.carClass,
      startDate: input.startDate,
      endDate: input.endDate,
      driverAge: input.driverAge,
      withInsurance: input.withInsurance,
    });
    if (isErr(priced)) {
      // A broken business rule (bad dates/age) -> 400.
      throw fromRuleViolation(priced.error);
    }

    // 4) Persist with the computed total.
    const request = await reservationRepository.create({
      userId: user.id,
      carId: car.id,
      startDate: input.startDate,
      endDate: input.endDate,
      driverAge: input.driverAge,
      withInsurance: input.withInsurance,
      totalPrice: priced.value.totalPrice,
      status: "PENDING",
    });

    return { request, result: priced.value };
  },

  /** Read one reservation — only owner or admin (else 403/404). */
  async getForUser(
    user: AuthenticatedUser,
    id: string,
  ): Promise<ReservationWithCar> {
    const reservation = await reservationRepository.findById(id);
    if (!reservation) throw new NotFoundError("Rezerwacja nie istnieje.");
    if (!canAccessRequest(user, reservation)) {
      throw new ForbiddenError("Brak dostępu do tej rezerwacji.");
    }
    return reservation;
  },

  /** A user's own reservations. */
  listForUser(user: AuthenticatedUser): Promise<ReservationWithCar[]> {
    return reservationRepository.findByUser(user.id);
  },

  /** Cancel — only owner or admin, and only when cancellable. */
  async cancel(
    user: AuthenticatedUser,
    id: string,
  ): Promise<ReservationWithCar> {
    const reservation = await reservationRepository.findById(id);
    if (!reservation) throw new NotFoundError("Rezerwacja nie istnieje.");
    if (!canManageRequest(user, reservation)) {
      throw new ForbiddenError("Brak uprawnień do anulowania tej rezerwacji.");
    }
    if (reservation.status === "CANCELLED") {
      throw new ConflictError("Rezerwacja jest już anulowana.");
    }
    if (reservation.status === "COMPLETED") {
      throw new ConflictError("Nie można anulować zakończonej rezerwacji.");
    }
    return reservationRepository.updateStatus(id, "CANCELLED");
  },

  /** Admin-only: every reservation in the system. */
  listAll(admin: AuthenticatedUser): Promise<ReservationWithRelations[]> {
    // Defense in depth: the route already calls requireRole("ADMIN").
    if (admin.role !== "ADMIN") {
      throw new ForbiddenError("Tylko administrator może przeglądać wszystkie rezerwacje.");
    }
    return reservationRepository.findAll();
  },
};
