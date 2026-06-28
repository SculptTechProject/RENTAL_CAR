import type { DateRange } from "@/types";
import type { ISchedulingStrategy } from "../../core/interfaces";

// =============================================================================
// AVAILABILITY / COLLISION detection (pure).
//
// Two date windows are treated as half-open [start, end): a reservation that
// ends exactly when another begins does NOT collide (back-to-back is allowed).
// Used by:
//   - the create-reservation flow (checkCarAvailability)
//   - the /resources/available endpoint (via the repository busy-id query)
//   - the scheduling strategy (vet / rooms domains)
// =============================================================================

/** Do two half-open windows overlap? */
export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return a.startDate < b.endDate && b.startDate < a.endDate;
}

export interface AvailabilityResult {
  available: boolean;
  conflicts: DateRange[];
}

/**
 * Pure collision check for a single resource.
 * @param requested the window the user wants
 * @param existing  the resource's current (active) bookings
 */
export function checkResourceAvailability(
  requested: DateRange,
  existing: DateRange[],
): AvailabilityResult {
  const conflicts = existing.filter((e) => rangesOverlap(requested, e));
  return { available: conflicts.length === 0, conflicts };
}

/** Car-rental wording alias for the same generic function. */
export const checkCarAvailability = checkResourceAvailability;

/**
 * Scheduling strategy used by the Vet / Rooms domains:
 * detect collisions and find the next free slot of equal duration.
 */
export const schedulingStrategy: ISchedulingStrategy = {
  name: "date-overlap-scheduling",

  hasCollision(requested, existing) {
    return existing.some((e) => rangesOverlap(requested, e));
  },

  findNextAvailable(requested, existing, horizonDays) {
    const durationMs =
      requested.endDate.getTime() - requested.startDate.getTime();
    const horizonEnd = new Date(
      requested.startDate.getTime() + horizonDays * 86_400_000,
    );

    let start = new Date(requested.startDate);
    while (start < horizonEnd) {
      const candidate: DateRange = {
        startDate: new Date(start),
        endDate: new Date(start.getTime() + durationMs),
      };
      const overlapping = existing.filter((e) => rangesOverlap(candidate, e));
      if (overlapping.length === 0) return candidate;

      // Jump to the end of the latest conflicting booking and retry.
      const nextFree = overlapping.reduce(
        (latest, e) => (e.endDate > latest ? e.endDate : latest),
        overlapping[0].endDate,
      );
      start = new Date(nextFree);
    }
    return null;
  },
};
