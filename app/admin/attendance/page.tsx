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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-lg text-ink">月次勤怠一覧</h1>
        <a href={exportHref} className="btn-stamp">
          CSVダウンロード
        </a>
      </div>

      <form className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <select name="employeeId" defaultValue={selectedEmployeeId} className="field-input w-auto">
          <option value="">全社員</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}({employee.employeeCode})
            </option>
          ))}
        </select>
        <input type="month" name="month" defaultValue={monthValue} className="field-input tabular w-auto" />
        <button type="submit" className="btn-outline">
          絞り込み
        </button>
      </form>

      <div className="overflow-x-auto border border-paper-line bg-paper-raised">
        <table className="ledger-table min-w-full text-sm">
          <thead>
            <tr>
              <th>社員</th>
              <th>日付</th>
              <th>出勤</th>
              <th>退勤</th>
              <th>休憩</th>
              <th>状態</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-faint">
                  この月の打刻記録はありません
                </td>
              </tr>
            )}
            {records.map((record) => (
              <tr key={record.id}>
                <td>
                  {record.user.name}
                  <span className="tabular text-ink-faint">({record.user.employeeCode})</span>
                </td>
                <td>{formatDateWithWeekday(record.date)}</td>
                <td className="tabular">{formatTime(record.clockIn)}</td>
                <td className="tabular">{formatTime(record.clockOut)}</td>
                <td className="tabular">
                  {formatTime(record.breakStart)} - {formatTime(record.breakEnd)}
                </td>
                <td>{STATUS_LABEL[record.status] ?? record.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
