'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/Japanese', label: 'Home' },
  { href: '/Japanese/login', label: 'Login' },
  { href: '/Japanese/register', label: 'Register', className: 'nav-button' },
];

export default function NavLinks({ authenticated }: { authenticated: boolean }) {
  const pathname = usePathname();

  const activeLinks = authenticated
    ? [
        { href: '/Japanese', label: 'Home' },
        { href: '/Japanese/dashboard', label: 'Dashboard' },
      ]
    : [
        { href: '/Japanese', label: 'Home' },
        { href: '/Japanese/login', label: 'Login' },
        { href: '/Japanese/register', label: 'Register' },
      ];

  return (
    <nav className="nav-links" aria-label="Primary navigation">
      {activeLinks.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? 'active' : ''}
            aria-current={active ? 'page' : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
