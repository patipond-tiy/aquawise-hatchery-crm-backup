'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { getCustomer } from '@/lib/api';
import { useModal } from '@/lib/store/modal';
import { V3Card } from '@/components/aw/v3-card';
import { V3Grid, V3Col } from '@/components/aw/v3-grid';
import { V3Chip } from '@/components/aw/v3-chip';
import { V3Avatar } from '@/components/aw/v3-avatar';
import { V3Section } from '@/components/aw/v3-section';
import { V3Sparkline } from '@/components/aw/charts/v3-sparkline';

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <Body id={id} />;
}

function Body({ id }: { id: string }) {
  const router = useRouter();
  const openModal = useModal((s) => s.open);
  const { data: c, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id),
  });

  if (isLoading || !c) {
    return <div style={{ padding: 40, color: 'var(--color-ink-4)' }}>กำลังโหลด…</div>;
  }

  const trend = c.d30
    ? [
        Math.max(40, c.d30 - 12),
        Math.max(40, c.d30 - 8),
        Math.max(40, c.d30 - 4),
        c.d30 - 2,
        c.d30 - 1,
        c.d30,
      ]
    : [60, 65, 68, 70, 75, 80];

  const HISTORY = [
    {
      batch: 'B-2604-A',
      date: '2026-04-22',
      pl: 320,
      d30: c.d30 ?? 82,
      status: c.cycleDay ? 'กำลังเลี้ยง' : 'จบ',
    },
    { batch: 'B-2511-C', date: '2025-11-18', pl: 280, d30: 78, status: 'จบ' },
    { batch: 'B-2508-B', date: '2025-08-12', pl: 250, d30: 81, status: 'จบ' },
    { batch: 'B-2505-A', date: '2025-05-04', pl: 220, d30: 73, status: 'จบ' },
  ];

  const STATS: { label: string; value: string; tone: 'lav' | 'peach' | 'good' | 'bad' | 'amber' | 'sky' }[] = [
    { label: 'รอบทั้งหมด', value: String(c.batches), tone: 'lav' },
    { label: 'มูลค่าตลอดอายุ', value: `฿${(c.ltv / 1000).toFixed(0)}k`, tone: 'peach' },
    {
      label: 'D30 รอบล่าสุด',
      value: c.d30 ? `${c.d30}%` : '—',
      tone: c.d30 == null ? 'amber' : c.d30 >= 80 ? 'good' : c.d30 < 70 ? 'bad' : 'amber',
    },
    {
      label: 'รอบใหม่ใน',
      value: c.restockIn != null ? `${c.restockIn} วัน` : '—',
      tone: 'sky',
    },
  ];

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push('/customers')}
        style={{
          background: 'transparent',
          border: 0,
          padding: 0,
          cursor: 'pointer',
          color: 'var(--color-ink-3)',
          marginBottom: 14,
          fontSize: 13,
        }}
      >
        ← ลูกค้าทั้งหมด
      </button>

      <V3Card pad={28} style={{ border: '1px solid var(--color-line)', marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            gap: 18,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <V3Avatar name={c.farm} size={68} tone="lav" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{c.farm}</h1>
            <div
              style={{
                fontSize: 14,
                color: 'var(--color-ink-3)',
                marginTop: 4,
              }}
            >
              {c.name} · {c.zone}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {c.cycleDay && (
                <V3Chip tone="sky" size="xs">
                  วันที่ {c.cycleDay}/120
                </V3Chip>
              )}
              {c.status === 'concern' && (
                <V3Chip tone="amber" size="xs">
                  น่าห่วง
                </V3Chip>
              )}
              {c.status === 'restock-now' && (
                <V3Chip tone="bad" size="xs">
                  ติดต่อด่วน
                </V3Chip>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="aw3-btn aw3-btn-soft"
              onClick={() => openModal('schedule', { customer: c })}
            >
              นัดโทร
            </button>
            <button
              type="button"
              className="aw3-btn aw3-btn-soft"
              onClick={() => openModal('quote', { customer: c })}
            >
              เสนอราคา
            </button>
            <button
              type="button"
              className="aw3-btn aw3-btn-hero"
              onClick={() => openModal('sendLine', { customer: c })}
            >
              ส่ง LINE
            </button>
          </div>
        </div>
      </V3Card>

      <V3Grid cols={4} gap={14} style={{ marginBottom: 20 }}>
        {STATS.map((s, i) => (
          <V3Card key={i} pad={18} style={{ border: '1px solid var(--color-line)' }}>
            <V3Chip tone={s.tone} size="xs">
              {s.label}
            </V3Chip>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                marginTop: 10,
                letterSpacing: '-0.02em',
              }}
            >
              {s.value}
            </div>
          </V3Card>
        ))}
      </V3Grid>

      <V3Grid cols={12} gap={20}>
        <V3Col span={7}>
          <V3Card pad={22} style={{ border: '1px solid var(--color-line)' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              แนวโน้ม D30 ตลอด 6 รอบ
            </h3>
            <div
              style={{
                fontSize: 12,
                color: 'var(--color-ink-3)',
                marginTop: 4,
                marginBottom: 18,
              }}
            >
              เลื่อนเมาส์ดูค่าแต่ละรอบ
            </div>
            <V3Sparkline values={trend} height={90} />
          </V3Card>
        </V3Col>
        <V3Col span={5}>
          <V3Card pad={22} style={{ border: '1px solid var(--color-line)', height: '100%' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>ติดต่อ</h3>
            <div style={{ marginTop: 14 }}>
              {[
                { ic: '📞', label: 'เบอร์โทร', v: '081-234-5678' },
                { ic: '💬', label: 'LINE ID', v: '@somchaisuanban' },
                { ic: '📍', label: 'ที่อยู่', v: '45 ม.3 ต.บ้านบ่อ ' + c.zone },
              ].map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '10px 0',
                    borderTop: i > 0 ? '1px solid var(--color-line)' : 0,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-soft)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                    }}
                  >
                    {r.ic}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--color-ink-4)',
                        fontWeight: 600,
                      }}
                    >
                      {r.label}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>{r.v}</div>
                  </div>
                </div>
              ))}
            </div>
          </V3Card>
        </V3Col>
      </V3Grid>

      <V3Section title="ประวัติรอบเลี้ยง" style={{ marginTop: 28 }}>
        <V3Card pad={0} style={{ border: '1px solid var(--color-line)', overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr',
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
            <span>วันที่</span>
            <span>ปริมาณ</span>
            <span>D30</span>
            <span>สถานะ</span>
          </div>
          {HISTORY.map((h, i) => (
            <div
              key={h.batch}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr',
                padding: '14px 20px',
                alignItems: 'center',
                borderBottom: i < HISTORY.length - 1 ? '1px solid var(--color-line)' : 0,
                fontSize: 13.5,
              }}
            >
              <span style={{ fontWeight: 700 }}>{h.batch}</span>
              <span style={{ color: 'var(--color-ink-3)' }}>{h.date}</span>
              <span style={{ fontWeight: 600 }}>{h.pl}k PL</span>
              <span
                style={{
                  fontWeight: 700,
                  color:
                    h.d30 >= 80
                      ? 'var(--color-good)'
                      : h.d30 < 70
                        ? 'var(--color-bad)'
                        : 'var(--color-ink)',
                }}
              >
                {h.d30}%
              </span>
              <V3Chip tone={h.status === 'จบ' ? 'soft' : 'sky'} size="xs">
                {h.status}
              </V3Chip>
            </div>
          ))}
        </V3Card>
      </V3Section>
    </div>
  );
}
