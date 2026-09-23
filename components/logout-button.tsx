"use client";

import { signOut } from 'next-auth/react';

export default function LogoutButton({ className = "nav-button" }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => signOut({ callbackUrl: '/Japanese/login' })}>
      Logout
    </button>
  );
}
