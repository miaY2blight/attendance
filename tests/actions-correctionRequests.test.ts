import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { submitCorrectionRequest } from "@/actions/correctionRequests";

function isRedirectError(error: unknown): error is Error & { digest: string } {
  if (!(error instanceof Error)) return false;
  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

describe("submitCorrectionRequest - unauthenticated", () => {
  it("redirects to /login", async () => {
    const formData = new FormData();
    let caught: unknown;
    try {
      await submitCorrectionRequest({}, formData);
    } catch (error) {
      caught = error;
    }

    expect(isRedirectError(caught)).toBe(true);
    expect((caught as Error & { digest: string }).digest).toContain("/login");
  });
});

describe("submitCorrectionRequest - authenticated", () => {
  let userId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        employeeCode: "correction-test-1",
        name: "Correction Test",
        passwordHash: await hashPassword("pw"),
        role: "EMPLOYEE",
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.correctionRequest.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  beforeEach(async () => {
    await prisma.correctionRequest.deleteMany({ where: { userId } });
    await createSession(userId);
  });

  it("returns an error when targetDate is missing", async () => {
    const formData = new FormData();
    formData.set("reason", "理由テスト");
    const result = await submitCorrectionRequest({}, formData);
    expect(result.error).toBeTruthy();
  });

  it("returns an error when reason is missing", async () => {
    const formData = new FormData();
    formData.set("targetDate", "2026-01-10");
    const result = await submitCorrectionRequest({}, formData);
    expect(result.error).toBeTruthy();
  });

  it("returns an error when no clock/break time is provided", async () => {
    const formData = new FormData();
    formData.set("targetDate", "2026-01-10");
    formData.set("reason", "打刻を忘れました");
    const result = await submitCorrectionRequest({}, formData);
    expect(result.error).toBe("出勤・退勤・休憩のいずれか1つ以上を入力してください");
  });

  it("rejects a malformed time value", async () => {
    const formData = new FormData();
    formData.set("targetDate", "2026-01-10");
    formData.set("requestedClockIn", "9am");
    formData.set("reason", "打刻を忘れました");
    const result = await submitCorrectionRequest({}, formData);
    expect(result.error).toBeTruthy();
  });

  it("rejects a clockOut earlier than or equal to clockIn", async () => {
    const formData = new FormData();
    formData.set("targetDate", "2026-01-10");
    formData.set("requestedClockIn", "18:00");
    formData.set("requestedClockOut", "09:00");
    formData.set("reason", "打刻を忘れました");
    const result = await submitCorrectionRequest({}, formData);
    expect(result.error).toBe("退勤時刻は出勤時刻より後にしてください");
  });

  it("rejects a breakEnd earlier than or equal to breakStart", async () => {
    const formData = new FormData();
    formData.set("targetDate", "2026-01-10");
    formData.set("requestedBreakStart", "13:00");
    formData.set("requestedBreakEnd", "12:00");
    formData.set("reason", "打刻を忘れました");
    const result = await submitCorrectionRequest({}, formData);
    expect(result.error).toBe("休憩終了は休憩開始より後にしてください");
  });

  it("rejects a reason longer than 500 characters", async () => {
    const formData = new FormData();
    formData.set("targetDate", "2026-01-10");
    formData.set("requestedClockIn", "09:00");
    formData.set("reason", "あ".repeat(501));
    const result = await submitCorrectionRequest({}, formData);
    expect(result.error).toBeTruthy();
  });

  it("creates a request and redirects to /requests on success", async () => {
    const formData = new FormData();
    formData.set("targetDate", "2026-01-10");
    formData.set("requestedClockIn", "09:00");
    formData.set("requestedClockOut", "18:00");
    formData.set("reason", "打刻を忘れました");

    let caught: unknown;
    try {
      await submitCorrectionRequest({}, formData);
    } catch (error) {
      caught = error;
    }

    expect(isRedirectError(caught)).toBe(true);
    expect((caught as Error & { digest: string }).digest).toContain("/requests");

    const created = await prisma.correctionRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    expect(created?.reason).toBe("打刻を忘れました");
    expect(created?.status).toBe("PENDING");
    expect(created?.requestedClockIn?.getHours()).toBe(9);
    expect(created?.requestedClockOut?.getHours()).toBe(18);
  });
});
