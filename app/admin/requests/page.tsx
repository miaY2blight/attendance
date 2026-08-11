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
      <h1 className="mb-4 text-lg font-semibold text-gray-900">打刻修正申請の承認</h1>
      <div className="space-y-3">
        {requests.length === 0 && (
          <p className="rounded-lg border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-400">
            承認待ちの申請はありません
          </p>
        )}
        {requests.map((req) => (
          <div key={req.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-medium text-gray-900">
              {req.user.name}({req.user.employeeCode}) - {formatDateWithWeekday(req.targetDate)}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600 sm:grid-cols-4">
              <p>出勤: {formatTime(req.requestedClockIn)}</p>
              <p>退勤: {formatTime(req.requestedClockOut)}</p>
              <p>休憩開始: {formatTime(req.requestedBreakStart)}</p>
              <p>休憩終了: {formatTime(req.requestedBreakEnd)}</p>
            </div>
            <p className="mt-2 text-sm text-gray-500">理由: {req.reason}</p>
            <CorrectionApprovalActions requestId={req.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
