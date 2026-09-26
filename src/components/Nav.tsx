'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

const links: Array<{ href: string; label: string }> = [
  { href: "/", label: "Calculator" },
  { href: "/etfs", label: "ETFs" },
  { href: "/sources", label: "Data updates" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="mr-4 font-semibold tracking-tight">
          ETF Exposure
        </Link>
        {links.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={
                active
                  ? "font-medium underline underline-offset-4"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
