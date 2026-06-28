// =============================================================================
// ACTIVE DOMAIN STRATEGIES.
//
// This barrel exposes the strategies the running app uses. Switching topic =
// re-export different strategies here (and update domain.config.ts).
//
// Current domain: CAR RENTAL  ->  pricing + availability.
// =============================================================================

export {
  calculateRentalPrice,
  carRentalPricingStrategy,
  rentalDays,
  type RentalPriceInput,
  type RentalPriceBreakdown,
} from "./pricing/car-rental-pricing";

export {
  rangesOverlap,
  checkResourceAvailability,
  checkCarAvailability,
  schedulingStrategy,
  type AvailabilityResult,
} from "./availability/date-overlap";

// Example alternative-domain strategy (Paczkomaty). Not wired into the app,
// kept to demonstrate how a different topic plugs in.
export {
  assignSmallestAvailableLocker,
  lockerAssignmentStrategy,
  type Parcel,
  type Locker,
  type LockerSize,
} from "./assignment/locker-assignment";
