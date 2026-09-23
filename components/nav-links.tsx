'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/logout-button';
import { useLanguage } from '@/components/language-provider';

export default function NavLinks({ authenticated, isMenu = false }: { authenticated: boolean, isMenu?: boolean }) {
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
      { href: '/Japanese/register', label: t.register, className: isMenu ? 'menu-item' : 'nav-button' },
    ];

  return (
    <nav className="nav-links" aria-label="Primary navigation">
      {activeLinks.map((link) => {
        const active = pathname === link.href;
        const linkClass = isMenu ? `menu-item ${active ? 'active' : ''}` : `${active ? 'active' : ''} ${link.className || ''}`;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={linkClass.trim()}
            aria-current={active ? 'page' : undefined}
          >
            {link.label}
          </Link>
        );
      })}
      {authenticated ? (<LogoutButton className={isMenu ? "menu-item" : "logout-link"} />) : null}
    </nav>
  );
}
