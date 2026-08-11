import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { createEmployee, updateEmployee } from "@/actions/employees";

function isRedirectError(error: unknown): error is Error & { digest: string } {
  if (!(error instanceof Error)) return false;
  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

describe("employee actions - access control", () => {
  it("createEmployee throws when not authenticated", async () => {
    const formData = new FormData();
    await expect(createEmployee({}, formData)).rejects.toThrow("管理者権限が必要です");
  });

  it("createEmployee throws when authenticated as a non-admin", async () => {
    const employee = await prisma.user.create({
      data: {
        employeeCode: "non-admin-1",
        name: "Non Admin",
        passwordHash: await hashPassword("pw"),
        role: "EMPLOYEE",
      },
    });
    await createSession(employee.id);

    const formData = new FormData();
    await expect(createEmployee({}, formData)).rejects.toThrow("管理者権限が必要です");

    await prisma.session.deleteMany({ where: { userId: employee.id } });
    await prisma.user.delete({ where: { id: employee.id } });
  });
});

describe("employee actions - as admin", () => {
  let adminId: string;

  beforeAll(async () => {
    const admin = await prisma.user.create({
      data: {
        employeeCode: "admin-actions-test",
        name: "Admin Test",
        passwordHash: await hashPassword("pw"),
        role: "ADMIN",
      },
    });
    adminId = admin.id;
  });

  afterAll(async () => {
    await prisma.session.deleteMany({ where: { userId: adminId } });
    await prisma.user.delete({ where: { id: adminId } });
  });

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { employeeCode: { startsWith: "created-emp-" } } });
  });

  it("returns a validation error for an empty employeeCode", async () => {
    await createSession(adminId);
    const formData = new FormData();
    formData.set("employeeCode", "");
    formData.set("name", "Test");
    formData.set("password", "password123");
    formData.set("role", "EMPLOYEE");

    const result = await createEmployee({}, formData);
    expect(result.error).toBeTruthy();
  });

  it("returns an error for a too-short password", async () => {
    await createSession(adminId);
    const formData = new FormData();
    formData.set("employeeCode", "created-emp-short-pw");
    formData.set("name", "Test");
    formData.set("password", "abc");
    formData.set("role", "EMPLOYEE");

    const result = await createEmployee({}, formData);
    expect(result.error).toBeTruthy();
  });

  it("rejects an employeeCode with disallowed characters", async () => {
    await createSession(adminId);
    const formData = new FormData();
    formData.set("employeeCode", "emp 001!");
    formData.set("name", "Test");
    formData.set("password", "password123");
    formData.set("role", "EMPLOYEE");

    const result = await createEmployee({}, formData);
    expect(result.error).toBeTruthy();
  });

  it("creates a new employee and redirects on success", async () => {
    await createSession(adminId);
    const formData = new FormData();
    formData.set("employeeCode", "created-emp-1");
    formData.set("name", "新入社員");
    formData.set("password", "password123");
    formData.set("role", "EMPLOYEE");

    let caught: unknown;
    try {
      await createEmployee({}, formData);
    } catch (error) {
      caught = error;
    }
    expect(isRedirectError(caught)).toBe(true);

    const created = await prisma.user.findUnique({ where: { employeeCode: "created-emp-1" } });
    expect(created).not.toBeNull();
    expect(created?.name).toBe("新入社員");
    expect(created?.role).toBe("EMPLOYEE");
    expect(await verifyPassword("password123", created!.passwordHash)).toBe(true);
  });

  it("rejects a duplicate employeeCode", async () => {
    await createSession(adminId);
    const formData1 = new FormData();
    formData1.set("employeeCode", "created-emp-dup");
    formData1.set("name", "One");
    formData1.set("password", "password123");
    formData1.set("role", "EMPLOYEE");

    try {
      await createEmployee({}, formData1);
    } catch {
      // expected redirect
    }

    await createSession(adminId);
    const formData2 = new FormData();
    formData2.set("employeeCode", "created-emp-dup");
    formData2.set("name", "Two");
    formData2.set("password", "password123");
    formData2.set("role", "EMPLOYEE");

    const result = await createEmployee({}, formData2);
    expect(result.error).toBe("この社員IDはすでに使用されています");
  });

  it("updates an employee's name, role, and active status", async () => {
    const target = await prisma.user.create({
      data: {
        employeeCode: "created-emp-update",
        name: "旧姓",
        passwordHash: await hashPassword("original-pw"),
        role: "EMPLOYEE",
      },
    });

    await createSession(adminId);
    const formData = new FormData();
    formData.set("name", "新姓");
    formData.set("role", "ADMIN");
    formData.set("isActive", "false");

    let caught: unknown;
    try {
      await updateEmployee(target.id, {}, formData);
    } catch (error) {
      caught = error;
    }
    expect(isRedirectError(caught)).toBe(true);

    const updated = await prisma.user.findUnique({ where: { id: target.id } });
    expect(updated?.name).toBe("新姓");
    expect(updated?.role).toBe("ADMIN");
    expect(updated?.isActive).toBe(false);
    expect(await verifyPassword("original-pw", updated!.passwordHash)).toBe(true);
  });

  it("updates the password only when a new one is provided", async () => {
    const target = await prisma.user.create({
      data: {
        employeeCode: "created-emp-pwreset",
        name: "対象者",
        passwordHash: await hashPassword("original-pw"),
        role: "EMPLOYEE",
      },
    });

    await createSession(adminId);
    const formData = new FormData();
    formData.set("name", "対象者");
    formData.set("role", "EMPLOYEE");
    formData.set("isActive", "true");
    formData.set("password", "brand-new-pw");

    try {
      await updateEmployee(target.id, {}, formData);
    } catch {
      // expected redirect
    }

    const updated = await prisma.user.findUnique({ where: { id: target.id } });
    expect(await verifyPassword("brand-new-pw", updated!.passwordHash)).toBe(true);
    expect(await verifyPassword("original-pw", updated!.passwordHash)).toBe(false);
  });

  it("returns an error when the target employee does not exist", async () => {
    await createSession(adminId);
    const formData = new FormData();
    formData.set("name", "誰か");
    formData.set("role", "EMPLOYEE");
    formData.set("isActive", "true");

    const result = await updateEmployee("nonexistent-id", {}, formData);
    expect(result.error).toBe("対象の社員が見つかりません");
  });

  it("returns a validation error when the updated name is empty", async () => {
    const target = await prisma.user.create({
      data: {
        employeeCode: "created-emp-badupdate",
        name: "対象者",
        passwordHash: await hashPassword("pw"),
        role: "EMPLOYEE",
      },
    });

    await createSession(adminId);
    const formData = new FormData();
    formData.set("name", "");
    formData.set("role", "EMPLOYEE");
    formData.set("isActive", "true");

    const result = await updateEmployee(target.id, {}, formData);
    expect(result.error).toBeTruthy();
  });
});
