import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { login, logout } from "@/actions/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";
import { cookieStore } from "./setup";

function isRedirectError(error: unknown): error is Error & { digest: string } {
  if (!(error instanceof Error)) return false;
  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

describe("login action", () => {
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        employeeCode: "login-test",
        name: "Login Test",
        passwordHash: await hashPassword("correct-password"),
        role: "EMPLOYEE",
      },
    });
  });

  afterAll(async () => {
    const user = await prisma.user.findUnique({ where: { employeeCode: "login-test" } });
    if (user) {
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  });

  it("returns a validation error when fields are missing", async () => {
    const formData = new FormData();
    const result = await login({}, formData);
    expect(result.error).toBeTruthy();
    expect(cookieStore.has(SESSION_COOKIE_NAME)).toBe(false);
  });

  it("returns an error for a wrong password", async () => {
    const formData = new FormData();
    formData.set("employeeCode", "login-test");
    formData.set("password", "wrong-password");

    const result = await login({}, formData);

    expect(result.error).toBeTruthy();
    expect(cookieStore.has(SESSION_COOKIE_NAME)).toBe(false);
  });

  it("returns an error for an unknown employee code", async () => {
    const formData = new FormData();
    formData.set("employeeCode", "does-not-exist");
    formData.set("password", "whatever");

    const result = await login({}, formData);
    expect(result.error).toBeTruthy();
  });

  it("creates a session and redirects to / on success", async () => {
    const formData = new FormData();
    formData.set("employeeCode", "login-test");
    formData.set("password", "correct-password");

    let caught: unknown;
    try {
      await login({}, formData);
    } catch (error) {
      caught = error;
    }

    expect(isRedirectError(caught)).toBe(true);
    expect(cookieStore.has(SESSION_COOKIE_NAME)).toBe(true);
  });
});

describe("logout action", () => {
  it("destroys the session and redirects to /login", async () => {
    cookieStore.set(SESSION_COOKIE_NAME, { value: "dummy-session-id" });

    let caught: unknown;
    try {
      await logout();
    } catch (error) {
      caught = error;
    }

    expect(isRedirectError(caught)).toBe(true);
    expect(cookieStore.has(SESSION_COOKIE_NAME)).toBe(false);
  });
});
