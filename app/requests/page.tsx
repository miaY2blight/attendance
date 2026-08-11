import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateWithWeekday, formatTime } from "@/lib/format";
import { AppHeader } from "@/components/AppHeader";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "承認待ち",
  APPROVED: "承認済み",
  REJECTED: "却下",
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: "text-status-warn",
  APPROVED: "text-status-ok",
  REJECTED: "text-stamp",
};

export default async function RequestsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const requests = await prisma.correctionRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader user={user} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-lg text-ink">打刻修正申請</h1>
          <Link
            href="/requests/new"
            className="border border-ink bg-ink px-3 py-2 text-sm font-medium text-paper transition-colors hover:bg-stamp hover:border-stamp"
          >
            新規申請
          </Link>
        </div>

        <div className="space-y-3">
          {requests.length === 0 && (
            <p className="border border-paper-line bg-paper-raised px-4 py-6 text-center text-sm text-ink-faint">
              申請はまだありません
            </p>
          )}
          {requests.map((req) => (
            <div key={req.id} className="border border-paper-line bg-paper-raised p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink">{formatDateWithWeekday(req.targetDate)}</p>
                <span className={`stamp-badge ${STATUS_CLASS[req.status]}`}>
                  {STATUS_LABEL[req.status]}
                </span>
              </div>
              <div className="tabular mt-3 grid grid-cols-2 gap-2 text-sm text-ink-soft sm:grid-cols-4">
                <p>出勤: {formatTime(req.requestedClockIn)}</p>
                <p>退勤: {formatTime(req.requestedClockOut)}</p>
                <p>休憩開始: {formatTime(req.requestedBreakStart)}</p>
                <p>休憩終了: {formatTime(req.requestedBreakEnd)}</p>
              </div>
              <p className="mt-3 text-sm text-ink-soft">理由: {req.reason}</p>
              {req.approverComment && (
                <p className="mt-1 text-sm text-ink-faint">コメント: {req.approverComment}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
