"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth/actions";
import type { Role } from "@/types/database";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/machines", label: "Machines" },
  { href: "/alarms", label: "Alarms" },
  { href: "/maintenance", label: "Maintenance" },
];

export function Sidebar({ email, role }: { email: string; role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col justify-between border-r border-gray-200 bg-white">
      <div>
        <div className="px-4 py-5 text-lg font-bold text-gray-900">
          Alarm &amp; Maintenance
        </div>
        <nav className="space-y-1 px-2">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="mb-2 text-sm">
          <div className="font-medium text-gray-900">{email}</div>
          <div className="text-xs text-gray-500 uppercase">{role}</div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ออกจากระบบ
          </button>
        </form>
      </div>
    </aside>
  );
}