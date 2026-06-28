// =============================================================================
// Generic enums (single source of truth for both runtime values and TS types).
//
// These are plain string-literal unions (NOT imported from @prisma/client) so
// that the pure domain layer + unit tests never need a generated Prisma client
// or a database. The Prisma schema mirrors these exact values.
// =============================================================================

/** Application roles. Generic minimum = USER + ADMIN. */
export const ROLES = ["USER", "ADMIN"] as const;
export type UserRole = (typeof ROLES)[number];

/** Resource category. Start variant: car class. */
export const CAR_CLASSES = [
  "ECONOMY",
  "STANDARD",
  "SUV",
  "PREMIUM",
  "LUXURY",
] as const;
export type CarClass = (typeof CAR_CLASSES)[number];

/** Request lifecycle status. Generic for every domain. */
export const RESERVATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

// -----------------------------------------------------------------------------
// Generic (domain-neutral) aliases. The generic layer refers to these names so
// that swapping the concrete domain only touches the right-hand side here.
// -----------------------------------------------------------------------------

/** Generic category type (Car Rental => CarClass). */
export type ResourceCategory = CarClass;
export const RESOURCE_CATEGORIES = CAR_CLASSES;

/** Generic request status (Car Rental => ReservationStatus). */
export type RequestStatus = ReservationStatus;
export const REQUEST_STATUSES = RESERVATION_STATUSES;

/** Generic resource availability flag (derived from Car.isActive). */
export const RESOURCE_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];
