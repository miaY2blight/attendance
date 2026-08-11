"use client";

import { useActionState } from "react";
import { updateEmployee, type EmployeeFormState } from "@/actions/employees";

const initialState: EmployeeFormState = {};

type Props = {
  employee: {
    id: string;
    employeeCode: string;
    name: string;
    role: string;
    isActive: boolean;
  };
};

export function EditEmployeeForm({ employee }: Props) {
  const boundAction = updateEmployee.bind(null, employee.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <p className="mb-1 text-sm font-medium text-gray-700">社員ID</p>
        <p className="text-sm text-gray-500">{employee.employeeCode}</p>
      </div>
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
          氏名
        </label>
        <input
          id="name"
          name="name"
          defaultValue={employee.name}
          required
          maxLength={100}
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
          defaultValue={employee.role}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="EMPLOYEE">社員</option>
          <option value="ADMIN">管理者</option>
        </select>
      </div>
      <div>
        <label htmlFor="isActive" className="mb-1 block text-sm font-medium text-gray-700">
          状態
        </label>
        <select
          id="isActive"
          name="isActive"
          defaultValue={String(employee.isActive)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="true">有効</option>
          <option value="false">無効</option>
        </select>
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
          パスワード再設定(任意)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={4}
          placeholder="変更する場合のみ入力"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "更新中..." : "更新する"}
      </button>
    </form>
  );
}
