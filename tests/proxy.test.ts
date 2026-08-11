import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";

describe("proxy", () => {
  it("redirects unauthenticated requests to /login", () => {
    const request = new NextRequest("http://localhost:3000/");
    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("allows requests that carry a session cookie", () => {
    const request = new NextRequest("http://localhost:3000/", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=abc123` },
    });
    const response = proxy(request);

    expect(response.status).toBe(200);
  });

  it("allows /login without a session cookie", () => {
    const request = new NextRequest("http://localhost:3000/login");
    const response = proxy(request);

    expect(response.status).toBe(200);
  });
});
