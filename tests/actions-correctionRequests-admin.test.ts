import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { startOfDay } from "@/lib/attendance";
import { approveCorrectionRequest, rejectCorrectionRequest } from "@/actions/correctionRequests";

describe("correction request approval - access control", () => {
  it("approveCorrectionRequest throws when not authenticated", async () => {
    const formData = new FormData();
    await expect(approveCorrectionRequest("nonexistent", {}, formData)).rejects.toThrow(
      "管理者権限が必要です",
    );
  });

  it("approveCorrectionRequest throws for a non-admin employee", async () => {
    const employee = await prisma.user.create({
      data: {
        employeeCode: "approval-non-admin",
        name: "Non Admin",
        passwordHash: await hashPassword("pw"),
        role: "EMPLOYEE",
      },
    });
    await createSession(employee.id);

    const formData = new FormData();
    await expect(approveCorrectionRequest("nonexistent", {}, formData)).rejects.toThrow(
      "管理者権限が必要です",
    );

    await prisma.session.deleteMany({ where: { userId: employee.id } });
    await prisma.user.delete({ where: { id: employee.id } });
  });
});

describe("correction request approval - as admin", () => {
  let adminId: string;
  let employeeId: string;

  beforeAll(async () => {
    const admin = await prisma.user.create({
      data: {
        employeeCode: "approval-admin",
        name: "Approval Admin",
        passwordHash: await hashPassword("pw"),
        role: "ADMIN",
      },
    });
    adminId = admin.id;

    const employee = await prisma.user.create({
      data: {
        employeeCode: "approval-target-emp",
        name: "Target Employee",
        passwordHash: await hashPassword("pw"),
        role: "EMPLOYEE",
      },
    });
    employeeId = employee.id;
  });

  afterAll(async () => {
    await prisma.session.deleteMany({ where: { userId: { in: [adminId, employeeId] } } });
    await prisma.correctionRequest.deleteMany({ where: { userId: employeeId } });
    await prisma.attendanceRecord.deleteMany({ where: { userId: employeeId } });
    await prisma.user.deleteMany({ where: { id: { in: [adminId, employeeId] } } });
  });

  afterEach(async () => {
    await prisma.correctionRequest.deleteMany({ where: { userId: employeeId } });
    await prisma.attendanceRecord.deleteMany({ where: { userId: employeeId } });
  });

  it("returns an error for a nonexistent request", async () => {
    await createSession(adminId);
    const formData = new FormData();
    const result = await approveCorrectionRequest("nonexistent-id", {}, formData);
    expect(result.error).toBeTruthy();
  });

  it("approves a request, creates the attendance record, and marks it CORRECTED", async () => {
    const targetDate = new Date(2026, 2, 10);
    const request = await prisma.correctionRequest.create({
      data: {
        userId: employeeId,
        targetDate,
        requestedClockIn: new Date(2026, 2, 10, 9, 0),
        requestedClockOut: new Date(2026, 2, 10, 18, 0),
        reason: "打刻を忘れました",
      },
    });

    await createSession(adminId);
    const formData = new FormData();
    formData.set("comment", "確認しました");

    const result = await approveCorrectionRequest(request.id, {}, formData);
    expect(result.error).toBeUndefined();

    const updatedRequest = await prisma.correctionRequest.findUnique({ where: { id: request.id } });
    expect(updatedRequest?.status).toBe("APPROVED");
    expect(updatedRequest?.approverId).toBe(adminId);
    expect(updatedRequest?.approverComment).toBe("確認しました");
    expect(updatedRequest?.resolvedAt).not.toBeNull();

    const record = await prisma.attendanceRecord.findUnique({
      where: { userId_date: { userId: employeeId, date: startOfDay(targetDate) } },
    });
    expect(record?.status).toBe("CORRECTED");
    expect(record?.clockIn).not.toBeNull();
    expect(record?.clockOut).not.toBeNull();
  });

  it("merges into an existing attendance record without clobbering untouched fields", async () => {
    const targetDate = new Date(2026, 2, 11);
    const date = startOfDay(targetDate);

    await prisma.attendanceRecord.create({
      data: {
        userId: employeeId,
        date,
        clockIn: new Date(2026, 2, 11, 9, 0),
        clockOut: new Date(2026, 2, 11, 18, 0),
        status: "NORMAL",
      },
    });

    const request = await prisma.correctionRequest.create({
      data: {
        userId: employeeId,
        targetDate,
        requestedBreakStart: new Date(2026, 2, 11, 12, 0),
        requestedBreakEnd: new Date(2026, 2, 11, 13, 0),
        reason: "休憩の打刻漏れ",
      },
    });

    await createSession(adminId);
    const formData = new FormData();
    await approveCorrectionRequest(request.id, {}, formData);

    const record = await prisma.attendanceRecord.findUnique({ where: { userId_date: { userId: employeeId, date } } });
    expect(record?.status).toBe("CORRECTED");
    expect(record?.clockIn?.getHours()).toBe(9);
    expect(record?.clockOut?.getHours()).toBe(18);
    expect(record?.breakStart?.getHours()).toBe(12);
    expect(record?.breakEnd?.getHours()).toBe(13);
  });

  it("returns an error when approving an already-processed request", async () => {
    const request = await prisma.correctionRequest.create({
      data: {
        userId: employeeId,
        targetDate: new Date(2026, 2, 12),
        requestedClockIn: new Date(2026, 2, 12, 9, 0),
        reason: "打刻忘れ",
        status: "REJECTED",
      },
    });

    await createSession(adminId);
    const formData = new FormData();
    const result = await approveCorrectionRequest(request.id, {}, formData);
    expect(result.error).toBeTruthy();
  });

  it("rejects a request without touching the attendance record", async () => {
    const request = await prisma.correctionRequest.create({
      data: {
        userId: employeeId,
        targetDate: new Date(2026, 2, 13),
        requestedClockIn: new Date(2026, 2, 13, 9, 0),
        reason: "打刻忘れ",
      },
    });

    await createSession(adminId);
    const formData = new FormData();
    formData.set("comment", "理由不十分");

    const result = await rejectCorrectionRequest(request.id, {}, formData);
    expect(result.error).toBeUndefined();

    const updatedRequest = await prisma.correctionRequest.findUnique({ where: { id: request.id } });
    expect(updatedRequest?.status).toBe("REJECTED");
    expect(updatedRequest?.approverComment).toBe("理由不十分");

    const record = await prisma.attendanceRecord.findUnique({
      where: { userId_date: { userId: employeeId, date: startOfDay(request.targetDate) } },
    });
    expect(record).toBeNull();
  });
});
