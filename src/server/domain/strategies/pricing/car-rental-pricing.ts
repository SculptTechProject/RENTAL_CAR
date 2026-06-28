import {
  type AlgorithmResult,
  type CarClass,
  type DomainRuleViolation,
  type Result,
  err,
  ok,
  ruleViolation,
} from "@/types";
import { RENTAL_RULES } from "../../config/rental-rules";
import type { IPricingStrategy } from "../../core/interfaces";

// =============================================================================
// CAR RENTAL pricing algorithm  ===  THE MAIN ALGORITHM  ===
//
// Pure function. No database, no UI, no IO. It takes plain numbers/dates and
// returns either a full price breakdown or a typed business-rule violation.
// This is why it is trivially unit-testable (see tests/car-rental-pricing.test.ts)
// and why the price can NEVER be supplied by the client — the backend computes
// it from data in the database.
// =============================================================================

export interface RentalPriceInput {
  /** Daily price taken from the Car row in the DB (never from the client). */
  pricePerDay: number;
  carClass: CarClass;
  startDate: Date;
  endDate: Date;
  driverAge: number;
  withInsurance: boolean;
}

/** Full, explainable breakdown of the computed price. */
export type RentalPriceBreakdown = AlgorithmResult<{
  days: number;
  pricePerDay: number;
  basePrice: number;
  seasonMultiplier: number;
  seasonAdjustment: number;
  youngDriverFee: number;
  longRentalDiscount: number;
  insuranceFee: number;
  totalPrice: number;
}>;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Normalise a date to UTC midnight so day math is DST-safe and deterministic. */
function utcMidnight(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Whole rental days between two dates (date granularity, DST-safe). */
export function rentalDays(startDate: Date, endDate: Date): number {
  return Math.round((utcMidnight(endDate) - utcMidnight(startDate)) / MS_PER_DAY);
}

/**
 * Compute the rental price.
 * @returns ok(breakdown) on success, or err(ruleViolation) for invalid input.
 */
export function calculateRentalPrice(
  input: RentalPriceInput,
): Result<RentalPriceBreakdown, DomainRuleViolation> {
  const { pricePerDay, carClass, startDate, endDate, driverAge, withInsurance } =
    input;

  // --- Guard clauses: business rules on the inputs ---------------------------
  if (
    !(startDate instanceof Date) ||
    !(endDate instanceof Date) ||
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return err(ruleViolation("DATE_INVALID", "Nieprawidłowa data."));
  }

  const days = rentalDays(startDate, endDate);
  if (days < 1) {
    return err(
      ruleViolation(
        "DATE_RANGE_INVALID",
        "Data zakończenia musi być po dacie rozpoczęcia (min. 1 dzień).",
      ),
    );
  }

  if (!Number.isFinite(driverAge) || driverAge < RENTAL_RULES.minDriverAge) {
    return err(
      ruleViolation(
        "DRIVER_TOO_YOUNG",
        `Minimalny wiek kierowcy to ${RENTAL_RULES.minDriverAge} lat.`,
      ),
    );
  }

  if (!Number.isFinite(pricePerDay) || pricePerDay <= 0) {
    return err(
      ruleViolation("PRICE_INVALID", "Cena za dzień musi być dodatnia."),
    );
  }

  const appliedRules: string[] = [];

  // --- Base price ------------------------------------------------------------
  const basePrice = round2(pricePerDay * days);
  appliedRules.push(
    `Cena bazowa: ${days} dni × ${pricePerDay} PLN = ${basePrice} PLN`,
  );

  // --- Seasonality -----------------------------------------------------------
  const month = startDate.getUTCMonth() + 1; // 1..12
  const isHighSeason = (RENTAL_RULES.highSeasonMonths as readonly number[]).includes(
    month,
  );
  const seasonMultiplier = isHighSeason
    ? RENTAL_RULES.highSeasonMultiplier
    : RENTAL_RULES.normalSeasonMultiplier;
  const seasonAdjustment = round2(basePrice * (seasonMultiplier - 1));
  if (isHighSeason) {
    appliedRules.push(
      `Sezon wysoki (×${seasonMultiplier}): +${seasonAdjustment} PLN`,
    );
  }

  // --- Young driver surcharge ------------------------------------------------
  let youngDriverFee = 0;
  if (driverAge < RENTAL_RULES.youngDriverAgeThreshold) {
    youngDriverFee = round2(RENTAL_RULES.youngDriverDailyFee * days);
    appliedRules.push(
      `Dopłata młody kierowca (<${RENTAL_RULES.youngDriverAgeThreshold} lat): +${youngDriverFee} PLN`,
    );
  }

  // --- Long rental discount --------------------------------------------------
  let longRentalDiscount = 0;
  if (days >= RENTAL_RULES.longRentalThresholdDays) {
    longRentalDiscount = round2(basePrice * RENTAL_RULES.longRentalDiscountRate);
    appliedRules.push(
      `Zniżka za długi wynajem (≥${RENTAL_RULES.longRentalThresholdDays} dni): -${longRentalDiscount} PLN`,
    );
  }

  // --- Insurance -------------------------------------------------------------
  let insuranceFee = 0;
  if (withInsurance) {
    const factor = RENTAL_RULES.classInsuranceMultiplier[carClass];
    insuranceFee = round2(RENTAL_RULES.insuranceDailyBase * factor * days);
    appliedRules.push(
      `Ubezpieczenie (${carClass} ×${factor}): +${insuranceFee} PLN`,
    );
  }

  // --- Total -----------------------------------------------------------------
  const totalPrice = round2(
    basePrice + seasonAdjustment + youngDriverFee + insuranceFee - longRentalDiscount,
  );

  return ok({
    days,
    pricePerDay,
    basePrice,
    seasonMultiplier,
    seasonAdjustment,
    youngDriverFee,
    longRentalDiscount,
    insuranceFee,
    totalPrice,
    appliedRules,
  });
}

/** The pure pricing function wrapped as a generic IPricingStrategy. */
export const carRentalPricingStrategy: IPricingStrategy<
  RentalPriceInput,
  RentalPriceBreakdown
> = {
  name: "car-rental-pricing",
  calculate: calculateRentalPrice,
};
