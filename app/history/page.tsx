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

const STATUS_CLASS: Record<string, string> = {
  NORMAL: "text-ink-faint",
  CORRECTED: "text-status-warn",
  MISSING: "text-stamp",
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
    <div className="min-h-screen bg-paper">
      <AppHeader user={user} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/history?month=${shiftMonth(year, month, -1)}`}
            className="text-sm text-ink-soft hover:text-stamp"
          >
            ← 前月
          </Link>
          <h1 className="font-display text-lg text-ink">
            {year}年{month}月の勤怠履歴
          </h1>
          <Link
            href={`/history?month=${shiftMonth(year, month, 1)}`}
            className="text-sm text-ink-soft hover:text-stamp"
          >
            翌月 →
          </Link>
        </div>

        <div className="overflow-x-auto border border-paper-line bg-paper-raised">
          <table className="ledger-table min-w-full text-sm">
            <thead>
              <tr>
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
                  <td colSpan={5} className="px-4 py-6 text-center text-ink-faint">
                    この月の打刻記録はありません
                  </td>
                </tr>
              )}
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{formatDateWithWeekday(record.date)}</td>
                  <td className="tabular">{formatTime(record.clockIn)}</td>
                  <td className="tabular">{formatTime(record.clockOut)}</td>
                  <td className="tabular">
                    {formatTime(record.breakStart)} - {formatTime(record.breakEnd)}
                  </td>
                  <td className={STATUS_CLASS[record.status] ?? "text-ink"}>
                    {STATUS_LABEL[record.status] ?? record.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
