"use client";

import { useActionState } from "react";
import { submitCorrectionRequest, type CorrectionRequestState } from "@/actions/correctionRequests";

const initialState: CorrectionRequestState = {};

export function CorrectionRequestForm() {
  const [state, formAction, pending] = useActionState(submitCorrectionRequest, initialState);

  return (
    <form action={formAction} className="space-y-5 border border-paper-line bg-paper-raised p-6">
      <div>
        <label htmlFor="targetDate" className="field-label">
          対象日
        </label>
        <input id="targetDate" name="targetDate" type="date" required className="field-input tabular" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="requestedClockIn" className="field-label">
            出勤時刻
          </label>
          <input id="requestedClockIn" name="requestedClockIn" type="time" className="field-input tabular" />
        </div>
        <div>
          <label htmlFor="requestedClockOut" className="field-label">
            退勤時刻
          </label>
          <input id="requestedClockOut" name="requestedClockOut" type="time" className="field-input tabular" />
        </div>
        <div>
          <label htmlFor="requestedBreakStart" className="field-label">
            休憩開始
          </label>
          <input id="requestedBreakStart" name="requestedBreakStart" type="time" className="field-input tabular" />
        </div>
        <div>
          <label htmlFor="requestedBreakEnd" className="field-label">
            休憩終了
          </label>
          <input id="requestedBreakEnd" name="requestedBreakEnd" type="time" className="field-input tabular" />
        </div>
      </div>

      <div>
        <label htmlFor="reason" className="field-label">
          理由
        </label>
        <textarea id="reason" name="reason" rows={3} required maxLength={500} className="field-input" />
      </div>

      {state.error && <p className="text-sm text-stamp-deep">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-stamp w-full">
        {pending ? "送信中..." : "申請する"}
      </button>
    </form>
  );
}
