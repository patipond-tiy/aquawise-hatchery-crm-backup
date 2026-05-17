'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { listCustomers, listBatches, listTeam, getCurrentUser } from '@/lib/api';
import { deriveD30Trend } from '@/lib/derive/d30-trend';
import { V3Avatar } from '@/components/aw/v3-avatar';
import { V3Chip } from '@/components/aw/v3-chip';
import { V3Ring } from '@/components/aw/v3-ring';
import { V3RoundBtn } from '@/components/aw/v3-round-btn';
import { V3Sparkline } from '@/components/aw/charts/v3-sparkline';

const TEAM_TONES = ['mint', 'sky', 'rose', 'lav', 'peach', 'amber'] as const;
type AvatarTone = (typeof TEAM_TONES)[number];
const FOLLOW_UP_TONES = ['lav', 'peach', 'mint'] as const;

function toAvatarTone(tone: string | undefined, i: number): AvatarTone {
  return (TEAM_TONES as readonly string[]).includes(tone ?? '')
    ? (tone as AvatarTone)
    : TEAM_TONES[i % TEAM_TONES.length];
}

export function RightRail() {
  const t = useTranslations();
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: listCustomers,
  });
  const { data: batches = [] } = useQuery({
    queryKey: ['batches'],
    queryFn: () => listBatches(),
  });
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
  });
  const { data: team = [] } = useQuery({
    queryKey: ['team'],
    queryFn: listTeam,
  });
  const displayName = user?.displayName ?? '';
  const trend = deriveD30Trend(batches);
  const followUps = customers
    .filter((c) => c.restockIn != null && c.restockIn <= 14)
    .slice(0, 3);

  return (
    <aside
      className="aw3-scroll p-5 px-[22px] py-7 border-l"
      style={{
        borderColor: 'var(--color-line)',
        height: '100%',
        minHeight: 0,
        overflowY: 'auto',
      }}
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

      {/* Progress ring — bound to the latest real mean-D30 survival rate */}
      <div className="flex justify-center relative" style={{ marginBottom: 14 }}>
        <V3Ring
          value={trend.latest ?? 0}
          size={170}
          stroke={9}
          color="var(--color-hero)"
        >
          <V3Avatar name={displayName || '·'} tone="lav" size={130} />
        </V3Ring>
        {trend.latest != null && (
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
            {trend.latest}%
          </div>
        )}
      </div>

      <div className="text-center mb-2">
        <div className="text-lg font-bold">
          {displayName ? t('user.greeting', { name: displayName }) : ' '}
        </div>
        <div
          className="text-sm mt-1.5 px-2"
          style={{ color: 'var(--color-ink-3)' }}
        >
          เป้าหมาย D30 อัตรารอด 80% ของไตรมาสนี้
        </div>
      </div>

      {/* D30 trend sparkline */}
      <div
        style={{
          background: 'var(--color-soft)',
          borderRadius: 'var(--radius-lg)',
          padding: 16,
          marginTop: 18,
          marginBottom: 22,
        }}
      >
        <div className="flex justify-between items-center" style={{ marginBottom: 4 }}>
          <div className="eyebrow">D30 — {trend.series.length} ล็อตล่าสุด</div>
          {trend.deltaPct != null && (
            <V3Chip tone={trend.deltaPct >= 0 ? 'good' : 'bad'} size="xs">
              {trend.deltaPct >= 0 ? '+' : ''}
              {trend.deltaPct}%
            </V3Chip>
          )}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--color-ink-4)',
            marginBottom: 8,
          }}
        >
          เลื่อนเมาส์ดูแต่ละล็อต
        </div>
        {trend.series.length > 0 ? (
          <V3Sparkline values={trend.series} height={70} />
        ) : (
          <div
            style={{
              height: 70,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: 'var(--color-ink-4)',
            }}
          >
            ยังไม่มีข้อมูล D30
          </div>
        )}
      </div>

      {/* Follow-ups */}
      <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
        <h3 className="m-0 text-[15px] font-bold">{t('user.follow_ups')}</h3>
        <V3RoundBtn dir="right" size={28} />
      </div>
      <div className="flex flex-col gap-2">
        {followUps.map((c, i) => (
          <div
            key={c.id}
            className="flex items-center gap-2.5"
            style={{
              padding: 10,
              borderRadius: 'var(--radius)',
              background:
                i === 0
                  ? 'var(--color-hero-soft)'
                  : 'var(--color-soft)',
            }}
          >
            <V3Avatar
              name={c.farm}
              tone={FOLLOW_UP_TONES[i] ?? 'lav'}
              size={36}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {c.farm}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-ink-3)' }}>
                {c.restockIn === 0 ? 'ตอนนี้' : `ใน ${c.restockIn} วัน`} · {c.zone}
              </div>
            </div>
            <button
              type="button"
              className="aw3-btn aw3-btn-soft aw3-btn-sm"
              style={{ padding: '5px 11px' }}
            >
              ติดต่อ
            </button>
          </div>
        ))}
        {followUps.length === 0 && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-ink-4)',
              textAlign: 'center',
              padding: 12,
            }}
          >
            ไม่มีฟาร์มที่ต้องติดต่อในช่วง 14 วันนี้
          </div>
        )}
        <button
          type="button"
          className="aw3-btn aw3-btn-ghost"
          style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
        >
          ดูทั้งหมด
        </button>
      </div>

      {/* Team */}
      <div
        className="flex justify-between items-center"
        style={{ marginTop: 28, marginBottom: 12 }}
      >
        <h3 className="m-0 text-[15px] font-bold">{t('user.your_team')}</h3>
        <V3RoundBtn dir="right" size={28} />
      </div>
      <div className="flex flex-col gap-2">
        {team.map((m, i) => (
          <div
            key={`${m.name}-${i}`}
            className="flex items-center gap-2.5"
            style={{ padding: 4 }}
          >
            <V3Avatar
              name={m.name}
              tone={toAvatarTone(m.tone, i)}
              size={36}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: 'var(--color-ink-3)' }}>
                {m.role}
              </div>
            </div>
            <button
              type="button"
              className="aw3-btn aw3-btn-soft aw3-btn-sm"
              style={{ padding: '4px 10px' }}
            >
              ทักทาย
            </button>
          </div>
        ))}
        {team.length === 0 && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-ink-4)',
              textAlign: 'center',
              padding: 12,
            }}
          >
            ยังไม่มีสมาชิกในทีม
          </div>
        )}
      </div>
    </aside>
  );
}
