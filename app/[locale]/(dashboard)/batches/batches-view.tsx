'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useRouter, usePathname } from '@/i18n/navigation';
import { listBatches } from '@/lib/api';
import { useModal } from '@/lib/store/modal';
import type { PcrStatus } from '@/lib/types';
import { V3Card } from '@/components/aw/v3-card';
import { V3Grid } from '@/components/aw/v3-grid';
import { V3Chip } from '@/components/aw/v3-chip';
import { V3Avatar } from '@/components/aw/v3-avatar';

const TONES = ['lav', 'peach', 'mint', 'sky', 'rose'] as const;

const PCR_CHIPS: { id: PcrStatus; label: string }[] = [
  { id: 'clean', label: 'ผ่าน' },
  { id: 'flagged', label: 'พบเชื้อ' },
  { id: 'pending', label: 'รอผล' },
];

export function BatchesView({
  pcr,
  strain,
  year,
}: {
  pcr?: PcrStatus;
  strain?: string;
  year?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openModal = useModal((s) => s.open);

  const filters = { pcr, strain, year };
  const { data: batches = [] } = useQuery({
    queryKey: ['batches', filters],
    queryFn: () => listBatches(filters),
  });

  // AC #3: filter chips bind to URL query state; selecting toggles the param,
  // preserving the others. The keyed query refetches on URL change.
  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value == null || params.get(key) === value) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.push((qs ? `${pathname}?${qs}` : pathname) as never);
  };

  const strains = Array.from(new Set(batches.map((b) => b.source)));

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 18,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>
          ล็อตลูกกุ้ง
        </h1>
        <button
          type="button"
          className="aw3-btn aw3-btn-hero aw3-btn-sm"
          onClick={() => openModal('addBatch')}
        >
          + ลงทะเบียนล็อตใหม่
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 20,
        }}
      >
        {PCR_CHIPS.map((chip) => {
          const active = pcr === chip.id;
          return (
            <button
              type="button"
              key={chip.id}
              onClick={() => setParam('pcr', chip.id)}
              style={{
                padding: '7px 14px',
                border: 0,
                borderRadius: 'var(--radius-pill)',
                background: active
                  ? 'var(--color-hero)'
                  : 'var(--color-soft)',
                color: active ? '#fff' : 'var(--color-ink-2)',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {chip.label}
            </button>
          );
        })}
        {strains.map((s) => {
          const active = strain === s;
          return (
            <button
              type="button"
              key={s}
              onClick={() => setParam('strain', s)}
              style={{
                padding: '7px 14px',
                border: 0,
                borderRadius: 'var(--radius-pill)',
                background: active
                  ? 'var(--color-ink)'
                  : 'var(--color-soft)',
                color: active ? '#fff' : 'var(--color-ink-2)',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      <V3Grid cols={2} gap={14}>
        {batches.map((b, i) => (
          <V3Card
            key={b.id}
            pad={18}
            hover
            onClick={() => router.push(`/batches/${b.id}` as never)}
            style={{ border: '1px solid var(--color-line)' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 14,
              }}
            >
              <V3Avatar
                name={b.id}
                tone={TONES[i % TONES.length]}
                size={42}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{b.id}</div>
                <div
                  style={{ fontSize: 11, color: 'var(--color-ink-4)' }}
                >
                  {b.date} · {b.source}
                </div>
              </div>
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
                {b.pcr === 'clean'
                  ? 'ผ่าน'
                  : b.pcr === 'flagged'
                    ? 'พบเชื้อ'
                    : 'รอผล'}
              </V3Chip>
            </div>
            <V3Grid cols={3} gap={10}>
              <div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: 'var(--color-ink-4)',
                    fontWeight: 600,
                  }}
                >
                  ผลิต
                </div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {(b.plProduced / 1_000_000).toFixed(1)}M
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: 'var(--color-ink-4)',
                    fontWeight: 600,
                  }}
                >
                  ผู้ซื้อ
                </div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {b.farms || '—'}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: 'var(--color-ink-4)',
                    fontWeight: 600,
                  }}
                >
                  D30 เฉลี่ย
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color:
                      b.meanD30 >= 80
                        ? 'var(--color-good)'
                        : b.meanD30 > 0 && b.meanD30 < 70
                          ? 'var(--color-bad)'
                          : 'var(--color-ink)',
                  }}
                >
                  {b.meanD30 ? `${b.meanD30}%` : '—'}
                </div>
              </div>
            </V3Grid>
          </V3Card>
        ))}
        {batches.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: 60,
              textAlign: 'center',
              color: 'var(--color-ink-4)',
            }}
          >
            ไม่พบล็อตที่ตรงกับตัวกรอง
          </div>
        )}
      </V3Grid>
    </div>
  );
}
