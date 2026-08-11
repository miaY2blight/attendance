import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { clockIn, clockOut, startBreak, endBreak } from "@/actions/attendance";

describe("attendance actions - unauthenticated", () => {
  it("returns an auth error when not logged in", async () => {
    const result = await clockIn({});
    expect(result.error).toBe("認証が必要です");
  });
});

describe("attendance actions - authenticated", () => {
  let userId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        employeeCode: "action-attendance-1",
        name: "Action Attendance Test",
        passwordHash: await hashPassword("pw"),
        role: "EMPLOYEE",
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.attendanceRecord.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  beforeEach(async () => {
    await prisma.attendanceRecord.deleteMany({ where: { userId } });
    await createSession(userId);
  });

  it("clocks in successfully", async () => {
    const result = await clockIn({});
    expect(result.error).toBeUndefined();

    const record = await prisma.attendanceRecord.findFirst({ where: { userId } });
    expect(record?.clockIn).not.toBeNull();
  });

  it("returns a business-rule error on double clock-in", async () => {
    await clockIn({});
    const result = await clockIn({});
    expect(result.error).toBe("すでに出勤打刻されています");
  });

  it("runs the full clock-in -> break -> clock-out cycle", async () => {
    expect((await clockIn({})).error).toBeUndefined();
    expect((await startBreak({})).error).toBeUndefined();
    expect((await endBreak({})).error).toBeUndefined();
    expect((await clockOut({})).error).toBeUndefined();

    const record = await prisma.attendanceRecord.findFirst({ where: { userId } });
    expect(record?.clockIn).not.toBeNull();
    expect(record?.breakStart).not.toBeNull();
    expect(record?.breakEnd).not.toBeNull();
    expect(record?.clockOut).not.toBeNull();
  });

  it("returns an error when trying to clock out during a break", async () => {
    await clockIn({});
    await startBreak({});
    const result = await clockOut({});
    expect(result.error).toBe("休憩を終了してから退勤してください");
  });
});
