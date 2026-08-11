"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";

const loginSchema = z.object({
  employeeCode: z.string().min(1, "社員IDを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export type LoginState = {
  error?: string;
};

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    employeeCode: formData.get("employeeCode"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "社員IDとパスワードを入力してください" };
  }

  const { employeeCode, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { employeeCode } });
  if (!user || !user.isActive) {
    return { error: "社員IDまたはパスワードが正しくありません" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "社員IDまたはパスワードが正しくありません" };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
