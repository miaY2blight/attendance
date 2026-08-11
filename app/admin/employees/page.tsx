import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminEmployeesPage() {
  const employees = await prisma.user.findMany({ orderBy: { employeeCode: "asc" } });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">社員管理</h1>
        <Link
          href="/admin/employees/new"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          新規登録
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">社員ID</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">氏名</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">権限</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">状態</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-4 py-2 text-gray-900">{employee.employeeCode}</td>
                <td className="px-4 py-2 text-gray-700">{employee.name}</td>
                <td className="px-4 py-2 text-gray-700">{employee.role === "ADMIN" ? "管理者" : "社員"}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      employee.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {employee.isActive ? "有効" : "無効"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/admin/employees/${employee.id}/edit`} className="text-blue-600 hover:underline">
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
