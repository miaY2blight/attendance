"use client";

import { useActionState } from "react";
import { submitCorrectionRequest, type CorrectionRequestState } from "@/actions/correctionRequests";

const initialState: CorrectionRequestState = {};

export function CorrectionRequestForm() {
  const [state, formAction, pending] = useActionState(submitCorrectionRequest, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="targetDate" className="mb-1 block text-sm font-medium text-gray-700">
          対象日
        </label>
        <input
          id="targetDate"
          name="targetDate"
          type="date"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="requestedClockIn" className="mb-1 block text-sm font-medium text-gray-700">
            出勤時刻
          </label>
          <input
            id="requestedClockIn"
            name="requestedClockIn"
            type="time"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="requestedClockOut" className="mb-1 block text-sm font-medium text-gray-700">
            退勤時刻
          </label>
          <input
            id="requestedClockOut"
            name="requestedClockOut"
            type="time"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="requestedBreakStart" className="mb-1 block text-sm font-medium text-gray-700">
            休憩開始
          </label>
          <input
            id="requestedBreakStart"
            name="requestedBreakStart"
            type="time"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="requestedBreakEnd" className="mb-1 block text-sm font-medium text-gray-700">
            休憩終了
          </label>
          <input
            id="requestedBreakEnd"
            name="requestedBreakEnd"
            type="time"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="reason" className="mb-1 block text-sm font-medium text-gray-700">
          理由
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          required
          maxLength={500}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "送信中..." : "申請する"}
      </button>
    </form>
  );
}
