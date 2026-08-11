import "server-only";
import { formatDate, formatTime } from "@/lib/format";

type AttendanceRecordWithUser = {
  user: { employeeCode: string; name: string };
  date: Date;
  clockIn: Date | null;
  clockOut: Date | null;
  breakStart: Date | null;
  breakEnd: Date | null;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  NORMAL: "通常",
  CORRECTED: "修正済み",
  MISSING: "未打刻",
};

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Prefix admin-entered free text that Excel/Sheets would interpret as a formula.
function neutralizeFormula(raw: string): string {
  return /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
}

export function buildAttendanceCsv(records: AttendanceRecordWithUser[]): string {
  const header = ["社員ID", "氏名", "日付", "出勤", "退勤", "休憩開始", "休憩終了", "状態"];
  const rows = records.map((record) => [
    neutralizeFormula(record.user.employeeCode),
    neutralizeFormula(record.user.name),
    formatDate(record.date),
    formatTime(record.clockIn),
    formatTime(record.clockOut),
    formatTime(record.breakStart),
    formatTime(record.breakEnd),
    STATUS_LABEL[record.status] ?? record.status,
  ]);

  const lines = [header, ...rows].map((cols) => cols.map(escapeCsvField).join(","));
  return `﻿${lines.join("\r\n")}\r\n`;
}
