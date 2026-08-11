"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/actions/auth";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm border border-ink-faint/40 bg-paper-raised p-8 shadow-[0_1px_0_0_var(--color-paper-line)]">
        <p className="mb-1 text-xs font-medium tracking-[0.2em] text-stamp">TIME LEDGER</p>
        <h1 className="mb-8 font-display text-2xl font-medium text-ink">勤怠管理システム</h1>
        <form action={formAction} className="space-y-5">
          <div>
            <label htmlFor="employeeCode" className="mb-1 block text-sm font-medium text-ink-soft">
              社員ID
            </label>
            <input
              id="employeeCode"
              name="employeeCode"
              type="text"
              autoComplete="username"
              required
              className="w-full border border-paper-line bg-paper px-3 py-2 text-sm text-ink focus:border-stamp focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink-soft">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full border border-paper-line bg-paper px-3 py-2 text-sm text-ink focus:border-stamp focus:outline-none"
            />
          </div>
          {state.error && <p className="text-sm text-stamp-deep">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full border border-ink bg-ink px-3 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-stamp hover:border-stamp disabled:opacity-50"
          >
            {pending ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
