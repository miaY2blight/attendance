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
    <div className="mt-4 grid grid-cols-1 gap-3 border-t border-paper-line pt-4 sm:grid-cols-2">
      <form action={approveFormAction} className="space-y-2">
        <input name="comment" placeholder="承認コメント(任意)" className="field-input" />
        <button type="submit" disabled={approvePending} className="btn-stamp w-full">
          {approvePending ? "処理中..." : "承認"}
        </button>
        {approveState.error && <p className="text-sm text-stamp-deep">{approveState.error}</p>}
      </form>
      <form action={rejectFormAction} className="space-y-2">
        <input name="comment" placeholder="却下理由(任意)" className="field-input" />
        <button type="submit" disabled={rejectPending} className="btn-outline w-full">
          {rejectPending ? "処理中..." : "却下"}
        </button>
        {rejectState.error && <p className="text-sm text-stamp-deep">{rejectState.error}</p>}
      </form>
    </div>
  );
}
