"use client";

import { useActionState } from "react";
import { createEmployee, type EmployeeFormState } from "@/actions/employees";

const initialState: EmployeeFormState = {};

export function NewEmployeeForm() {
  const [state, formAction, pending] = useActionState(createEmployee, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="employeeCode" className="mb-1 block text-sm font-medium text-gray-700">
          社員ID
        </label>
        <input
          id="employeeCode"
          name="employeeCode"
          required
          maxLength={50}
          pattern="[a-zA-Z0-9_-]+"
          title="半角英数字・ハイフン・アンダースコアのみ使用できます"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
          氏名
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={100}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
          初期パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">
          権限
        </label>
        <select
          id="role"
          name="role"
          defaultValue="EMPLOYEE"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="EMPLOYEE">社員</option>
          <option value="ADMIN">管理者</option>
        </select>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "登録中..." : "登録する"}
      </button>
    </form>
  );
}
