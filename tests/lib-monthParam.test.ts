import { describe, expect, it } from "vitest";
import { formatYearMonth, parseYearMonth, shiftMonth } from "@/lib/monthParam";

describe("parseYearMonth", () => {
  it("parses a valid YYYY-MM string", () => {
    expect(parseYearMonth("2026-03")).toEqual({ year: 2026, month: 3 });
  });

  it("falls back to the current month for undefined input", () => {
    const now = new Date();
    expect(parseYearMonth(undefined)).toEqual({ year: now.getFullYear(), month: now.getMonth() + 1 });
  });

  it("falls back to the current month for malformed input", () => {
    const now = new Date();
    expect(parseYearMonth("not-a-month")).toEqual({ year: now.getFullYear(), month: now.getMonth() + 1 });
  });
});

describe("shiftMonth", () => {
  it("moves to the previous month", () => {
    expect(shiftMonth(2026, 3, -1)).toBe("2026-02");
  });

  it("moves to the next month", () => {
    expect(shiftMonth(2026, 3, 1)).toBe("2026-04");
  });

  it("rolls over across a year boundary", () => {
    expect(shiftMonth(2026, 1, -1)).toBe("2025-12");
    expect(shiftMonth(2026, 12, 1)).toBe("2027-01");
  });
});

describe("formatYearMonth", () => {
  it("zero-pads the month", () => {
    expect(formatYearMonth(2026, 3)).toBe("2026-03");
    expect(formatYearMonth(2026, 11)).toBe("2026-11");
  });
});
