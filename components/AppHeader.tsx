import Link from "next/link";
import { logout } from "@/actions/auth";

type Props = {
  user: { name: string; employeeCode: string; role: string };
};

export function AppHeader({ user }: Props) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            打刻
          </Link>
          <Link href="/history" className="hover:text-gray-900">
            勤怠履歴
          </Link>
          <Link href="/requests" className="hover:text-gray-900">
            修正申請
          </Link>
          {user.role === "ADMIN" && (
            <Link href="/admin/employees" className="hover:text-gray-900">
              管理者メニュー
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>
            {user.name}({user.employeeCode})
          </span>
          <form action={logout}>
            <button type="submit" className="text-blue-600 hover:underline">
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
