import { prisma } from "@/lib/prisma";
import { formatDateWithWeekday, formatTime } from "@/lib/format";
import { CorrectionApprovalActions } from "@/components/CorrectionApprovalActions";

export default async function AdminRequestsPage() {
  const requests = await prisma.correctionRequest.findMany({
    where: { status: "PENDING" },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-lg text-ink">打刻修正申請の承認</h1>
      <div className="space-y-3">
        {requests.length === 0 && (
          <p className="border border-paper-line bg-paper-raised px-4 py-6 text-center text-sm text-ink-faint">
            承認待ちの申請はありません
          </p>
        )}
        {requests.map((req) => (
          <div key={req.id} className="border border-paper-line bg-paper-raised p-4">
            <p className="font-medium text-ink">
              {req.user.name}
              <span className="tabular text-ink-faint">({req.user.employeeCode})</span> —{" "}
              {formatDateWithWeekday(req.targetDate)}
            </p>
            <div className="tabular mt-3 grid grid-cols-2 gap-2 text-sm text-ink-soft sm:grid-cols-4">
              <p>出勤: {formatTime(req.requestedClockIn)}</p>
              <p>退勤: {formatTime(req.requestedClockOut)}</p>
              <p>休憩開始: {formatTime(req.requestedBreakStart)}</p>
              <p>休憩終了: {formatTime(req.requestedBreakEnd)}</p>
            </div>
            <p className="mt-3 text-sm text-ink-soft">理由: {req.reason}</p>
            <CorrectionApprovalActions requestId={req.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
