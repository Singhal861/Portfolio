'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/logout-button';
import { useLanguage } from '@/components/language-provider';

export default function NavLinks({ authenticated }: { authenticated: boolean }) {
  const pathname = usePathname();

  const { t } = useLanguage();

  const activeLinks = authenticated
    ? [
        { href: '/Japanese', label: t.home },
        { href: '/Japanese/dashboard', label: t.dashboard },
      ]
    : [
        { href: '/Japanese', label: t.home },
        { href: '/Japanese/login', label: t.login },
        { href: '/Japanese/register', label: t.register, className: 'nav-button' },
      ];

  return (
    <nav className="nav-links" aria-label="Primary navigation">
      {activeLinks.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`${active ? 'active' : ''} ${link.className || ''}`}
            aria-current={active ? 'page' : undefined}
          >
            {link.label}
          </Link>
        );
      })}
      {authenticated ? <LogoutButton /> : null}
    </nav>
  );
}
