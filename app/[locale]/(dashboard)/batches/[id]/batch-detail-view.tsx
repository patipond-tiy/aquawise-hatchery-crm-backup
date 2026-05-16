'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { getBatch } from '@/lib/api';
import { generatePcrCertPdfAction } from '../actions';
import { useModal } from '@/lib/store/modal';
import { V3Card } from '@/components/aw/v3-card';
import { V3Grid, V3Col } from '@/components/aw/v3-grid';
import { V3Chip } from '@/components/aw/v3-chip';
import { V3Avatar } from '@/components/aw/v3-avatar';
import { V3Section } from '@/components/aw/v3-section';
import { V3DistChart } from '@/components/aw/charts/v3-dist-chart';
import { Icon } from '@/components/aw/icon';

const DIST_LABELS = [
  '0-10',
  '10-20',
  '20-30',
  '30-40',
  '40-50',
  '50-60',
  '60-70',
  '70-80',
  '80-90',
  '90-100',
];
const TONES = ['lav', 'peach', 'mint', 'sky', 'rose', 'amber'] as const;

function histogram(d30s: number[]): number[] {
  const bins = new Array(10).fill(0);
  for (const v of d30s) {
    const idx = Math.min(9, Math.max(0, Math.floor(v / 10)));
    bins[idx] += 1;
  }
  return bins;
}

