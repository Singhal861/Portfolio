'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';

export default function Brand() {
  const { t } = useLanguage();

  return (
    <Link href="/Japanese" className="brand" aria-label="Home">
      <span className="brand-mark">🌸</span>
      <span className="brand-text">{t.portalTitle}</span>
    </Link>
  );
}
