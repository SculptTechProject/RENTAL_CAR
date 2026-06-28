import { Prisma, type Reservation, type ReservationStatus } from "@prisma/client";
import type { DateRange } from "@/types";
import type { IRequestRepository } from "../domain/core/interfaces";
import { prisma } from "../db/prisma";

// =============================================================================
// RESERVATION repository (= generic RequestRepository).
// Contains the collision query (findOverlapping / findBusyResourceIds), which
// is how availability is enforced on the BACKEND, in the database.
// =============================================================================

/** Reservation with its car eagerly loaded (used for detail/list views). */
export type ReservationWithCar = Prisma.ReservationGetPayload<{
  include: { car: true };
}>;

/** Reservation with car + minimal user (used for the admin list). */
export type ReservationWithRelations = Prisma.ReservationGetPayload<{
  include: { car: true; user: { select: { id: true; name: true; email: true } } };
}>;

export interface CreateReservationData {
  userId: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  driverAge: number;
  withInsurance: boolean;
  totalPrice: number;
  status?: ReservationStatus;
}

/** A window [startDate, endDate) overlaps a row when start < rowEnd AND end > rowStart. */
function overlapWhere(range: DateRange) {
  return {
    // CANCELLED reservations free the car; everything else blocks it.
    status: { not: "CANCELLED" as ReservationStatus },
    startDate: { lt: range.endDate },
    endDate: { gt: range.startDate },
  };
}

export const reservationRepository = {
  findById(id: string): Promise<ReservationWithCar | null> {
    return prisma.reservation.findUnique({
      where: { id },
      include: { car: true },
    });
  },

  findByUser(userId: string): Promise<ReservationWithCar[]> {
    return prisma.reservation.findMany({
      where: { userId },
      include: { car: true },
      orderBy: { createdAt: "desc" },
    });
  },

  findAll(): Promise<ReservationWithRelations[]> {
    return prisma.reservation.findMany({
      include: {
        car: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  create(data: CreateReservationData): Promise<ReservationWithCar> {
    return prisma.reservation.create({
      data: {
        userId: data.userId,
        carId: data.carId,
        startDate: data.startDate,
        endDate: data.endDate,
        driverAge: data.driverAge,
        withInsurance: data.withInsurance,
        totalPrice: new Prisma.Decimal(data.totalPrice),
        status: data.status ?? "PENDING",
      },
      include: { car: true },
    });
  },

  updateStatus(
    id: string,
    status: ReservationStatus,
  ): Promise<ReservationWithCar> {
    return prisma.reservation.update({
      where: { id },
      data: { status },
      include: { car: true },
    });
  },

  findOverlapping(resourceId: string, range: DateRange): Promise<Reservation[]> {
    return prisma.reservation.findMany({
      where: { carId: resourceId, ...overlapWhere(range) },
    });
  },

  async findBusyResourceIds(range: DateRange): Promise<string[]> {
    const rows = await prisma.reservation.findMany({
      where: overlapWhere(range),
      select: { carId: true },
      distinct: ["carId"],
    });
    return rows.map((r) => r.carId);
  },
} satisfies IRequestRepository<Reservation, CreateReservationData, ReservationStatus>;
