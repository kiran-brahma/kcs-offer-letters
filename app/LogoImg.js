'use client';

import { useState } from 'react';
import { COMPANY } from '@/lib/company';

export default function LogoImg() {
  const [broken, setBroken] = useState(false);
  if (broken) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={COMPANY.logoPath} alt="" onError={() => setBroken(true)} />;
}
