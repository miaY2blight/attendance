"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import * as attendance from "@/lib/attendance";

export type AttendanceActionState = {
  error?: string;
};

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("認証が必要です");
  return user;
}

async function runAction(
  fn: (userId: string) => Promise<unknown>,
): Promise<AttendanceActionState> {
  try {
    const user = await requireUser();
    await fn(user.id);
    revalidatePath("/");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "エラーが発生しました" };
  }
}

export async function clockIn(_prevState: AttendanceActionState): Promise<AttendanceActionState> {
  return runAction((userId) => attendance.clockIn(userId));
}

export async function clockOut(_prevState: AttendanceActionState): Promise<AttendanceActionState> {
  return runAction((userId) => attendance.clockOut(userId));
}

export async function startBreak(_prevState: AttendanceActionState): Promise<AttendanceActionState> {
  return runAction((userId) => attendance.startBreak(userId));
}

export async function endBreak(_prevState: AttendanceActionState): Promise<AttendanceActionState> {
  return runAction((userId) => attendance.endBreak(userId));
}
