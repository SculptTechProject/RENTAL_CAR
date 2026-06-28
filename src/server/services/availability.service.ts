import type { Car, CarClass } from "@prisma/client";
import type { DateRange } from "@/types";
import type { IAvailabilityService } from "../domain/core/interfaces";
import { checkResourceAvailability } from "../domain/strategies";
import { carRepository } from "../repositories/car.repository";
import { reservationRepository } from "../repositories/reservation.repository";

// =============================================================================
// Availability service: combines the DB (repositories) with the PURE collision
// algorithm. The collision logic itself lives in the domain layer and is unit
// tested without a database.
// =============================================================================

export const availabilityService = {
  /** Is a single car free for the whole window? */
  async isResourceAvailable(
    resourceId: string,
    range: DateRange,
  ): Promise<boolean> {
    const existing = await reservationRepository.findOverlapping(
      resourceId,
      range,
    );
    return checkResourceAvailability(range, existing).available;
  },

  /** All bookable cars that have no overlapping reservation in the window. */
  async getAvailableResources(
    range: DateRange,
    category?: CarClass,
  ): Promise<Car[]> {
    const [cars, busyIds] = await Promise.all([
      carRepository.findActive(category),
      reservationRepository.findBusyResourceIds(range),
    ]);
    const busy = new Set(busyIds);
    return cars.filter((car) => !busy.has(car.id));
  },
} satisfies IAvailabilityService<Car, CarClass>;
