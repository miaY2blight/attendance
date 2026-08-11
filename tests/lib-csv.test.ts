import { describe, expect, it } from "vitest";
import { buildAttendanceCsv } from "@/lib/csv";

function makeRecord(overrides: Partial<Parameters<typeof buildAttendanceCsv>[0][number]> = {}) {
  return {
    user: { employeeCode: "E001", name: "山田太郎" },
    date: new Date(2026, 0, 15),
    clockIn: new Date(2026, 0, 15, 9, 0),
    clockOut: new Date(2026, 0, 15, 18, 0),
    breakStart: new Date(2026, 0, 15, 12, 0),
    breakEnd: new Date(2026, 0, 15, 13, 0),
    status: "NORMAL",
    ...overrides,
  };
}

describe("buildAttendanceCsv", () => {
  it("starts with a UTF-8 BOM for Excel compatibility", () => {
    const csv = buildAttendanceCsv([]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it("includes the Japanese header row", () => {
    const csv = buildAttendanceCsv([]);
    expect(csv).toContain("社員ID,氏名,日付,出勤,退勤,休憩開始,休憩終了,状態");
  });

  it("formats a normal record as a CSV row", () => {
    const csv = buildAttendanceCsv([makeRecord()]);
    expect(csv).toContain("E001,山田太郎,2026/01/15,09:00,18:00,12:00,13:00,通常");
  });

  it("maps the CORRECTED status to Japanese", () => {
    const csv = buildAttendanceCsv([makeRecord({ status: "CORRECTED" })]);
    expect(csv).toContain("修正済み");
  });

  it("shows placeholders for missing clock times", () => {
    const csv = buildAttendanceCsv([
      makeRecord({ clockIn: null, clockOut: null, breakStart: null, breakEnd: null }),
    ]);
    expect(csv).toContain("--:--,--:--,--:--,--:--");
  });

  it("quotes fields containing a comma", () => {
    const csv = buildAttendanceCsv([makeRecord({ user: { employeeCode: "E001", name: "山田,太郎" } })]);
    expect(csv).toContain('"山田,太郎"');
  });

  it("escapes embedded double quotes", () => {
    const csv = buildAttendanceCsv([makeRecord({ user: { employeeCode: "E001", name: '山田"太郎' } })]);
    expect(csv).toContain('"山田""太郎"');
  });

  it("neutralizes values that look like spreadsheet formulas", () => {
    const csv = buildAttendanceCsv([makeRecord({ user: { employeeCode: "E001", name: "=SUM(A1:A9)" } })]);
    expect(csv).toContain("'=SUM(A1:A9)");
    expect(csv).not.toContain(",=SUM(A1:A9)");
  });
});
