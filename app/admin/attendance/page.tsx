import { prisma } from "@/lib/prisma";
import { getMonthlyRecordsForAdmin } from "@/lib/attendance";
import { formatDateWithWeekday, formatTime } from "@/lib/format";
import { parseYearMonth, formatYearMonth } from "@/lib/monthParam";

const STATUS_LABEL: Record<string, string> = {
  NORMAL: "通常",
  CORRECTED: "修正済み",
  MISSING: "未打刻",
};

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; employeeId?: string }>;
}) {
  const { month: monthParam, employeeId } = await searchParams;
  const { year, month } = parseYearMonth(monthParam);
  const selectedEmployeeId = employeeId || "";
  const monthValue = formatYearMonth(year, month);

  const [employees, records] = await Promise.all([
    prisma.user.findMany({ orderBy: { employeeCode: "asc" } }),
    getMonthlyRecordsForAdmin(selectedEmployeeId || null, year, month),
  ]);

  const exportHref = `/admin/attendance/export?month=${monthValue}${
    selectedEmployeeId ? `&employeeId=${selectedEmployeeId}` : ""
  }`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-gray-900">月次勤怠一覧</h1>
        <a
          href={exportHref}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          CSVダウンロード
        </a>
      </div>

      <form className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <select
          name="employeeId"
          defaultValue={selectedEmployeeId}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">全社員</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}({employee.employeeCode})
            </option>
          ))}
        </select>
        <input
          type="month"
          name="month"
          defaultValue={monthValue}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
        <button type="submit" className="rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-100">
          絞り込み
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">社員</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">日付</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">出勤</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">退勤</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">休憩</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">状態</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  この月の打刻記録はありません
                </td>
              </tr>
            )}
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-2 text-gray-900">
                  {record.user.name}({record.user.employeeCode})
                </td>
                <td className="px-4 py-2 text-gray-700">{formatDateWithWeekday(record.date)}</td>
                <td className="px-4 py-2 text-gray-700">{formatTime(record.clockIn)}</td>
                <td className="px-4 py-2 text-gray-700">{formatTime(record.clockOut)}</td>
                <td className="px-4 py-2 text-gray-700">
                  {formatTime(record.breakStart)} - {formatTime(record.breakEnd)}
                </td>
                <td className="px-4 py-2 text-gray-700">{STATUS_LABEL[record.status] ?? record.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
