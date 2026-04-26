'use client';

import { useTranslations } from 'next-intl';
import { V3Avatar } from '@/components/aw/v3-avatar';
import { V3Chip } from '@/components/aw/v3-chip';

const TEAM = [
  { name: 'นิภา ใจดี', role: 'หัวหน้าโรงเพาะ', tone: 'mint' as const },
  { name: 'พรชัย ตั้งใจ', role: 'เจ้าหน้าที่ PCR', tone: 'sky' as const },
  { name: 'รัตนา สุขสวัสดิ์', role: 'ดูแลลูกค้า', tone: 'rose' as const },
];

export function RightRail() {
  const t = useTranslations();

  return (
    <aside
      className="overflow-y-auto p-5 px-[22px] py-7 border-l"
      style={{ borderColor: 'var(--color-line)' }}
    >
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="m-0 text-base font-bold">{t('user.your_stats')}</h3>
        <button
          type="button"
          className="border-0 bg-transparent cursor-pointer"
          style={{ width: 24, height: 24, color: 'var(--color-ink-4)' }}
        >
          ⋯
        </button>
      </div>

      {/* Progress ring placeholder */}
      <div className="flex justify-center mb-3.5 relative">
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: 170,
            height: 170,
            border: '9px solid var(--color-soft)',
            borderTopColor: 'var(--color-hero)',
            borderRightColor: 'var(--color-hero)',
            transform: 'rotate(-30deg)',
          }}
        >
          <V3Avatar name="สุเทพ" tone="lav" size={130} />
        </div>
        <div
          className="absolute"
          style={{
            top: 8,
            right: 38,
            background: '#fff',
            color: 'var(--color-hero)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-pill)',
            fontSize: 11,
            fontWeight: 700,
            boxShadow: '0 4px 8px rgba(91,75,255,0.18)',
          }}
        >
          82%
        </div>
      </div>

      <div className="text-center mb-2">
        <div className="text-lg font-bold">{t('user.greeting', { name: 'สุเทพ' })}</div>
        <div className="text-sm mt-1.5 px-2" style={{ color: 'var(--color-ink-3)' }}>
          เป้าหมาย D30 อัตรารอด 80% ของไตรมาสนี้
        </div>
      </div>

      {/* Team */}
      <div className="mt-7 mb-3 flex justify-between items-center">
        <h3 className="m-0 text-[15px] font-bold">{t('user.your_team')}</h3>
      </div>
      <div className="flex flex-col gap-2">
        {TEAM.map((m) => (
          <div key={m.name} className="flex items-center gap-2.5 p-1">
            <V3Avatar name={m.name} tone={m.tone} size={36} />
            <div className="flex-1">
              <div className="text-sm font-bold">{m.name}</div>
              <div className="text-[11px]" style={{ color: 'var(--color-ink-3)' }}>
                {m.role}
              </div>
            </div>
            <V3Chip tone="soft" size="xs">
              ทักทาย
            </V3Chip>
          </div>
        ))}
      </div>
    </aside>
  );
}
