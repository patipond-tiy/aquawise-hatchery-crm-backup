'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { listBatches } from '@/lib/api';
import { useModal } from '@/lib/store/modal';
import { V3Card } from '@/components/aw/v3-card';
import { V3Grid } from '@/components/aw/v3-grid';
import { V3Chip } from '@/components/aw/v3-chip';
import { V3Avatar } from '@/components/aw/v3-avatar';

const TONES = ['lav', 'peach', 'mint', 'sky', 'rose'] as const;

export default function BatchesPage() {
  const router = useRouter();
  const openModal = useModal((s) => s.open);
  const { data: batches = [] } = useQuery({
    queryKey: ['batches'],
    queryFn: listBatches,
  });

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>ล็อตลูกกุ้ง</h1>
        <button
          type="button"
          className="aw3-btn aw3-btn-hero aw3-btn-sm"
          onClick={() => openModal('addBatch')}
        >
          + ลงทะเบียนล็อตใหม่
        </button>
      </div>
      <V3Grid cols={2} gap={14}>
        {batches.map((b, i) => (
          <V3Card
            key={b.id}
            pad={18}
            hover
            onClick={() => router.push({ pathname: '/batches/[id]', params: { id: b.id } } as never)}
            style={{ border: '1px solid var(--color-line)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <V3Avatar name={b.id} tone={TONES[i % TONES.length]} size={42} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{b.id}</div>
                <div style={{ fontSize: 11, color: 'var(--color-ink-4)' }}>
                  {b.date} · {b.source}
                </div>
              </div>
              <V3Chip tone={b.pcr === 'clean' ? 'good' : 'bad'} size="xs">
                {b.pcr === 'clean' ? '✓ สะอาด' : '⚠ พบเชื้อ'}
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
                  ฟาร์ม
                </div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{b.farms}</div>
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
                        : b.meanD30 < 70
                          ? 'var(--color-bad)'
                          : 'var(--color-ink)',
                  }}
                >
                  {b.meanD30 || '—'}%
                </div>
              </div>
            </V3Grid>
          </V3Card>
        ))}
      </V3Grid>
    </div>
  );
}
