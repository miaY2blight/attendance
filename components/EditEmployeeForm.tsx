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
    <form action={formAction} className="space-y-5 border border-paper-line bg-paper-raised p-6">
      <div>
        <p className="field-label">社員ID</p>
        <p className="tabular text-sm text-ink-faint">{employee.employeeCode}</p>
      </div>
      <div>
        <label htmlFor="name" className="field-label">
          氏名
        </label>
        <input
          id="name"
          name="name"
          defaultValue={employee.name}
          required
          maxLength={100}
          className="field-input"
        />
      </div>
      <div>
        <label htmlFor="role" className="field-label">
          権限
        </label>
        <select id="role" name="role" defaultValue={employee.role} className="field-input">
          <option value="EMPLOYEE">社員</option>
          <option value="ADMIN">管理者</option>
        </select>
      </div>
      <div>
        <label htmlFor="isActive" className="field-label">
          状態
        </label>
        <select id="isActive" name="isActive" defaultValue={String(employee.isActive)} className="field-input">
          <option value="true">有効</option>
          <option value="false">無効</option>
        </select>
      </div>
      <div>
        <label htmlFor="password" className="field-label">
          パスワード再設定(任意)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={4}
          placeholder="変更する場合のみ入力"
          className="field-input"
        />
      </div>

      {state.error && <p className="text-sm text-stamp-deep">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-stamp w-full">
        {pending ? "更新中..." : "更新する"}
      </button>
    </form>
  );
}
