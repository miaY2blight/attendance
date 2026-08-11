"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/adminAuth";

export type EmployeeFormState = {
  error?: string;
};

const employeeCodeSchema = z
  .string()
  .min(1, "社員IDを入力してください")
  .max(50, "社員IDは50文字以内で入力してください")
  .regex(/^[a-zA-Z0-9_-]+$/, "社員IDは半角英数字・ハイフン・アンダースコアのみ使用できます");

const createSchema = z.object({
  employeeCode: employeeCodeSchema,
  name: z.string().min(1, "氏名を入力してください").max(100, "氏名は100文字以内で入力してください"),
  password: z.string().min(4, "パスワードは4文字以上で入力してください"),
  role: z.enum(["EMPLOYEE", "ADMIN"]),
});

export async function createEmployee(
  _prevState: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  await requireAdmin();

  const parsed = createSchema.safeParse({
    employeeCode: formData.get("employeeCode"),
    name: formData.get("name"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }

  const existing = await prisma.user.findUnique({
    where: { employeeCode: parsed.data.employeeCode },
  });
  if (existing) {
    return { error: "この社員IDはすでに使用されています" };
  }

  await prisma.user.create({
    data: {
      employeeCode: parsed.data.employeeCode,
      name: parsed.data.name,
      passwordHash: await hashPassword(parsed.data.password),
      role: parsed.data.role,
    },
  });

  revalidatePath("/admin/employees");
  redirect("/admin/employees");
}

const updateSchema = z.object({
  name: z.string().min(1, "氏名を入力してください").max(100, "氏名は100文字以内で入力してください"),
  role: z.enum(["EMPLOYEE", "ADMIN"]),
  isActive: z.enum(["true", "false"]),
  password: z.string().min(4, "パスワードは4文字以上で入力してください").optional(),
});

export async function updateEmployee(
  userId: string,
  _prevState: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  await requireAdmin();

  const parsed = updateSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    isActive: formData.get("isActive"),
    password: formData.get("password") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return { error: "対象の社員が見つかりません" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      role: parsed.data.role,
      isActive: parsed.data.isActive === "true",
      ...(parsed.data.password ? { passwordHash: await hashPassword(parsed.data.password) } : {}),
    },
  });

  revalidatePath("/admin/employees");
  redirect("/admin/employees");
}
