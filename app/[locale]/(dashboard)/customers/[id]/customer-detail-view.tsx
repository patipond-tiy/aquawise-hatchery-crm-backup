'use client';

import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { getCustomer, listCallbacks } from '@/lib/api';
import { completeCallbackAction } from '../actions';
import { useModal } from '@/lib/store/modal';
import { V3Card } from '@/components/aw/v3-card';
import { V3Grid, V3Col } from '@/components/aw/v3-grid';
import { V3Chip } from '@/components/aw/v3-chip';
import { V3Avatar } from '@/components/aw/v3-avatar';
import { V3Section } from '@/components/aw/v3-section';
import { V3Sparkline } from '@/components/aw/charts/v3-sparkline';
import { Icon } from '@/components/aw/icon';

const CONTACT_ROWS = [
  { icon: 'mail', label: 'เบอร์โทร' },
  { icon: 'mail', label: 'LINE ID' },
  { icon: 'home', label: 'ที่อยู่' },
] as const;

function fmtThaiDateTime(iso: string): string {
  return new Date(iso).toLocaleString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CustomerDetailView({ id }: { id: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const openModal = useModal((s) => s.open);

  const { data: c } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id),
  });
  const { data: callbacks = [] } = useQuery({
    queryKey: ['callbacks', id],
    queryFn: () => listCallbacks(id),
  });

  const complete = useMutation({
    mutationFn: (callbackId: string) => completeCallbackAction(callbackId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['callbacks', id] });
      toast.success('ทำเครื่องหมายว่าเสร็จแล้ว');
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'ไม่สำเร็จ'),
  });

  if (!c) {
    return (
      <div style={{ padding: 40, color: 'var(--color-ink-4)' }}>
        กำลังโหลด…
      </div>
    );
  }

  // AC #3: real D30 series from customer_cycle_history (oldest→newest for the
  // sparkline). Empty state when there is no history.
  const trend = [...c.cycleHistory]
    .reverse()
    .map((h) => h.d30)
    .filter((v): v is number => v != null);

  const STATS: {
    label: string;
    value: string;
    tone: 'lav' | 'peach' | 'good' | 'bad' | 'amber' | 'sky';
  }[] = [
    { label: 'รอบทั้งหมด', value: String(c.batches), tone: 'lav' },
    {
      label: 'มูลค่าตลอดอายุ',
      value: `฿${(c.ltv / 1000).toFixed(0)}k`,
      tone: 'peach',
    },
    {
      label: 'D30 รอบล่าสุด',
      value: c.d30 ? `${c.d30}%` : '—',
      tone:
        c.d30 == null
          ? 'amber'
          : c.d30 >= 80
            ? 'good'
            : c.d30 < 70
              ? 'bad'
              : 'amber',
    },
    {
      label: 'รอบใหม่ใน',
      value: c.restockIn != null ? `${c.restockIn} วัน` : '—',
      tone: 'sky',
    },
  ];

  const contactValues = [
    c.phone ?? '—',
    c.lineId ?? '—',
    c.address ?? '—',
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
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Icon name="chevron-left" size={14} />
        ลูกค้าทั้งหมด
      </button>

      <V3Card
        pad={28}
        style={{ border: '1px solid var(--color-line)', marginBottom: 20 }}
      >
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
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
              {c.farm}
            </h1>
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
                marginTop: 10,
                letterSpacing: '-0.02em',
              }}
            >
              {s.value}
            </div>
          </V3Card>
        ))}
      </V3Grid>

      {/* B4 — Upcoming callbacks */}
      <V3Card
        pad={22}
        style={{ border: '1px solid var(--color-line)', marginBottom: 20 }}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
          นัดหมายที่จะมาถึง
        </h3>
        {callbacks.length === 0 ? (
          <div
            style={{
              fontSize: 13,
              color: 'var(--color-ink-4)',
              marginTop: 12,
            }}
          >
            ไม่มีนัดหมาย
          </div>
        ) : (
          <div style={{ marginTop: 12 }}>
            {callbacks.map((cb, i) => (
              <div
                key={cb.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  borderTop:
                    i > 0 ? '1px solid var(--color-line)' : 0,
                }}
              >
                <V3Chip
                  tone={cb.channel === 'line' ? 'sky' : 'mint'}
                  size="xs"
                >
                  {cb.channel === 'line' ? 'LINE' : 'โทรศัพท์'}
                </V3Chip>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    {fmtThaiDateTime(cb.scheduledFor)}
                  </div>
                  {cb.note && (
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--color-ink-4)',
                        marginTop: 2,
                      }}
                    >
                      {cb.note}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="aw3-btn aw3-btn-soft aw3-btn-sm"
                  onClick={() => complete.mutate(cb.id)}
                  disabled={complete.isPending}
                >
                  เสร็จแล้ว
                </button>
              </div>
            ))}
          </div>
        )}
      </V3Card>

      <V3Grid cols={12} gap={20}>
        <V3Col span={7}>
          <V3Card
            pad={22}
            style={{ border: '1px solid var(--color-line)' }}
          >
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
            {trend.length > 0 ? (
              <V3Sparkline values={trend} height={90} />
            ) : (
              <div
                style={{
                  padding: '28px 0',
                  textAlign: 'center',
                  color: 'var(--color-ink-4)',
                  fontSize: 13,
                }}
              >
                ยังไม่มีข้อมูลรอบ
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
              ติดต่อ
            </h3>
            <div style={{ marginTop: 14 }}>
              {CONTACT_ROWS.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '10px 0',
                    borderTop:
                      i > 0 ? '1px solid var(--color-line)' : 0,
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
                      color: 'var(--color-ink-3)',
                    }}
                  >
                    <Icon name={r.icon} size={15} />
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
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                      {contactValues[i]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </V3Card>
        </V3Col>
      </V3Grid>

      <V3Section title="ประวัติล็อต" style={{ marginTop: 28 }}>
        <V3Card
          pad={0}
          style={{
            border: '1px solid var(--color-line)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
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
            <span>จำนวน PL</span>
            <span>D30</span>
          </div>
          {c.batchHistory.length === 0 ? (
            <div
              style={{
                padding: 40,
                textAlign: 'center',
                color: 'var(--color-ink-4)',
                fontSize: 13,
              }}
            >
              ยังไม่มีประวัติล็อต
            </div>
          ) : (
            c.batchHistory.map((h, i) => (
              <div
                key={`${h.batchId}-${i}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
                  padding: '14px 20px',
                  alignItems: 'center',
                  borderBottom:
                    i < c.batchHistory.length - 1
                      ? '1px solid var(--color-line)'
                      : 0,
                  fontSize: 13.5,
                }}
              >
                <span style={{ fontWeight: 700 }}>{h.batchId}</span>
                <span style={{ color: 'var(--color-ink-3)' }}>
                  {h.date || '—'}
                </span>
                <span style={{ fontWeight: 600 }}>
                  {(h.plPurchased / 1000).toFixed(0)}k PL
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    color:
                      h.d30 == null
                        ? 'var(--color-ink-4)'
                        : h.d30 >= 80
                          ? 'var(--color-good)'
                          : h.d30 < 70
                            ? 'var(--color-bad)'
                            : 'var(--color-ink)',
                  }}
                >
                  {h.d30 != null ? `${h.d30}%` : '—'}
                </span>
              </div>
            ))
          )}
        </V3Card>
      </V3Section>
    </div>
  );
}
