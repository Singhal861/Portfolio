'use client';

import { useLanguage } from '@/components/language-provider';

export default function BrandText() {
  const { t } = useLanguage();
  return <span className="brand-text">{t.portalTitle}</span>;
}
