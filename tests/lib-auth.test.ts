import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";
import { cookieStore } from "./setup";

describe("password hashing", () => {
  it("hashes and verifies a password correctly", async () => {
    const hash = await hashPassword("secret123");
    expect(await verifyPassword("secret123", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });
});

describe("session lifecycle", () => {
  let userId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        employeeCode: "test-emp-1",
        name: "Test User",
        passwordHash: await hashPassword("pw"),
        role: "EMPLOYEE",
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  it("returns null when no session cookie is present", async () => {
    expect(await getCurrentUser()).toBeNull();
  });

  it("creates a session and resolves the user via getCurrentUser", async () => {
    await createSession(userId);
    expect(cookieStore.has(SESSION_COOKIE_NAME)).toBe(true);

    const user = await getCurrentUser();
    expect(user?.id).toBe(userId);
  });

  it("destroySession is a no-op when no session cookie is present", async () => {
    await expect(destroySession()).resolves.toBeUndefined();
    expect(cookieStore.has(SESSION_COOKIE_NAME)).toBe(false);
  });

  it("destroySession removes the cookie and the DB row", async () => {
    await createSession(userId);
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)!.value;

    await destroySession();

    expect(cookieStore.has(SESSION_COOKIE_NAME)).toBe(false);
    const dbSession = await prisma.session.findUnique({ where: { id: sessionId } });
    expect(dbSession).toBeNull();
  });

  it("getCurrentUser returns null for an expired session", async () => {
    const session = await prisma.session.create({
      data: { userId, expiresAt: new Date(Date.now() - 1000) },
    });
    cookieStore.set(SESSION_COOKIE_NAME, { value: session.id });

    expect(await getCurrentUser()).toBeNull();
  });

  it("getCurrentUser returns null for a deactivated user", async () => {
    await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
    await createSession(userId);

    expect(await getCurrentUser()).toBeNull();

    await prisma.user.update({ where: { id: userId }, data: { isActive: true } });
  });
});
