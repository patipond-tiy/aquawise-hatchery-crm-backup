'use client';

import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { listCustomers, getNursery } from '@/lib/api';
import { useModal } from '@/lib/store/modal';
import type { Customer } from '@/lib/types';
import { V3Card } from '@/components/aw/v3-card';
import { V3Grid } from '@/components/aw/v3-grid';
import { V3Chip } from '@/components/aw/v3-chip';
import { V3Avatar } from '@/components/aw/v3-avatar';
import { V3Section } from '@/components/aw/v3-section';

type Group = {
  id: string;
  label: string;
  tone: 'bad' | 'amber' | 'sky' | 'lav';
  icon: string;
  items: Customer[];
};

const TONES = ['lav', 'peach', 'mint', 'sky', 'rose', 'amber'] as const;

export default function RestockPage() {
  const router = useRouter();
  const openModal = useModal((s) => s.open);
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: listCustomers,
  });
  const { data: nursery } = useQuery({
    queryKey: ['nursery'],
    queryFn: getNursery,
  });

  const thresholds = nursery?.restockThresholds ?? { now: 0, week: 14, month: 45 };

  const due = customers
    .filter((c) => c.restockIn != null)
    .sort((a, b) => (a.restockIn ?? 0) - (b.restockIn ?? 0));

  const groups: Group[] = [
    {
      id: 'now',
      label: 'วันนี้',
      tone: 'bad',
      icon: '⚠',
      items: due.filter((c) => (c.restockIn ?? 0) <= thresholds.now),
    },
    {
      id: 'week',
      label: 'สัปดาห์นี้',
      tone: 'amber',
      icon: '◔',
      items: due.filter(
        (c) => (c.restockIn ?? 0) > thresholds.now && (c.restockIn ?? 0) <= thresholds.week
      ),
    },
    {
      id: 'month',
      label: 'เดือนนี้',
      tone: 'sky',
      icon: '◐',
      items: due.filter(
        (c) => (c.restockIn ?? 0) > thresholds.week && (c.restockIn ?? 0) <= thresholds.month
      ),
    },
    {
      id: 'later',
      label: 'หลังจากนั้น',
      tone: 'lav',
      icon: '◯',
      items: due.filter((c) => (c.restockIn ?? 0) > thresholds.month),
    },
  ];

  const totalPL = due.filter((c) => (c.restockIn ?? 0) <= 14).length * 120;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 8,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: '-0.01em',
            }}
          >
            ฟาร์มที่ใกล้ครบรอบ
          </h1>
          <div style={{ color: 'var(--color-ink-3)', fontSize: 15, marginTop: 4 }}>
            พยากรณ์จากวันลงลูกกุ้ง + ระยะเวลาเลี้ยงเฉลี่ย 110 วัน
          </div>
        </div>
        <button
          type="button"
          className="aw3-btn aw3-btn-hero"
          onClick={() =>
            toast.success(
              `ส่งข้อความถึง ${due.filter((c) => (c.restockIn ?? 0) <= 14).length} ฟาร์มแล้ว`
            )
          }
        >
          ส่งข้อความหาทุกคน
        </button>
      </div>

      <V3Grid cols={4} gap={14} style={{ marginBottom: 28, marginTop: 22 }}>
        {[
          { label: 'ติดต่อด่วน', value: groups[0].items.length, tone: 'bad' as const, sub: 'วันนี้ - พรุ่งนี้' },
          { label: 'รอบใหม่ใน 14 วัน', value: groups[1].items.length, tone: 'amber' as const, sub: `~${totalPL}k PL` },
          { label: 'อีก 14-45 วัน', value: groups[2].items.length, tone: 'sky' as const, sub: 'เริ่มเตรียมล็อต' },
          { label: 'หลังจากนั้น', value: groups[3].items.length, tone: 'lav' as const, sub: 'ติดตามต่อ' },
        ].map((s, i) => (
          <V3Card key={i} pad={18} style={{ border: '1px solid var(--color-line)' }}>
            <V3Chip tone={s.tone} size="xs">
              {s.label}
            </V3Chip>
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                marginTop: 12,
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              {s.value}{' '}
              <span
                style={{
                  fontSize: 14,
                  color: 'var(--color-ink-4)',
                  fontWeight: 600,
                }}
              >
                ฟาร์ม
              </span>
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

      {groups.map(
        (g) =>
          g.items.length > 0 && (
            <V3Section
              key={g.id}
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background:
                        g.tone === 'bad'
                          ? 'var(--color-bad-tint)'
                          : g.tone === 'amber'
                            ? 'var(--color-warn-tint)'
                            : `var(--color-${g.tone})`,
                      color:
                        g.tone === 'bad'
                          ? 'var(--color-bad)'
                          : g.tone === 'amber'
                            ? 'var(--color-warn)'
                            : `var(--color-${g.tone}-fg)`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {g.icon}
                  </span>
                  {g.label}
                  <span
                    style={{
                      color: 'var(--color-ink-4)',
                      fontWeight: 500,
                      fontSize: 14,
                    }}
                  >
                    · {g.items.length}
                  </span>
                </span>
              }
            >
              <V3Card pad={0} style={{ border: '1px solid var(--color-line)', overflow: 'hidden' }}>
                {g.items.map((c, i) => (
                  <div
                    key={c.id}
                    className="aw3-row"
                    onClick={() => router.push(`/customers/${c.id}` as never)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '50px 1.6fr 1fr 1fr 1fr auto',
                      alignItems: 'center',
                      gap: 14,
                      padding: '16px 20px',
                      borderBottom: i < g.items.length - 1 ? '1px solid var(--color-line)' : 0,
                    }}
                  >
                    <V3Avatar
                      name={c.farm}
                      tone={TONES[i % TONES.length]}
                      size={42}
                    />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{c.farm}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                        {c.name} · {c.zone}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--color-ink-4)', fontWeight: 600 }}>
                        เก็บเกี่ยว
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>
                        {(c.restockIn ?? 0) <= 0 ? 'แล้ว' : `อีก ${c.restockIn} วัน`}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--color-ink-4)', fontWeight: 600 }}>
                        รอบที่แล้ว
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{c.batches} ครั้ง</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--color-ink-4)', fontWeight: 600 }}>
                        D30 รอบล่าสุด
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
                        {c.d30 ? `${c.d30}%` : '—'}
                      </div>
                    </div>
                    <div
                      style={{ display: 'flex', gap: 6 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="aw3-btn aw3-btn-soft aw3-btn-sm"
                        onClick={() => openModal('sendLine', { customer: c })}
                      >
                        LINE
                      </button>
                      <button
                        type="button"
                        className="aw3-btn aw3-btn-hero aw3-btn-sm"
                        onClick={() => openModal('quote', { customer: c })}
                      >
                        เสนอราคา
                      </button>
                    </div>
                  </div>
                ))}
              </V3Card>
            </V3Section>
          )
      )}
    </div>
  );
}
