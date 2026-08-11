"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/employees", label: "社員管理" },
  { href: "/admin/requests", label: "修正申請承認" },
  { href: "/admin/attendance", label: "勤怠一覧・CSV" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-6 border-b border-ink pb-0 text-sm font-medium">
      {LINKS.map(({ href, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`relative pb-3 transition-colors ${
              active ? "text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {label}
            {active && <span className="absolute -bottom-[1px] left-0 h-[2px] w-full bg-stamp" />}
          </Link>
        );
      })}
    </nav>
  );
}
