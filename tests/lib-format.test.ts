import { describe, expect, it } from "vitest";
import { formatDate, formatDateWithWeekday, formatTime } from "@/lib/format";

describe("formatTime", () => {
  it("returns placeholder for null/undefined", () => {
    expect(formatTime(null)).toBe("--:--");
    expect(formatTime(undefined)).toBe("--:--");
  });

  it("formats a date as HH:MM", () => {
    const date = new Date(2026, 0, 15, 9, 5);
    expect(formatTime(date)).toBe("09:05");
  });
});

describe("formatDate / formatDateWithWeekday", () => {
  it("formats a date as YYYY/MM/DD", () => {
    const date = new Date(2026, 0, 15);
    expect(formatDate(date)).toBe("2026/01/15");
  });

  it("appends the Japanese weekday", () => {
    const date = new Date(2026, 0, 15); // Thursday
    expect(formatDateWithWeekday(date)).toBe("2026/01/15(木)");
  });
});
