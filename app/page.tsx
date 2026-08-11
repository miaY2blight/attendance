import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTodayRecord } from "@/lib/attendance";
import { formatDateWithWeekday, formatTime } from "@/lib/format";
import { AppHeader } from "@/components/AppHeader";
import { AttendanceButtons } from "@/components/AttendanceButtons";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const record = await getTodayRecord(user.id);

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader user={user} />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="mx-auto max-w-md border border-paper-line bg-paper-raised px-8 pb-10 pt-8">
          <p className="text-center text-xs font-medium tracking-[0.25em] text-ink-faint">
            {formatDateWithWeekday(new Date())}
          </p>
          <h1 className="mt-1 text-center font-display text-lg text-ink">本日の打刻</h1>

          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 border-y border-paper-line py-6 text-center">
            <div>
              <p className="text-xs tracking-widest text-ink-soft">出勤</p>
              <p className="tabular mt-1 text-2xl text-ink">{formatTime(record?.clockIn)}</p>
            </div>
            <div>
              <p className="text-xs tracking-widest text-ink-soft">退勤</p>
              <p className="tabular mt-1 text-2xl text-ink">{formatTime(record?.clockOut)}</p>
            </div>
            <div>
              <p className="text-xs tracking-widest text-ink-soft">休憩開始</p>
              <p className="tabular mt-1 text-lg text-ink-soft">{formatTime(record?.breakStart)}</p>
            </div>
            <div>
              <p className="text-xs tracking-widest text-ink-soft">休憩終了</p>
              <p className="tabular mt-1 text-lg text-ink-soft">{formatTime(record?.breakEnd)}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <AttendanceButtons
              clockedIn={!!record?.clockIn}
              clockedOut={!!record?.clockOut}
              onBreak={!!record?.breakStart && !record?.breakEnd}
              breakDone={!!record?.breakEnd}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
