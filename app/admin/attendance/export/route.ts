import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getMonthlyRecordsForAdmin } from "@/lib/attendance";
import { parseYearMonth, formatYearMonth } from "@/lib/monthParam";
import { buildAttendanceCsv } from "@/lib/csv";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const employeeId = searchParams.get("employeeId") || null;
  const { year, month } = parseYearMonth(searchParams.get("month") ?? undefined);

  const records = await getMonthlyRecordsForAdmin(employeeId, year, month);
  const csv = buildAttendanceCsv(records);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="attendance_${formatYearMonth(year, month)}.csv"`,
    },
  });
}
