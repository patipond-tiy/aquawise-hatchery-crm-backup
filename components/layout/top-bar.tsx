'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@/components/aw/icon';
import { V3Avatar } from '@/components/aw/v3-avatar';

export function TopBar() {
  const t = useTranslations();

  return (
    <header
      className="flex items-center gap-4 px-7 py-5 border-b"
      style={{ borderColor: 'var(--color-line)' }}
    >
      <div className="flex-1 relative">
        <div className="absolute left-[18px] top-1/2 -translate-y-1/2" style={{ color: 'var(--color-ink-4)' }}>
          <Icon name="search" size={16} color="currentColor" />
        </div>
        <input
          className="aw3-input"
          placeholder={t('common.search_placeholder')}
          style={{ paddingLeft: 44 }}
        />
      </div>

      <button
        type="button"
        className="relative flex items-center justify-center cursor-pointer border-0"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'var(--color-soft)',
        }}
      >
        <Icon name="mail" size={18} />
        <span
          className="absolute"
          style={{
            top: 8,
            right: 9,
            width: 8,
            height: 8,
            background: 'var(--color-hero)',
            borderRadius: '50%',
            border: '2px solid var(--color-card)',
          }}
        />
      </button>

      <button
        type="button"
        className="flex items-center justify-center cursor-pointer border-0"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'var(--color-soft)',
        }}
      >
        <Icon name="profile" size={18} />
      </button>

      <div className="w-px h-[26px] mx-1" style={{ background: 'var(--color-line-2)' }} />

      <div className="flex items-center gap-2.5">
        <V3Avatar name="สุเทพ" tone="lav" size={36} />
        <div className="whitespace-nowrap">
          <div className="text-[15px] font-bold">คุณสุเทพ</div>
          <div className="text-xs" style={{ color: 'var(--color-ink-3)' }}>
            {t('user.owner')}
          </div>
        </div>
      </div>
    </header>
  );
}
