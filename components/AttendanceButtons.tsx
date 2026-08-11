"use client";

import { useActionState } from "react";
import {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  type AttendanceActionState,
} from "@/actions/attendance";

const initialState: AttendanceActionState = {};

type Props = {
  clockedIn: boolean;
  clockedOut: boolean;
  onBreak: boolean;
  breakDone: boolean;
};

function ActionButton({
  action,
  label,
  variant = "primary",
}: {
  action: (prevState: AttendanceActionState, formData: FormData) => Promise<AttendanceActionState>;
  label: string;
  variant?: "primary" | "secondary";
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const className =
    variant === "primary"
      ? "w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      : "w-full rounded-md border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50";

  return (
    <form action={formAction} className="space-y-1">
      <button type="submit" disabled={pending} className={className}>
        {pending ? "処理中..." : label}
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

export function AttendanceButtons({ clockedIn, clockedOut, onBreak, breakDone }: Props) {
  if (clockedOut) {
    return <p className="text-center text-sm text-gray-500">本日の勤務は終了しました。お疲れさまでした。</p>;
  }

  if (!clockedIn) {
    return <ActionButton action={clockIn} label="出勤" />;
  }

  if (onBreak) {
    return <ActionButton action={endBreak} label="休憩終了" variant="secondary" />;
  }

  return (
    <div className="space-y-3">
      {!breakDone && <ActionButton action={startBreak} label="休憩開始" variant="secondary" />}
      <ActionButton action={clockOut} label="退勤" />
    </div>
  );
}
