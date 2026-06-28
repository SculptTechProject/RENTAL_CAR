import { describe, expect, it } from "vitest";
import {
  assignSmallestAvailableLocker,
  type Locker,
} from "@/server/domain/strategies/assignment/locker-assignment";
import { isErr, isOk } from "@/types";

// Demonstrates that an ALTERNATIVE domain (Paczkomaty) plugs into the same
// Result-based strategy contract as the car-rental pricing algorithm.
const lockers: Locker[] = [
  { id: "L1", size: "SMALL", occupied: true },
  { id: "L2", size: "MEDIUM", occupied: false },
  { id: "L3", size: "LARGE", occupied: false },
];

describe("assignSmallestAvailableLocker", () => {
  it("przydziela najmniejszą wolną skrytkę mieszczącą paczkę", () => {
    const res = assignSmallestAvailableLocker({ size: "SMALL" }, lockers);
    expect(isOk(res)).toBe(true);
    if (!isOk(res)) return;
    expect(res.value.id).toBe("L2"); // smallest free that fits a SMALL parcel
  });

  it("nie zmieści dużej paczki w samych małych skrytkach", () => {
    const onlySmall: Locker[] = [{ id: "S", size: "SMALL", occupied: false }];
    const res = assignSmallestAvailableLocker({ size: "LARGE" }, onlySmall);
    expect(isErr(res)).toBe(true);
    if (!isErr(res)) return;
    expect(res.error.rule).toBe("NO_LOCKER_AVAILABLE");
  });
});
