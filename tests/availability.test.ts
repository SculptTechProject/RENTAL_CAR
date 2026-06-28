import { describe, expect, it } from "vitest";
import {
  checkCarAvailability,
  rangesOverlap,
  schedulingStrategy,
} from "@/server/domain/strategies/availability/date-overlap";
import type { DateRange } from "@/types";

const range = (start: string, end: string): DateRange => ({
  startDate: new Date(start),
  endDate: new Date(end),
});

describe("rangesOverlap", () => {
  it("wykrywa nakładające się terminy", () => {
    expect(
      rangesOverlap(range("2025-03-10", "2025-03-13"), range("2025-03-12", "2025-03-15")),
    ).toBe(true);
  });

  it("terminy stykające się (koniec == początek) nie kolidują", () => {
    expect(
      rangesOverlap(range("2025-03-10", "2025-03-13"), range("2025-03-13", "2025-03-15")),
    ).toBe(false);
  });

  it("rozłączne terminy nie kolidują", () => {
    expect(
      rangesOverlap(range("2025-03-01", "2025-03-05"), range("2025-03-10", "2025-03-13")),
    ).toBe(false);
  });
});

describe("checkCarAvailability", () => {
  it("kolizja terminów: zwraca available=false i listę konfliktów", () => {
    const requested = range("2025-03-10", "2025-03-13");
    const existing = [range("2025-03-12", "2025-03-20")];
    const result = checkCarAvailability(requested, existing);
    expect(result.available).toBe(false);
    expect(result.conflicts).toHaveLength(1);
  });

  it("brak kolizji terminów: zwraca available=true i pustą listę", () => {
    const requested = range("2025-03-10", "2025-03-13");
    const existing = [range("2025-03-01", "2025-03-05"), range("2025-03-13", "2025-03-20")];
    const result = checkCarAvailability(requested, existing);
    expect(result.available).toBe(true);
    expect(result.conflicts).toHaveLength(0);
  });

  it("brak istniejących rezerwacji => zawsze dostępne", () => {
    const result = checkCarAvailability(range("2025-03-10", "2025-03-13"), []);
    expect(result.available).toBe(true);
  });
});

describe("schedulingStrategy.findNextAvailable (domena weterynarz/sale)", () => {
  it("znajduje kolejny wolny slot tej samej długości", () => {
    const requested = range("2025-03-10", "2025-03-11"); // 1-day slot
    const existing = [range("2025-03-10", "2025-03-12")]; // busy 10-12
    const next = schedulingStrategy.findNextAvailable(requested, existing, 30);
    expect(next).not.toBeNull();
    // next free slot starts when the conflict ends (2025-03-12)
    expect(next?.startDate.toISOString()).toBe(new Date("2025-03-12").toISOString());
  });
});
