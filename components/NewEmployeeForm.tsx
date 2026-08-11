"use client";

import { useActionState } from "react";
import { createEmployee, type EmployeeFormState } from "@/actions/employees";

const initialState: EmployeeFormState = {};

export function NewEmployeeForm() {
  const [state, formAction, pending] = useActionState(createEmployee, initialState);

  return (
    <form action={formAction} className="space-y-5 border border-paper-line bg-paper-raised p-6">
      <div>
        <label htmlFor="employeeCode" className="field-label">
          社員ID
        </label>
        <input
          id="employeeCode"
          name="employeeCode"
          required
          maxLength={50}
          pattern="[a-zA-Z0-9_-]+"
          title="半角英数字・ハイフン・アンダースコアのみ使用できます"
          className="field-input tabular"
        />
      </div>
      <div>
        <label htmlFor="name" className="field-label">
          氏名
        </label>
        <input id="name" name="name" required maxLength={100} className="field-input" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">
          初期パスワード
        </label>
        <input id="password" name="password" type="password" required minLength={4} className="field-input" />
      </div>
      <div>
        <label htmlFor="role" className="field-label">
          権限
        </label>
        <select id="role" name="role" defaultValue="EMPLOYEE" className="field-input">
          <option value="EMPLOYEE">社員</option>
          <option value="ADMIN">管理者</option>
        </select>
      </div>

      {state.error && <p className="text-sm text-stamp-deep">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-stamp w-full">
        {pending ? "登録中..." : "登録する"}
      </button>
    </form>
  );
}
