"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function DashboardNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação do painel" className="border-b border-brand-100 bg-white">
      <div className="container-site">
        <ul className="-mb-px flex gap-1 overflow-x-auto">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/painel" && item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "border-accent-500 text-accent-600"
                      : "border-transparent text-brand-600 hover:border-brand-300 hover:text-brand-900"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