export function BatchDetailView({ id }: { id: string }) {
  const router = useRouter();
  const openModal = useModal((s) => s.open);
  const [pending, startTransition] = useTransition();
  const [generating, setGenerating] = useState(false);

  const { data: b } = useQuery({
    queryKey: ['batch', id],
    queryFn: () => getBatch(id),
  });

  if (!b) {
    return (
      <div style={{ padding: 40, color: 'var(--color-ink-4)' }}>
        กำลังโหลด…
      </div>
    );
  }

  const d30s = b.buyers
    .map((x) => x.d30)
    .filter((v): v is number => v != null);
  const soldPl = b.buyers.reduce((a, x) => a + x.plPurchased, 0);

  const STATS: {
    label: string;
    value: string;
    sub: string;
    tone: 'lav' | 'sky' | 'mint' | 'good' | 'amber';
  }[] = [
    {
      label: 'ผลิต',
      value: `${(b.plProduced / 1_000_000).toFixed(1)}M`,
      sub: 'PL ทั้งหมด',
      tone: 'lav',
    },
    {
      label: 'จำหน่ายแล้ว',
      value: `${(soldPl / 1_000_000).toFixed(2)}M`,
      sub: `${b.plProduced ? Math.round((soldPl / b.plProduced) * 100) : 0}% ของล็อต`,
      tone: 'sky',
    },
    {
      label: 'ผู้ซื้อ',
      value: b.buyers.length ? String(b.buyers.length) : '—',
      sub: 'ตามสายไปได้',
      tone: 'mint',
    },
    {
      label: 'D30 เฉลี่ย',
      value: d30s.length ? `${b.meanD30}%` : '—',
      sub: d30s.length ? (b.meanD30 >= 80 ? 'เกินเป้า' : 'ต่ำกว่าเป้า') : 'ยังไม่มีข้อมูล',
      tone: d30s.length && b.meanD30 >= 80 ? 'good' : 'amber',
    },
  ];

  const printCert = () => {
    setGenerating(true);
    startTransition(async () => {
      try {
        const { pdfUrl } = await generatePcrCertPdfAction(b.id);
        if (pdfUrl.startsWith('mock://')) {
          toast.success(`สร้างใบรับรองล็อต ${b.id} แล้ว`);
        } else {
          window.open(pdfUrl, '_blank');
          toast.success(`สร้างใบรับรองล็อต ${b.id} แล้ว`);
        }
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : 'สร้างใบรับรองไม่สำเร็จ'
        );
      } finally {
        setGenerating(false);
      }
    });
  };

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
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Icon name="chevron-left" size={14} />
        ล็อตทั้งหมด
      </button>

      <V3Card
        pad={28}
        style={{ border: '1px solid var(--color-line)', marginBottom: 20 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            flexWrap: 'wrap',
          }}
        >
          <V3Avatar
            name={b.id}
            size={68}
            tone={b.pcr === 'clean' ? 'mint' : 'rose'}
          />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
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
              <V3Chip
                tone={
                  b.pcr === 'clean'
                    ? 'good'
                    : b.pcr === 'flagged'
                      ? 'bad'
                      : 'soft'
                }
                size="xs"
              >
                PCR{' '}
                {b.pcr === 'clean'
                  ? 'ผ่าน'
                  : b.pcr === 'flagged'
                    ? 'พบเชื้อ'
                    : 'รอผล'}
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
              onClick={printCert}
              disabled={pending || generating}
            >
              {generating ? 'กำลังสร้างใบรับรอง...' : 'พิมพ์ใบรับรอง'}
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
          <V3Card
            key={i}
            pad={18}
            style={{ border: '1px solid var(--color-line)' }}
          >
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
          <V3Card
            pad={24}
            style={{ border: '1px solid var(--color-line)' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                การกระจาย D30 ของผู้ซื้อ
              </h3>
              <V3Chip tone="soft" size="xs">
                {b.buyers.length} ฟาร์ม
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
            {d30s.length >= 3 ? (
              <V3DistChart
                values={histogram(d30s)}
                labels={DIST_LABELS}
                height={170}
              />
            ) : (
              <div
                style={{
                  padding: '40px 0',
                  textAlign: 'center',
                  color: 'var(--color-ink-4)',
                  fontSize: 13,
                }}
              >
                ข้อมูลไม่เพียงพอสำหรับการแสดงกราฟ
              </div>
            )}
          </V3Card>
        </V3Col>
        <V3Col span={5}>
          <V3Card
            pad={22}
            style={{
              border: '1px solid var(--color-line)',
              height: '100%',
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              ผลตรวจ PCR
            </h3>
            {b.pcrResults.length === 0 ? (
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--color-ink-4)',
                  marginTop: 14,
                }}
              >
                ยังไม่มีผลตรวจ PCR
              </div>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--color-ink-3)',
                    marginTop: 4,
                    marginBottom: 18,
                  }}
                >
                  ห้องปฏิบัติการ {b.pcrResults[0]?.lab ?? '—'}
                </div>
                {b.pcrResults.map((p, i) => {
                  const flagged = p.status === 'positive';
                  const pendingResult = p.status === 'pending';
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 0',
                        borderTop:
                          i > 0 ? '1px solid var(--color-line)' : 0,
                      }}
                    >
                      <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>
                        {p.disease}
                      </div>
                      <V3Chip
                        tone={
                          flagged
                            ? 'bad'
                            : pendingResult
                              ? 'soft'
                              : 'good'
                        }
                        size="xs"
                      >
                        {flagged
                          ? 'พบเชื้อ'
                          : pendingResult
                            ? 'รอผล'
                            : 'ไม่พบเชื้อ'}
                      </V3Chip>
                    </div>
                  );
                })}
              </>
            )}
          </V3Card>
        </V3Col>
      </V3Grid>

      <V3Section title="ฟาร์มที่ซื้อล็อตนี้" style={{ marginTop: 28 }}>
        <V3Card
          pad={0}
          style={{
            border: '1px solid var(--color-line)',
            overflow: 'hidden',
          }}
        >
          {b.buyers.length === 0 ? (
            <div
              style={{
                padding: 40,
                textAlign: 'center',
                color: 'var(--color-ink-4)',
                fontSize: 13,
              }}
            >
              ยังไม่มีข้อมูลการจำหน่าย
            </div>
          ) : (
            b.buyers.map((c, i) => (
              <div
                key={c.customerId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1.6fr 1fr 1fr',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 20px',
                  borderBottom:
                    i < b.buyers.length - 1
                      ? '1px solid var(--color-line)'
                      : 0,
                }}
              >
                <V3Avatar
                  name={c.farm}
                  tone={TONES[i % TONES.length]}
                  size={36}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>
                    {c.farm}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--color-ink-4)',
                    }}
                  >
                    {c.zone}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--color-ink-4)',
                      fontWeight: 600,
                    }}
                  >
                    จำนวน PL
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {c.plPurchased.toLocaleString('th-TH')}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--color-ink-4)',
                      fontWeight: 600,
                    }}
                  >
                    D30
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color:
                        c.d30 == null
                          ? 'var(--color-ink-4)'
                          : c.d30 >= 80
                            ? 'var(--color-good)'
                            : c.d30 < 70
                              ? 'var(--color-bad)'
                              : 'var(--color-ink)',
                    }}
                  >
                    {c.d30 != null ? `${c.d30}%` : '—'}
                  </div>
                </div>
              </div>
            ))
          )}
        </V3Card>
      </V3Section>
    </div>
  );
}
