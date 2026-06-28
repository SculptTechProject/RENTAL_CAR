import type { CarClass } from "@/types";

// =============================================================================
// Pricing rules for the CAR RENTAL pricing algorithm.
//
// Kept as a single, well-named constant so the business rules are obvious and
// easy to tweak/defend. The algorithm (car-rental-pricing.ts) reads ONLY from
// here — there are no magic numbers scattered in the logic.
// =============================================================================

export const RENTAL_RULES = {
  /** Hard minimum legal driver age — below this we refuse to price. */
  minDriverAge: 18,

  /** Drivers below this age pay a daily young-driver surcharge. */
  youngDriverAgeThreshold: 25,
  /** Young-driver surcharge per rental day (PLN). */
  youngDriverDailyFee: 50,

  /** From this many days the rental counts as "long" and gets a discount. */
  longRentalThresholdDays: 7,
  /** Long-rental discount as a fraction of the base price. */
  longRentalDiscountRate: 0.1,

  /** Base daily insurance price (PLN), multiplied by the class factor below. */
  insuranceDailyBase: 40,
  /** Insurance is more expensive for more valuable classes. */
  classInsuranceMultiplier: {
    ECONOMY: 1,
    STANDARD: 1.2,
    SUV: 1.5,
    PREMIUM: 1.8,
    LUXURY: 2.5,
  } satisfies Record<CarClass, number>,

  /** High-season months (1 = January ... 12 = December). */
  highSeasonMonths: [6, 7, 8, 12],
  /** Base price multiplier applied in high season. */
  highSeasonMultiplier: 1.2,
  /** Multiplier applied outside high season. */
  normalSeasonMultiplier: 1.0,
} as const;

export type RentalRules = typeof RENTAL_RULES;
