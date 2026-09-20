"use client";

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button type="button" className="nav-button" onClick={() => signOut({ callbackUrl: '/Japanese/login' })}>
      Logout
    </button>
  );
}
