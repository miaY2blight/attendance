import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMonthlyRecords } from "@/lib/attendance";
import { formatDateWithWeekday, formatTime } from "@/lib/format";
import { parseYearMonth, shiftMonth } from "@/lib/monthParam";
import { AppHeader } from "@/components/AppHeader";

const STATUS_LABEL: Record<string, string> = {
  NORMAL: "通常",
  CORRECTED: "修正済み",
  MISSING: "未打刻",
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { month: monthParam } = await searchParams;
  const { year, month } = parseYearMonth(monthParam);
  const records = await getMonthlyRecords(user.id, year, month);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={`/history?month=${shiftMonth(year, month, -1)}`}
            className="text-sm text-blue-600 hover:underline"
          >
            ← 前月
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">
            {year}年{month}月の勤怠履歴
          </h1>
          <Link
            href={`/history?month=${shiftMonth(year, month, 1)}`}
            className="text-sm text-blue-600 hover:underline"
          >
            翌月 →
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
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
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                    この月の打刻記録はありません
                  </td>
                </tr>
              )}
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-2 text-gray-900">{formatDateWithWeekday(record.date)}</td>
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
      </main>
    </div>
  );
}
