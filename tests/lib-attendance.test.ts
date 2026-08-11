import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import * as attendance from "@/lib/attendance";

describe("attendance state machine", () => {
  let userId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        employeeCode: "attendance-test-1",
        name: "Attendance Test",
        passwordHash: "x",
        role: "EMPLOYEE",
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.attendanceRecord.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  beforeEach(async () => {
    await prisma.attendanceRecord.deleteMany({ where: { userId } });
  });

  it("clockIn creates today's record", async () => {
    const record = await attendance.clockIn(userId);
    expect(record.clockIn).not.toBeNull();
    expect(record.clockOut).toBeNull();
  });

  it("clockIn twice throws", async () => {
    await attendance.clockIn(userId);
    await expect(attendance.clockIn(userId)).rejects.toThrow("すでに出勤打刻されています");
  });

  it("startBreak before clockIn throws", async () => {
    await expect(attendance.startBreak(userId)).rejects.toThrow("先に出勤打刻をしてください");
  });

  it("startBreak after clockIn succeeds, twice throws", async () => {
    await attendance.clockIn(userId);
    const record = await attendance.startBreak(userId);
    expect(record.breakStart).not.toBeNull();
    await expect(attendance.startBreak(userId)).rejects.toThrow("すでに休憩を開始しています");
  });

  it("endBreak before startBreak throws", async () => {
    await attendance.clockIn(userId);
    await expect(attendance.endBreak(userId)).rejects.toThrow("休憩を開始していません");
  });

  it("endBreak after startBreak succeeds, twice throws", async () => {
    await attendance.clockIn(userId);
    await attendance.startBreak(userId);
    const record = await attendance.endBreak(userId);
    expect(record.breakEnd).not.toBeNull();
    await expect(attendance.endBreak(userId)).rejects.toThrow("すでに休憩を終了しています");
  });

  it("clockOut before clockIn throws", async () => {
    await expect(attendance.clockOut(userId)).rejects.toThrow("先に出勤打刻をしてください");
  });

  it("clockOut while on break throws", async () => {
    await attendance.clockIn(userId);
    await attendance.startBreak(userId);
    await expect(attendance.clockOut(userId)).rejects.toThrow("休憩を終了してから退勤してください");
  });

  it("clockOut after break ends succeeds, twice throws", async () => {
    await attendance.clockIn(userId);
    await attendance.startBreak(userId);
    await attendance.endBreak(userId);
    const record = await attendance.clockOut(userId);
    expect(record.clockOut).not.toBeNull();
    await expect(attendance.clockOut(userId)).rejects.toThrow("すでに退勤打刻されています");
  });

  it("clockOut without taking a break is allowed", async () => {
    await attendance.clockIn(userId);
    const record = await attendance.clockOut(userId);
    expect(record.clockOut).not.toBeNull();
  });
});

describe("getMonthlyRecords", () => {
  let userId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        employeeCode: "attendance-test-2",
        name: "Monthly Test",
        passwordHash: "x",
        role: "EMPLOYEE",
      },
    });
    userId = user.id;

    await prisma.attendanceRecord.createMany({
      data: [
        { userId, date: new Date(2026, 0, 15), clockIn: new Date(2026, 0, 15, 9) },
        { userId, date: new Date(2026, 0, 20), clockIn: new Date(2026, 0, 20, 9) },
        { userId, date: new Date(2026, 1, 1), clockIn: new Date(2026, 1, 1, 9) },
      ],
    });
  });

  afterAll(async () => {
    await prisma.attendanceRecord.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  it("returns only records within the requested month", async () => {
    const records = await attendance.getMonthlyRecords(userId, 2026, 1);
    expect(records).toHaveLength(2);
    expect(records.every((r) => r.date.getMonth() === 0)).toBe(true);
  });

  it("returns an empty list for a month with no records", async () => {
    const records = await attendance.getMonthlyRecords(userId, 2026, 5);
    expect(records).toHaveLength(0);
  });
});

describe("getMonthlyRecordsForAdmin", () => {
  let userAId: string;
  let userBId: string;

  beforeAll(async () => {
    const userA = await prisma.user.create({
      data: { employeeCode: "admin-report-a", name: "A", passwordHash: "x", role: "EMPLOYEE" },
    });
    const userB = await prisma.user.create({
      data: { employeeCode: "admin-report-b", name: "B", passwordHash: "x", role: "EMPLOYEE" },
    });
    userAId = userA.id;
    userBId = userB.id;

    await prisma.attendanceRecord.createMany({
      data: [
        { userId: userAId, date: new Date(2026, 3, 5), clockIn: new Date(2026, 3, 5, 9) },
        { userId: userBId, date: new Date(2026, 3, 5), clockIn: new Date(2026, 3, 5, 10) },
        { userId: userAId, date: new Date(2026, 4, 1), clockIn: new Date(2026, 4, 1, 9) },
      ],
    });
  });

  afterAll(async () => {
    await prisma.attendanceRecord.deleteMany({ where: { userId: { in: [userAId, userBId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userAId, userBId] } } });
  });

  it("returns records for all employees when userId is null", async () => {
    const records = await attendance.getMonthlyRecordsForAdmin(null, 2026, 4);
    expect(records).toHaveLength(2);
    expect(records.map((r) => r.userId).sort()).toEqual([userAId, userBId].sort());
  });

  it("filters to a single employee when userId is provided", async () => {
    const records = await attendance.getMonthlyRecordsForAdmin(userAId, 2026, 4);
    expect(records).toHaveLength(1);
    expect(records[0].userId).toBe(userAId);
  });

  it("includes the related user in each record", async () => {
    const records = await attendance.getMonthlyRecordsForAdmin(userAId, 2026, 4);
    expect(records[0].user.employeeCode).toBe("admin-report-a");
  });
});
