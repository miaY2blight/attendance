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
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
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
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">打刻修正申請</h1>
          <Link
            href="/requests/new"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            新規申請
          </Link>
        </div>

        <div className="space-y-3">
          {requests.length === 0 && (
            <p className="rounded-lg border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-400">
              申請はまだありません
            </p>
          )}
          {requests.map((req) => (
            <div key={req.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{formatDateWithWeekday(req.targetDate)}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[req.status]}`}
                >
                  {STATUS_LABEL[req.status]}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600 sm:grid-cols-4">
                <p>出勤: {formatTime(req.requestedClockIn)}</p>
                <p>退勤: {formatTime(req.requestedClockOut)}</p>
                <p>休憩開始: {formatTime(req.requestedBreakStart)}</p>
                <p>休憩終了: {formatTime(req.requestedBreakEnd)}</p>
              </div>
              <p className="mt-2 text-sm text-gray-500">理由: {req.reason}</p>
              {req.approverComment && (
                <p className="mt-1 text-sm text-gray-500">コメント: {req.approverComment}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
