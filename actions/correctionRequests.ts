"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requireAdmin } from "@/lib/adminAuth";
import { startOfDay } from "@/lib/attendance";

const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "時刻はHH:MM形式で入力してください")
  .optional()
  .or(z.literal(""));

const correctionRequestSchema = z
  .object({
    targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "対象日を入力してください"),
    requestedClockIn: timeSchema,
    requestedClockOut: timeSchema,
    requestedBreakStart: timeSchema,
    requestedBreakEnd: timeSchema,
    reason: z.string().min(1, "理由を入力してください").max(500, "理由は500文字以内で入力してください"),
  })
  .superRefine((data, ctx) => {
    if (data.requestedClockIn && data.requestedClockOut && data.requestedClockIn >= data.requestedClockOut) {
      ctx.addIssue({
        code: "custom",
        message: "退勤時刻は出勤時刻より後にしてください",
        path: ["requestedClockOut"],
      });
    }
    if (
      data.requestedBreakStart &&
      data.requestedBreakEnd &&
      data.requestedBreakStart >= data.requestedBreakEnd
    ) {
      ctx.addIssue({
        code: "custom",
        message: "休憩終了は休憩開始より後にしてください",
        path: ["requestedBreakEnd"],
      });
    }
  });

export type CorrectionRequestState = {
  error?: string;
};

function combineDateTime(targetDate: string, time: string | undefined): Date | null {
  if (!time) return null;
  return new Date(`${targetDate}T${time}:00`);
}

export async function submitCorrectionRequest(
  _prevState: CorrectionRequestState,
  formData: FormData,
): Promise<CorrectionRequestState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const parsed = correctionRequestSchema.safeParse({
    targetDate: formData.get("targetDate"),
    requestedClockIn: formData.get("requestedClockIn") ?? "",
    requestedClockOut: formData.get("requestedClockOut") ?? "",
    requestedBreakStart: formData.get("requestedBreakStart") ?? "",
    requestedBreakEnd: formData.get("requestedBreakEnd") ?? "",
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }

  const { targetDate, requestedClockIn, requestedClockOut, requestedBreakStart, requestedBreakEnd, reason } =
    parsed.data;

  if (!requestedClockIn && !requestedClockOut && !requestedBreakStart && !requestedBreakEnd) {
    return { error: "出勤・退勤・休憩のいずれか1つ以上を入力してください" };
  }

  await prisma.correctionRequest.create({
    data: {
      userId: user.id,
      targetDate: new Date(`${targetDate}T00:00:00`),
      requestedClockIn: combineDateTime(targetDate, requestedClockIn),
      requestedClockOut: combineDateTime(targetDate, requestedClockOut),
      requestedBreakStart: combineDateTime(targetDate, requestedBreakStart),
      requestedBreakEnd: combineDateTime(targetDate, requestedBreakEnd),
      reason,
    },
  });

  revalidatePath("/requests");
  redirect("/requests");
}

export type ApprovalState = {
  error?: string;
};

export async function approveCorrectionRequest(
  requestId: string,
  _prevState: ApprovalState,
  formData: FormData,
): Promise<ApprovalState> {
  const admin = await requireAdmin();
  const comment = (formData.get("comment") as string) || null;

  const request = await prisma.correctionRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== "PENDING") {
    return { error: "対象の申請が見つからないか、すでに処理済みです" };
  }

  const date = startOfDay(request.targetDate);

  await prisma.$transaction([
    prisma.attendanceRecord.upsert({
      where: { userId_date: { userId: request.userId, date } },
      create: {
        userId: request.userId,
        date,
        clockIn: request.requestedClockIn,
        clockOut: request.requestedClockOut,
        breakStart: request.requestedBreakStart,
        breakEnd: request.requestedBreakEnd,
        status: "CORRECTED",
      },
      update: {
        ...(request.requestedClockIn ? { clockIn: request.requestedClockIn } : {}),
        ...(request.requestedClockOut ? { clockOut: request.requestedClockOut } : {}),
        ...(request.requestedBreakStart ? { breakStart: request.requestedBreakStart } : {}),
        ...(request.requestedBreakEnd ? { breakEnd: request.requestedBreakEnd } : {}),
        status: "CORRECTED",
      },
    }),
    prisma.correctionRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        approverId: admin.id,
        approverComment: comment,
        resolvedAt: new Date(),
      },
    }),
  ]);

  revalidatePath("/admin/requests");
  revalidatePath("/requests");
  return {};
}

export async function rejectCorrectionRequest(
  requestId: string,
  _prevState: ApprovalState,
  formData: FormData,
): Promise<ApprovalState> {
  const admin = await requireAdmin();
  const comment = (formData.get("comment") as string) || null;

  const request = await prisma.correctionRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== "PENDING") {
    return { error: "対象の申請が見つからないか、すでに処理済みです" };
  }

  await prisma.correctionRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      approverId: admin.id,
      approverComment: comment,
      resolvedAt: new Date(),
    },
  });

  revalidatePath("/admin/requests");
  revalidatePath("/requests");
  return {};
}
