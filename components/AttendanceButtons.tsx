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

function StampButton({
  action,
  label,
  variant = "primary",
}: {
  action: (prevState: AttendanceActionState, formData: FormData) => Promise<AttendanceActionState>;
  label: string;
  variant?: "primary" | "secondary";
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col items-center gap-2">
      <button
        type="submit"
        disabled={pending}
        className={`stamp-button ${variant === "secondary" ? "stamp-button--secondary" : ""}`}
      >
        {pending ? "…" : label}
      </button>
      {state.error && <p className="text-sm text-stamp-deep">{state.error}</p>}
    </form>
  );
}

export function AttendanceButtons({ clockedIn, clockedOut, onBreak, breakDone }: Props) {
  if (clockedOut) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <span className="stamp-badge text-status-ok">本日の勤務は終了しました</span>
        <p className="text-sm text-ink-faint">お疲れさまでした</p>
      </div>
    );
  }

  if (!clockedIn) {
    return <StampButton action={clockIn} label="出勤" />;
  }

  if (onBreak) {
    return <StampButton action={endBreak} label="休憩終了" variant="secondary" />;
  }

  return (
    <div className="flex items-end justify-center gap-6">
      {!breakDone && <StampButton action={startBreak} label="休憩開始" variant="secondary" />}
      <StampButton action={clockOut} label="退勤" />
    </div>
  );
}
