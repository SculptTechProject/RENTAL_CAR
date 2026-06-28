import { describe, expect, it } from "vitest";
import {
  calculateRentalPrice,
  type RentalPriceInput,
} from "@/server/domain/strategies/pricing/car-rental-pricing";
import { isErr, isOk } from "@/types";

// Helper: a valid baseline input we tweak per test.
// Dates are ISO strings => parsed as UTC midnight => deterministic in any TZ.
function input(overrides: Partial<RentalPriceInput> = {}): RentalPriceInput {
  return {
    pricePerDay: 100,
    carClass: "ECONOMY",
    startDate: new Date("2025-03-10"), // March => normal season
    endDate: new Date("2025-03-13"), // 3 days
    driverAge: 30,
    withInsurance: false,
    ...overrides,
  };
}

describe("calculateRentalPrice", () => {
  it("cena bazowa: dni × cena za dzień (poza sezonem, kierowca dorosły, bez ubezpieczenia)", () => {
    const res = calculateRentalPrice(input());
    expect(isOk(res)).toBe(true);
    if (!isOk(res)) return;
    expect(res.value.days).toBe(3);
    expect(res.value.basePrice).toBe(300);
    expect(res.value.seasonMultiplier).toBe(1);
    expect(res.value.youngDriverFee).toBe(0);
    expect(res.value.longRentalDiscount).toBe(0);
    expect(res.value.insuranceFee).toBe(0);
    expect(res.value.totalPrice).toBe(300);
  });

  it("dopłata za młodego kierowcę (< 25 lat) = 50 PLN/dzień", () => {
    const res = calculateRentalPrice(input({ driverAge: 22 }));
    expect(isOk(res)).toBe(true);
    if (!isOk(res)) return;
    expect(res.value.youngDriverFee).toBe(150); // 50 * 3
    expect(res.value.totalPrice).toBe(450); // 300 + 150
  });

  it("brak dopłaty dla kierowcy >= 25 lat", () => {
    const res = calculateRentalPrice(input({ driverAge: 25 }));
    expect(isOk(res) && res.value.youngDriverFee).toBe(0);
  });

  it("zniżka za długi wynajem (>= 7 dni) = 10% ceny bazowej", () => {
    const res = calculateRentalPrice(
      input({
        startDate: new Date("2025-03-01"),
        endDate: new Date("2025-03-11"), // 10 days
      }),
    );
    expect(isOk(res)).toBe(true);
    if (!isOk(res)) return;
    expect(res.value.days).toBe(10);
    expect(res.value.basePrice).toBe(1000);
    expect(res.value.longRentalDiscount).toBe(100); // 10% of 1000
    expect(res.value.totalPrice).toBe(900);
  });

  it("ubezpieczenie zależne od klasy auta (SUV ×1.5)", () => {
    const res = calculateRentalPrice(
      input({ carClass: "SUV", withInsurance: true }),
    );
    expect(isOk(res)).toBe(true);
    if (!isOk(res)) return;
    expect(res.value.insuranceFee).toBe(180); // 40 * 1.5 * 3
    expect(res.value.totalPrice).toBe(480); // 300 + 180
  });

  it("sezonowość: lipiec to sezon wysoki (×1.2)", () => {
    const res = calculateRentalPrice(
      input({
        startDate: new Date("2025-07-10"),
        endDate: new Date("2025-07-13"), // 3 days, July
      }),
    );
    expect(isOk(res)).toBe(true);
    if (!isOk(res)) return;
    expect(res.value.seasonMultiplier).toBe(1.2);
    expect(res.value.seasonAdjustment).toBe(60); // 300 * 0.2
    expect(res.value.totalPrice).toBe(360);
  });

  it("błędna data: data końcowa przed początkową => DATE_RANGE_INVALID", () => {
    const res = calculateRentalPrice(
      input({
        startDate: new Date("2025-03-13"),
        endDate: new Date("2025-03-10"),
      }),
    );
    expect(isErr(res)).toBe(true);
    if (!isErr(res)) return;
    expect(res.error.rule).toBe("DATE_RANGE_INVALID");
  });

  it("błędny wiek: kierowca poniżej 18 lat => DRIVER_TOO_YOUNG", () => {
    const res = calculateRentalPrice(input({ driverAge: 17 }));
    expect(isErr(res)).toBe(true);
    if (!isErr(res)) return;
    expect(res.error.rule).toBe("DRIVER_TOO_YOUNG");
  });

  it("pełne rozbicie ceny: wszystkie reguły naraz", () => {
    // PREMIUM, 10 dni w lipcu, kierowca 20 lat, z ubezpieczeniem.
    const res = calculateRentalPrice({
      pricePerDay: 200,
      carClass: "PREMIUM",
      startDate: new Date("2025-07-01"),
      endDate: new Date("2025-07-11"), // 10 days
      driverAge: 20,
      withInsurance: true,
    });
    expect(isOk(res)).toBe(true);
    if (!isOk(res)) return;
    const b = res.value;
    expect(b.days).toBe(10);
    expect(b.basePrice).toBe(2000); // 200 * 10
    expect(b.seasonMultiplier).toBe(1.2);
    expect(b.seasonAdjustment).toBe(400); // 2000 * 0.2
    expect(b.youngDriverFee).toBe(500); // 50 * 10
    expect(b.longRentalDiscount).toBe(200); // 10% of 2000
    expect(b.insuranceFee).toBe(720); // 40 * 1.8 * 10
    // 2000 + 400 + 500 + 720 - 200
    expect(b.totalPrice).toBe(3420);
    // base, season, young-driver, long-rental, insurance => 5 applied rules
    expect(b.appliedRules).toHaveLength(5);
  });
});
