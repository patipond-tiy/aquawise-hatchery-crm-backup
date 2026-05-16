'use client';

import { useQuery } from '@tanstack/react-query';
import { listTeam } from '@/lib/api';
import { useModal } from '@/lib/store/modal';
import { V3Card } from '@/components/aw/v3-card';
import { V3Chip } from '@/components/aw/v3-chip';
import { V3Avatar } from '@/components/aw/v3-avatar';

const ROLE_LABELS: Record<string, { label: string; tone: 'solid' | 'sky' | 'soft' }> = {
  owner:         { label: 'เจ้าของ', tone: 'solid' },
  counter_staff: { label: 'เคาน์เตอร์', tone: 'sky' },
  lab_tech:      { label: 'PCR', tone: 'sky' },
  auditor:       { label: 'ดูเท่านั้น', tone: 'soft' },
};

const TONE_CYCLE = ['lav', 'mint', 'sky', 'rose', 'amber'] as const;

export function Team() {
  const openModal = useModal((s) => s.open);
  const { data: team = [] } = useQuery({
    queryKey: ['team'],
    queryFn: listTeam,
  });

  return (
    <div>
      <V3Card
        pad={0}
        style={{
          border: '1px solid var(--color-line)',
          overflow: 'hidden',
          maxWidth: 820,
        }}
      >
        {team.map((t, i) => {
          const permInfo = ROLE_LABELS[t.perm] ?? { label: t.perm, tone: 'soft' as const };
          const tone = (t.tone as (typeof TONE_CYCLE)[number]) ?? TONE_CYCLE[i % TONE_CYCLE.length];
          return (
            <div
              key={t.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 22px',
                borderTop: i > 0 ? '1px solid var(--color-line)' : 0,
              }}
            >
              <V3Avatar name={t.name} tone={tone} size={42} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                  {t.role}
                </div>
              </div>
              <V3Chip tone={permInfo.tone} size="xs">
                {permInfo.label}
              </V3Chip>
              <button type="button" className="aw3-btn aw3-btn-ghost aw3-btn-sm">
                แก้ไข
              </button>
            </div>
          );
        })}
      </V3Card>
      <button
        type="button"
        className="aw3-btn aw3-btn-hero"
        style={{ marginTop: 16 }}
        onClick={() => openModal('invite')}
      >
        + เชิญสมาชิก
      </button>
    </div>
  );
}
