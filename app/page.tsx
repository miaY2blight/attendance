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
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mx-auto max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-center text-sm text-gray-500">{formatDateWithWeekday(new Date())}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center text-sm">
            <div>
              <p className="text-gray-500">出勤</p>
              <p className="text-lg font-semibold text-gray-900">{formatTime(record?.clockIn)}</p>
            </div>
            <div>
              <p className="text-gray-500">退勤</p>
              <p className="text-lg font-semibold text-gray-900">{formatTime(record?.clockOut)}</p>
            </div>
            <div>
              <p className="text-gray-500">休憩開始</p>
              <p className="text-lg font-semibold text-gray-900">{formatTime(record?.breakStart)}</p>
            </div>
            <div>
              <p className="text-gray-500">休憩終了</p>
              <p className="text-lg font-semibold text-gray-900">{formatTime(record?.breakEnd)}</p>
            </div>
          </div>
          <div className="mt-6">
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
