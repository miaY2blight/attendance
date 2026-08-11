import "server-only";
import { prisma } from "@/lib/prisma";

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getTodayRecord(userId: string) {
  const date = startOfDay(new Date());
  return prisma.attendanceRecord.findUnique({
    where: { userId_date: { userId, date } },
  });
}

export async function clockIn(userId: string) {
  const date = startOfDay(new Date());
  const existing = await prisma.attendanceRecord.findUnique({
    where: { userId_date: { userId, date } },
  });

  if (existing?.clockIn) {
    throw new Error("すでに出勤打刻されています");
  }

  if (existing) {
    return prisma.attendanceRecord.update({
      where: { id: existing.id },
      data: { clockIn: new Date() },
    });
  }

  return prisma.attendanceRecord.create({
    data: { userId, date, clockIn: new Date() },
  });
}

export async function startBreak(userId: string) {
  const record = await getTodayRecord(userId);
  if (!record?.clockIn) throw new Error("先に出勤打刻をしてください");
  if (record.clockOut) throw new Error("退勤済みです");
  if (record.breakStart) throw new Error("すでに休憩を開始しています");

  return prisma.attendanceRecord.update({
    where: { id: record.id },
    data: { breakStart: new Date() },
  });
}

export async function endBreak(userId: string) {
  const record = await getTodayRecord(userId);
  if (!record?.breakStart) throw new Error("休憩を開始していません");
  if (record.breakEnd) throw new Error("すでに休憩を終了しています");

  return prisma.attendanceRecord.update({
    where: { id: record.id },
    data: { breakEnd: new Date() },
  });
}

export async function clockOut(userId: string) {
  const record = await getTodayRecord(userId);
  if (!record?.clockIn) throw new Error("先に出勤打刻をしてください");
  if (record.clockOut) throw new Error("すでに退勤打刻されています");
  if (record.breakStart && !record.breakEnd) {
    throw new Error("休憩を終了してから退勤してください");
  }

  return prisma.attendanceRecord.update({
    where: { id: record.id },
    data: { clockOut: new Date() },
  });
}

export function getMonthlyRecords(userId: string, year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  return prisma.attendanceRecord.findMany({
    where: { userId, date: { gte: start, lt: end } },
    orderBy: { date: "asc" },
  });
}

export function getMonthlyRecordsForAdmin(userId: string | null, year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  return prisma.attendanceRecord.findMany({
    where: {
      date: { gte: start, lt: end },
      ...(userId ? { userId } : {}),
    },
    include: { user: true },
    orderBy: [{ date: "asc" }, { user: { employeeCode: "asc" } }],
  });
}
