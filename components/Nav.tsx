'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'The Grid' },
  { href: '/race-day', label: 'Race Day' },
  { href: '/seat-bids', label: 'Seat Bids' },
  { href: '/paddock', label: 'The Paddock' },
  { href: '/garage', label: 'Your Garage' },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-paper/88 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1360px] items-center gap-10 px-8">
        <Link
          href="/"
          className="text-[13px] font-semibold tracking-[0.18em] text-ink uppercase"
        >
          The Grid
        </Link>

        <nav className="flex items-center gap-7">
          {LINKS.map((link) => {
            const active =
              link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'text-[13px] text-ink'
                    : 'text-[13px] text-ink-3 transition-colors hover:text-ink'
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="tnum ml-auto text-[12px] text-ink-3">
          Round 42 · epoch open
        </div>
      </div>
    </header>
  );
}
