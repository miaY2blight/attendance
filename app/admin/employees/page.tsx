import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminEmployeesPage() {
  const employees = await prisma.user.findMany({ orderBy: { employeeCode: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-lg text-ink">社員管理</h1>
        <Link
          href="/admin/employees/new"
          className="border border-ink bg-ink px-3 py-2 text-sm font-medium text-paper transition-colors hover:bg-stamp hover:border-stamp"
        >
          新規登録
        </Link>
      </div>

      <div className="overflow-x-auto border border-paper-line bg-paper-raised">
        <table className="ledger-table min-w-full text-sm">
          <thead>
            <tr>
              <th>社員ID</th>
              <th>氏名</th>
              <th>権限</th>
              <th>状態</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="tabular">{employee.employeeCode}</td>
                <td>{employee.name}</td>
                <td>{employee.role === "ADMIN" ? "管理者" : "社員"}</td>
                <td>
                  <span
                    className={`stamp-badge ${employee.isActive ? "text-status-ok" : "text-ink-faint"}`}
                  >
                    {employee.isActive ? "有効" : "無効"}
                  </span>
                </td>
                <td className="text-right">
                  <Link href={`/admin/employees/${employee.id}/edit`} className="text-ink-soft hover:text-stamp">
                    編集
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
