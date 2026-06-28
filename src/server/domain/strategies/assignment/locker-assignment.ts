import {
  type DomainRuleViolation,
  type Result,
  err,
  ok,
  ruleViolation,
} from "@/types";
import type { IAssignmentStrategy } from "../../core/interfaces";

// =============================================================================
// ASSIGNMENT strategy — EXAMPLE of an ALTERNATIVE domain (Paczkomaty).
//
// This file is NOT used by the running car-rental app. It exists to prove the
// architecture: swapping the domain means writing a strategy like this and
// pointing strategies/index.ts at it. It is a pure function with its own tests
// (tests/locker-assignment.test.ts).
// =============================================================================

export type LockerSize = "SMALL" | "MEDIUM" | "LARGE";

const SIZE_ORDER: Record<LockerSize, number> = {
  SMALL: 0,
  MEDIUM: 1,
  LARGE: 2,
};

export interface Parcel {
  size: LockerSize;
}

export interface Locker {
  id: string;
  size: LockerSize;
  occupied: boolean;
}

/**
 * Assign the SMALLEST free locker that still fits the parcel.
 * (Domain algorithm for the "Paczkomaty" topic.)
 */
export function assignSmallestAvailableLocker(
  parcel: Parcel,
  lockers: Locker[],
): Result<Locker, DomainRuleViolation> {
  const fitting = lockers
    .filter((l) => !l.occupied && SIZE_ORDER[l.size] >= SIZE_ORDER[parcel.size])
    .sort((a, b) => SIZE_ORDER[a.size] - SIZE_ORDER[b.size]);

  const chosen = fitting[0];
  if (!chosen) {
    return err(
      ruleViolation(
        "NO_LOCKER_AVAILABLE",
        "Brak wolnej skrytki o odpowiednim rozmiarze dla tej paczki.",
      ),
    );
  }
  return ok(chosen);
}

export const lockerAssignmentStrategy: IAssignmentStrategy<Parcel, Locker> = {
  name: "smallest-available-locker",
  assign: assignSmallestAvailableLocker,
};
