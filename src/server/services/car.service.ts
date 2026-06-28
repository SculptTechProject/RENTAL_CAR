import type { Car, CarClass } from "@prisma/client";
import type { AuthenticatedUser } from "@/types";
import { ForbiddenError, NotFoundError } from "../errors";
import { carRepository, type CreateCarData } from "../repositories/car.repository";

// =============================================================================
// Car service (= generic Resource service). Catalogue reads + admin writes.
// =============================================================================

export const carService = {
  /** Public catalogue: bookable cars only. */
  listActive(category?: CarClass): Promise<Car[]> {
    return carRepository.findActive(category);
  },

  async getById(id: string): Promise<Car> {
    const car = await carRepository.findById(id);
    if (!car) throw new NotFoundError("Samochód nie istnieje.");
    return car;
  },

  /** Admin-only: full fleet, including inactive. */
  listAll(admin: AuthenticatedUser): Promise<Car[]> {
    if (admin.role !== "ADMIN") throw new ForbiddenError();
    return carRepository.findAll();
  },

  /** Admin-only: add a car. */
  create(admin: AuthenticatedUser, data: CreateCarData): Promise<Car> {
    if (admin.role !== "ADMIN") throw new ForbiddenError();
    return carRepository.create(data);
  },
};
