'use client';

import { use } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { getBatch } from '@/lib/api';
import { CUSTOMERS } from '@/lib/mock/data';
import { useModal } from '@/lib/store/modal';
import { V3Card } from '@/components/aw/v3-card';
import { V3Grid, V3Col } from '@/components/aw/v3-grid';
import { V3Chip } from '@/components/aw/v3-chip';
import { V3Avatar } from '@/components/aw/v3-avatar';
import { V3Section } from '@/components/aw/v3-section';
import { V3RoundBtn } from '@/components/aw/v3-round-btn';
import { V3DistChart } from '@/components/aw/charts/v3-dist-chart';

const DIST_LABELS = [
  '<50',
  '50-55',
  '55-60',
  '60-65',
  '65-70',
  '70-75',
  '75-80',
  '80-85',
  '85-90',
  '>90',
];
const DISEASES = ['WSSV', 'EHP', 'IHHNV', 'TSV'] as const;
const TONES = ['lav', 'peach', 'mint', 'sky', 'rose', 'amber'] as const;

export default function BatchDetailPage({
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
  const { data: b, isLoading } = useQuery({
    queryKey: ['batch', id],
    queryFn: () => getBatch(id),
  });

  if (isLoading || !b) {
    return <div style={{ padding: 40, color: 'var(--color-ink-4)' }}>กำลังโหลด…</div>;
  }

  const buyers = CUSTOMERS.slice(0, b.farms);

  const STATS: { label: string; value: string; sub: string; tone: 'lav' | 'sky' | 'mint' | 'good' | 'amber' }[] = [
    { label: 'ผลิต', value: `${(b.plProduced / 1_000_000).toFixed(1)}M`, sub: 'PL ทั้งหมด', tone: 'lav' },
    {
      label: 'ขายแล้ว',
      value: `${(b.plSold / 1_000_000).toFixed(1)}M`,
      sub: `${Math.round((b.plSold / b.plProduced) * 100)}% ของล็อต`,
      tone: 'sky',
    },
    { label: 'ฟาร์มที่ซื้อ', value: String(b.farms), sub: 'ตามสายไปได้', tone: 'mint' },
    {
      label: 'D30 เฉลี่ย',
      value: `${b.meanD30}%`,
      sub: b.meanD30 >= 80 ? 'เกินเป้า' : 'ต่ำกว่าเป้า',
      tone: b.meanD30 >= 80 ? 'good' : 'amber',
    },
  ];

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push('/batches')}
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
        ← ล็อตทั้งหมด
      </button>

      <V3Card pad={28} style={{ border: '1px solid var(--color-line)', marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            flexWrap: 'wrap',
          }}
        >
          <V3Avatar name={b.id} size={68} tone={b.pcr === 'clean' ? 'mint' : 'rose'} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                }}
              >
                ล็อต {b.id}
              </h1>
              <V3Chip tone={b.pcr === 'clean' ? 'good' : 'bad'} size="xs">
                PCR {b.pcr === 'clean' ? '✓ สะอาด' : '⚠ พบเชื้อ'}
              </V3Chip>
            </div>
            <div
              style={{
                fontSize: 14,
                color: 'var(--color-ink-3)',
                marginTop: 4,
              }}
            >
              ลงวันที่ {b.date} · {b.source}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="aw3-btn aw3-btn-soft"
              onClick={() => toast.success(`พิมพ์ใบรับรอง ${b.id} แล้ว`)}
            >
              พิมพ์ใบรับรอง
            </button>
            <button
              type="button"
              className="aw3-btn aw3-btn-hero"
              onClick={() => openModal('cert', { batch: b })}
            >
              ส่งใบรับรอง LINE
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
                marginTop: 12,
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--color-ink-4)',
                marginTop: 6,
              }}
            >
              {s.sub}
            </div>
          </V3Card>
        ))}
      </V3Grid>

      <V3Grid cols={12} gap={20}>
        <V3Col span={7}>
          <V3Card pad={24} style={{ border: '1px solid var(--color-line)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                การกระจายของอัตรารอด D30
              </h3>
              <V3Chip tone="soft" size="xs">
                {b.farms} ฟาร์ม
              </V3Chip>
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: 'var(--color-ink-3)',
                marginBottom: 18,
              }}
            >
              แต่ละแท่งคือจำนวนฟาร์มในช่วงอัตรารอดนั้น
            </div>
            <V3DistChart values={b.dist} labels={DIST_LABELS} height={170} />
          </V3Card>
        </V3Col>
        <V3Col span={5}>
          <V3Card pad={22} style={{ border: '1px solid var(--color-line)', height: '100%' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>ผลตรวจ PCR</h3>
            <div
              style={{
                fontSize: 12,
                color: 'var(--color-ink-3)',
                marginTop: 4,
                marginBottom: 18,
              }}
            >
              ตรวจวันที่ {b.date} · ห้องปฏิบัติการ DOFR
            </div>
            {DISEASES.map((d, i) => {
              const flagged = b.pcr !== 'clean' && d === 'EHP';
              return (
                <div
                  key={d}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 0',
                    borderTop: i > 0 ? '1px solid var(--color-line)' : 0,
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: flagged
                        ? 'var(--color-bad-tint)'
                        : 'var(--color-good-tint)',
                      color: flagged ? 'var(--color-bad)' : 'var(--color-good)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    {flagged ? '⚠' : '✓'}
                  </div>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{d}</div>
                  <V3Chip tone={flagged ? 'bad' : 'good'} size="xs">
                    {flagged ? 'พบเชื้อ' : 'ไม่พบเชื้อ'}
                  </V3Chip>
                </div>
              );
            })}
          </V3Card>
        </V3Col>
      </V3Grid>

      <V3Section title="ฟาร์มที่ซื้อล็อตนี้" style={{ marginTop: 28 }}>
        <V3Card pad={0} style={{ border: '1px solid var(--color-line)', overflow: 'hidden' }}>
          {buyers.map((c, i) => (
            <div
              key={c.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '50px 1.5fr 1fr 1fr 1fr 80px',
                alignItems: 'center',
                gap: 14,
                padding: '14px 20px',
                borderBottom: i < buyers.length - 1 ? '1px solid var(--color-line)' : 0,
              }}
            >
              <V3Avatar name={c.farm} tone={TONES[i % TONES.length]} size={36} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{c.farm}</div>
                <div style={{ fontSize: 11, color: 'var(--color-ink-4)' }}>{c.zone}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-ink-4)', fontWeight: 600 }}>
                  ซื้อ
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{180 + i * 30}k PL</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-ink-4)', fontWeight: 600 }}>
                  D30
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color:
                      c.d30 == null
                        ? 'var(--color-ink)'
                        : c.d30 >= 80
                          ? 'var(--color-good)'
                          : c.d30 < 70
                            ? 'var(--color-bad)'
                            : 'var(--color-ink)',
                  }}
                >
                  {c.d30 ? `${c.d30}%` : 'รอ'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-ink-4)', fontWeight: 600 }}>
                  สถานะ
                </div>
                <V3Chip tone={c.cycleDay ? 'sky' : 'soft'} size="xs">
                  {c.cycleDay ? `วันที่ ${c.cycleDay}` : 'จบรอบ'}
                </V3Chip>
              </div>
              <V3RoundBtn dir="right" size={30} tone="soft" />
            </div>
          ))}
        </V3Card>
      </V3Section>
    </div>
  );
}
