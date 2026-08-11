"use client";

import { useActionState } from "react";
import {
  approveCorrectionRequest,
  rejectCorrectionRequest,
  type ApprovalState,
} from "@/actions/correctionRequests";

const initialState: ApprovalState = {};

export function CorrectionApprovalActions({ requestId }: { requestId: string }) {
  const approveAction = approveCorrectionRequest.bind(null, requestId);
  const rejectAction = rejectCorrectionRequest.bind(null, requestId);
  const [approveState, approveFormAction, approvePending] = useActionState(approveAction, initialState);
  const [rejectState, rejectFormAction, rejectPending] = useActionState(rejectAction, initialState);

  return (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <form action={approveFormAction} className="space-y-2">
        <input
          name="comment"
          placeholder="承認コメント(任意)"
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={approvePending}
          className="w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {approvePending ? "処理中..." : "承認"}
        </button>
        {approveState.error && <p className="text-sm text-red-600">{approveState.error}</p>}
      </form>
      <form action={rejectFormAction} className="space-y-2">
        <input
          name="comment"
          placeholder="却下理由(任意)"
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={rejectPending}
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          {rejectPending ? "処理中..." : "却下"}
        </button>
        {rejectState.error && <p className="text-sm text-red-600">{rejectState.error}</p>}
      </form>
    </div>
  );
}
