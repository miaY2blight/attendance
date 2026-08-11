import Link from "next/link";

export function AdminNav() {
  return (
    <nav className="mb-6 flex flex-wrap gap-4 border-b border-gray-200 pb-3 text-sm font-medium text-gray-600">
      <Link href="/admin/employees" className="hover:text-gray-900">
        社員管理
      </Link>
      <Link href="/admin/requests" className="hover:text-gray-900">
        修正申請承認
      </Link>
      <Link href="/admin/attendance" className="hover:text-gray-900">
        勤怠一覧・CSV
      </Link>
    </nav>
  );
}
