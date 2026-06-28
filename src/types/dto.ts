import type {
  CarClass,
  ReservationStatus,
  RequestStatus,
  ResourceCategory,
} from "./enums";

// =============================================================================
// DTOs — the JSON-serialisable shapes returned by the REST API.
// Prisma entities (Decimal, Date) are mapped to these (number, ISO string) by
// the presenters in src/server/api/presenters.ts.
// =============================================================================

/** Serialised RESOURCE. Start variant: a car. */
export interface CarDTO {
  id: string;
  brand: string;
  model: string;
  carClass: CarClass;
  pricePerDay: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Serialised REQUEST. Start variant: a reservation. */
export interface ReservationDTO {
  id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  driverAge: number;
  withInsurance: boolean;
  status: ReservationStatus;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  /** Optionally embedded when listing/detailing a reservation. */
  car?: CarDTO;
  /** Optionally embedded for the admin list (who made the request). */
  user?: { id: string; name: string; email: string };
}

// -----------------------------------------------------------------------------
// Input DTOs (already validated by Zod before they reach a service).
// -----------------------------------------------------------------------------

/** Generic base for "create a request about a resource in a window". */
export interface CreateRequestBaseInput {
  resourceId: string;
  startDate: Date;
  endDate: Date;
}

/** Car-rental specific create input (adds the domain fields). */
export interface CreateReservationInput extends CreateRequestBaseInput {
  driverAge: number;
  withInsurance: boolean;
}

/** Generic alias pointing at the current domain's create input. */
export type CreateRequestInput = CreateReservationInput;

export interface UpdateRequestStatusInput {
  status: RequestStatus;
}

export interface ResourceAvailabilityInput {
  startDate: Date;
  endDate: Date;
  category?: ResourceCategory;
}
