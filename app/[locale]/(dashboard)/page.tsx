'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { listBatches, listCustomers, getContinueWatching } from '@/lib/api';
import { useModal } from '@/lib/store/modal';
import { V3Card } from '@/components/aw/v3-card';
import { V3Section } from '@/components/aw/v3-section';
import { V3Grid, V3Col } from '@/components/aw/v3-grid';
import { V3Chip } from '@/components/aw/v3-chip';
import { V3Avatar } from '@/components/aw/v3-avatar';
import { V3RoundBtn } from '@/components/aw/v3-round-btn';
import { V3Photo } from '@/components/aw/v3-photo';
import { deriveDashboardStats } from '@/lib/derive/dashboard-stats';

const STATS_TONES = ['lav', 'peach', 'mint'] as const;
const PHOTO_TONES = ['peach', 'lav', 'sky'] as const;
const CHIP_TONES = ['peach', 'lav', 'mint'] as const;

export default function DashboardPage() {
  const router = useRouter();
  const openModal = useModal((s) => s.open);

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: listCustomers,
  });
  const { data: batches = [] } = useQuery({
    queryKey: ['batches'],
    queryFn: listBatches,
  });
  const { data: watching = [] } = useQuery({
    queryKey: ['continue-watching'],
    queryFn: () => getContinueWatching(3),
  });

  const continueWatching = watching.map((c, i) => ({
    ...c,
    tone: PHOTO_TONES[i],
    // Real latest batch reference for this customer (no hardcoded literal).
    chip: c.batchRef ? `ล็อต ${c.batchRef}` : 'ยังไม่มีล็อต',
    chipTone: CHIP_TONES[i],
  }));

  const stats = deriveDashboardStats(customers, batches);
  const restockPLk = Math.round(stats.restockPL / 1000);

  const STATS = [
    {
      tone: 'lav',
      icon: '⌬',
      label: 'ล็อตที่กำลังเลี้ยง',
      value: `${stats.activeCycles}/${stats.totalCustomers}`,
      sub: `ลูกค้า ${stats.totalCustomers} ฟาร์ม`,
      goto: () => router.push('/batches'),
    },
    {
      tone: 'peach',
      icon: '◇',
      label: 'D30 อัตรารอดเฉลี่ย',
      value: stats.avgD30 !== null ? `${stats.avgD30}%` : '—',
      sub: 'อัตรารอดเฉลี่ยจากล็อตล่าสุด',
      goto: () => router.push('/scorecard'),
    },
    {
      tone: 'mint',
      icon: '◈',
      label: 'ต้องสั่งใหม่ใน 14 วัน',
      value: `${stats.restockCount} ฟาร์ม`,
      sub: restockPLk > 0 ? `รวม ~${restockPLk}k PL` : 'ไม่มีฟาร์มที่ต้องสั่ง',
      goto: () => router.push('/restock'),
    },
  ];

  return (
    <div>
      {/* Hero */}
      <div
        style={{
          background:
            'linear-gradient(135deg, #004AAD 0%, #1A66C7 60%, #3D85DD 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: 40,
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 28,
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 600 200"
          preserveAspectRatio="xMaxYMid slice"
          style={{ position: 'absolute', inset: 0, opacity: 0.6 }}
        >
          {[
            { x: 380, y: 50, s: 1.4 },
            { x: 460, y: 110, s: 1.0 },
            { x: 540, y: 60, s: 0.7 },
            { x: 420, y: 150, s: 0.5 },
            { x: 500, y: 30, s: 0.4 },
          ].map((s, i) => (
            <g key={i} transform={`translate(${s.x},${s.y}) scale(${s.s})`}>
              <path
                d="M0 -30 Q 6 -6, 30 0 Q 6 6, 0 30 Q -6 6, -30 0 Q -6 -6, 0 -30Z"
                fill="rgba(255,255,255,0.35)"
              />
            </g>
          ))}
          <path
            d="M-20 180 Q 100 140, 220 170 T 460 175"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="2"
            fill="none"
          />
        </svg>
        <div style={{ position: 'relative', maxWidth: 540 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            ระบบจัดการโรงเพาะฟาร์ม
          </div>
          <h1
            style={{
              margin: 0,
              color: '#fff',
              fontSize: 38,
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
            }}
          >
            ช่วยลูกค้าเลี้ยงรอบนี้
            <br />
            ให้รอดมากที่สุด
          </h1>
          <div style={{ display: 'flex', gap: 10, marginTop: 48 }}>
            <button
              type="button"
              onClick={() => router.push('/restock')}
              className="aw3-btn"
              style={{
                background: '#fff',
                color: 'var(--color-ink)',
                fontSize: 16,
                padding: '14px 24px',
              }}
            >
              ดูฟาร์มที่ต้องติดต่อ →
            </button>
            <button
              type="button"
              onClick={() => openModal('addBatch')}
              className="aw3-btn"
              style={{
                background: 'rgba(255,255,255,0.18)',
                color: '#fff',
                fontSize: 16,
                padding: '14px 22px',
                backdropFilter: 'blur(4px)',
              }}
            >
              + ลงล็อตใหม่
            </button>
          </div>
        </div>
      </div>

      {/* Stat chips */}
      <V3Grid cols={3} gap={16} style={{ marginBottom: 28 }}>
        {STATS.map((s, i) => (
          <V3Card
            key={i}
            pad={20}
            hover
            onClick={s.goto}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              border: '1.5px solid var(--color-line-2)',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius)',
                background: `var(--color-${s.tone})`,
                color: `var(--color-${s.tone}-fg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {s.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--color-ink-3)',
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--color-ink-4)',
                  fontWeight: 500,
                  marginTop: 4,
                }}
              >
                {s.sub}
              </div>
            </div>
          </V3Card>
        ))}
      </V3Grid>

      {/* Continue Watching */}
      <V3Section
        title="ฟาร์มที่ต้องตามต่อ"
        action={
          <button
            type="button"
            className="aw3-btn aw3-btn-ghost aw3-btn-sm"
            onClick={() => router.push('/customers')}
          >
            ดูทั้งหมด
          </button>
        }
      >
        <V3Grid cols={3} gap={16}>
          {continueWatching.map((c) => (
            <V3Card
              key={c.customerId}
              pad={14}
              hover
              onClick={() => router.push(`/customers/${c.customerId}` as never)}
              style={{ border: '1px solid var(--color-line)' }}
            >
              <div style={{ position: 'relative' }}>
                <V3Photo tone={c.tone} height={140} label={`วันที่ ${c.cycleDay}/120`} />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const full = customers.find((x) => x.id === c.customerId);
                    if (full) openModal('sendLine', { customer: full });
                  }}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: '#fff',
                    border: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  }}
                >
                  💬
                </button>
              </div>
              <div style={{ padding: '14px 4px 4px' }}>
                <V3Chip tone={c.chipTone} size="xs" icon="✦">
                  {c.chip}
                </V3Chip>
                <h3
                  style={{
                    margin: '12px 0 0',
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: 1.3,
                  }}
                >
                  {c.farm}
                </h3>
                <div
                  style={{
                    marginTop: 10,
                    height: 4,
                    background: 'var(--color-line)',
                    borderRadius: 'var(--radius-pill)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${((c.cycleDay ?? 0) / 120) * 100}%`,
                      height: '100%',
                      background: 'var(--color-hero)',
                      borderRadius: 'var(--radius-pill)',
                    }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: '1px solid var(--color-line)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <V3Avatar name={c.name} size={28} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--color-ink-4)' }}>
                      {c.zone}
                    </div>
                  </div>
                </div>
              </div>
            </V3Card>
          ))}
        </V3Grid>
      </V3Section>

      {/* Recent batches */}
      <V3Section
        title="ล็อตล่าสุด"
        action={
          <button
            type="button"
            className="aw3-btn aw3-btn-ghost aw3-btn-sm"
            onClick={() => router.push('/batches')}
          >
            ดูทั้งหมด
          </button>
        }
      >
        <V3Card pad={0} style={{ border: '1px solid var(--color-line)', overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.4fr 1.6fr 80px',
              padding: '12px 20px',
              background: 'var(--color-soft)',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--color-ink-4)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            <span>ล็อต</span>
            <span>สายพันธุ์</span>
            <span>ผล</span>
            <span style={{ textAlign: 'right' }}>เปิด</span>
          </div>
          {batches.slice(0, 4).map((b, i, arr) => (
            <div
              key={b.id}
              className="aw3-row"
              onClick={() => router.push(`/batches/${b.id}` as never)}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.4fr 1.6fr 80px',
                padding: '14px 20px',
                alignItems: 'center',
                gap: 10,
                borderBottom: i < arr.length - 1 ? '1px solid var(--color-line)' : 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <V3Avatar
                  name={b.id}
                  tone={(['lav', 'peach', 'mint', 'sky'] as const)[i % 4]}
                  size={36}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{b.id}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-ink-4)' }}>
                    {b.date}
                  </div>
                </div>
              </div>
              <V3Chip
                tone={(['lav', 'peach', 'mint', 'sky'] as const)[i % 4]}
                size="xs"
              >
                {b.source}
              </V3Chip>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <V3Chip tone={b.pcr === 'clean' ? 'good' : 'bad'} size="xs">
                  PCR {b.pcr === 'clean' ? 'สะอาด' : 'พบเชื้อ'}
                </V3Chip>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--color-ink-2)',
                  }}
                >
                  D30 {b.meanD30}%
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <V3RoundBtn dir="right" size={30} tone="soft" />
              </div>
            </div>
          ))}
        </V3Card>
      </V3Section>
    </div>
  );
}
