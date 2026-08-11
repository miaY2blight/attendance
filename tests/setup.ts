import { beforeEach, vi } from "vitest";

type CookieRecord = { value: string; options?: Record<string, unknown> };

export const cookieStore = new Map<string, CookieRecord>();

vi.mock("next/headers", () => {
  return {
    cookies: async () => ({
      get: (name: string) => {
        const rec = cookieStore.get(name);
        return rec ? { name, value: rec.value } : undefined;
      },
      set: (name: string, value: string, options?: Record<string, unknown>) => {
        cookieStore.set(name, { value, options });
      },
      delete: (name: string) => {
        cookieStore.delete(name);
      },
    }),
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: () => {},
  revalidateTag: () => {},
}));

beforeEach(() => {
  cookieStore.clear();
});
