"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";

type Props = {
  user: { name: string; employeeCode: string; role: string };
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`relative py-1 transition-colors ${
        active ? "text-paper" : "text-paper/60 hover:text-paper"
      }`}
    >
      {children}
      {active && <span className="absolute -bottom-[1px] left-0 h-[2px] w-full bg-stamp" />}
    </Link>
  );
}

export function AppHeader({ user }: Props) {
  return (
    <header className="border-b-2 border-stamp bg-ink">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <nav className="flex flex-wrap items-center gap-5 text-sm font-medium tracking-wide">
          <NavLink href="/">打刻</NavLink>
          <NavLink href="/history">勤怠履歴</NavLink>
          <NavLink href="/requests">修正申請</NavLink>
          {user.role === "ADMIN" && <NavLink href="/admin/employees">管理者メニュー</NavLink>}
        </nav>
        <div className="flex items-center gap-4 text-sm text-paper/70">
          <span className="tabular">
            {user.name}
            <span className="text-paper/50">({user.employeeCode})</span>
          </span>
          <form action={logout}>
            <button type="submit" className="text-stamp hover:text-paper transition-colors">
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
