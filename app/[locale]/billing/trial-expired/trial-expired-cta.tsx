'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { createCheckoutSession } from '@/app/[locale]/(dashboard)/settings/billing/actions';

export function TrialExpiredCta() {
  const t = useTranslations('billing');
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const subscribe = () => {
    setLoading(true);
    startTransition(async () => {
      const result = await createCheckoutSession();
      if (!result.ok) {
        toast.error(result.error);
        setLoading(false);
        return;
      }
      window.location.href = result.data.url;
    });
  };

  return (
    <button
      type="button"
      className="aw3-btn aw3-btn-hero"
      onClick={subscribe}
      disabled={pending || loading}
      style={{
        width: '100%',
        justifyContent: 'center',
        fontSize: 16,
        padding: '16px 24px',
        minHeight: 56,
      }}
    >
      {loading ? t('preparing_checkout') : t('subscribe_cta')}
    </button>
  );
}
