'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { listAlerts } from '@/lib/api';
import {
  notifyAlertFarms,
  type NotifyTemplate,
} from './actions';
import { useModal } from '@/lib/store/modal';
import type { Alert } from '@/lib/types';
import { V3Card } from '@/components/aw/v3-card';
import { V3Grid } from '@/components/aw/v3-grid';
import { V3Chip } from '@/components/aw/v3-chip';
import { V3Section } from '@/components/aw/v3-section';

const NOTIFY_TEMPLATES: { id: NotifyTemplate; label: string }[] = [
  { id: 'acknowledge', label: 'แจ้งรับทราบปัญหา' },
  { id: 'remediation_plan', label: 'แจ้งแผนแก้ไข' },
  { id: 'closure', label: 'แจ้งปิดเคส' },
];

function NotifyFarmsControl({ alert }: { alert: Alert }) {
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<NotifyTemplate>('acknowledge');
  const [pending, startTransition] = useTransition();

  const send = () => {
    startTransition(async () => {
      try {
        const res = await notifyAlertFarms(alert.id, template);
        if (res.enqueued === 0 && res.skipped === 0) {
          toast.message('ไม่มีฟาร์มที่ต้องส่งข้อความ');
        } else if (res.skipped > 0) {
          toast.success(
            `ส่งถึง ${res.enqueued} ฟาร์ม (ข้าม ${res.skipped} ที่ยังไม่ได้เชื่อม LINE)`
          );
        } else {
          toast.success(`ส่งถึง ${res.enqueued} ฟาร์ม`);
        }
        setOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
      }
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        className="aw3-btn aw3-btn-hero aw3-btn-sm"
        onClick={() => setOpen(true)}
      >
        ส่งข้อความถึงฟาร์ม
      </button>
    );
  }

  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <select
        className="aw3-input"
        style={{ height: 32, fontSize: 13, padding: '0 8px' }}
        value={template}
        onChange={(e) => setTemplate(e.target.value as NotifyTemplate)}
        aria-label="เลือกข้อความ"
      >
        {NOTIFY_TEMPLATES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="aw3-btn aw3-btn-hero aw3-btn-sm"
        onClick={send}
        disabled={pending}
      >
        {pending ? 'กำลังส่ง…' : 'ส่ง'}
      </button>
      <button
        type="button"
        className="aw3-btn aw3-btn-ghost aw3-btn-sm"
        onClick={() => setOpen(false)}
      >
        ยกเลิก
      </button>
    </span>
  );
}

const SEV: Record<
  'high' | 'medium' | 'low',
  { bg: string; fg: string; label: string; icon: string; chip: 'bad' | 'amber' | 'sky' }
> = {
  high: {
    bg: 'var(--color-bad-tint)',
    fg: 'var(--color-bad)',
    label: 'รุนแรง',
    icon: '⚠',
    chip: 'bad',
  },
  medium: {
    bg: 'var(--color-warn-tint)',
    fg: 'var(--color-warn)',
    label: 'ปานกลาง',
    icon: '◑',
    chip: 'amber',
  },
  low: {
    bg: 'var(--color-sky)',
    fg: 'var(--color-sky-fg)',
    label: 'เฝ้าระวัง',
    icon: 'i',
    chip: 'sky',
  },
};

export function AlertsView() {
  const router = useRouter();
  const openModal = useModal((s) => s.open);
  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: listAlerts,
  });

  const counts = {
    high: alerts.filter((a) => a.sev === 'high').length,
    medium: alerts.filter((a) => a.sev === 'medium').length,
    low: alerts.filter((a) => a.sev === 'low').length,
  };

  return (
    <div>
      <h1
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.01em',
        }}
      >
        แจ้งเตือนโรค
      </h1>
      <div
        style={{
          color: 'var(--color-ink-3)',
          fontSize: 15,
          marginBottom: 24,
          marginTop: 4,
        }}
      >
        ติดตามและตอบสนองต่อความผิดปกติย้อนกลับไปยังล็อตต้นทาง
      </div>

      <V3Grid cols={3} gap={14} style={{ marginBottom: 28 }}>
        {[
          { label: 'รุนแรง', value: counts.high, tone: 'bad' as const },
          { label: 'ปานกลาง', value: counts.medium, tone: 'amber' as const },
          { label: 'เฝ้าระวัง', value: counts.low, tone: 'sky' as const },
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
                เคส
              </span>
            </div>
          </V3Card>
        ))}
      </V3Grid>

      <V3Section title="แจ้งเตือนทั้งหมด">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {alerts.map((a) => {
            const sev = SEV[a.sev];
            return (
              <V3Card
                key={a.id}
                pad={20}
                style={{
                  border: '1px solid var(--color-line)',
                  borderLeft: `4px solid ${sev.fg}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius)',
                      background: sev.bg,
                      color: sev.fg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {sev.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        flexWrap: 'wrap',
                        marginBottom: 6,
                      }}
                    >
                      <V3Chip tone={sev.chip} size="xs">
                        {sev.label}
                      </V3Chip>
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--color-ink-4)',
                          fontWeight: 600,
                        }}
                      >
                        {a.date}
                      </span>
                      {a.batch && (
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--color-ink-4)',
                            fontWeight: 600,
                          }}
                        >
                          · ล็อต {a.batch}
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, lineHeight: 1.35 }}>
                      {a.title}
                    </h3>
                    <div
                      style={{
                        fontSize: 13.5,
                        color: 'var(--color-ink-3)',
                        marginTop: 6,
                        lineHeight: 1.55,
                      }}
                    >
                      {a.desc}
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                        padding: '12px 14px',
                        background: 'var(--color-soft)',
                        borderRadius: 'var(--radius)',
                        fontSize: 13,
                      }}
                    >
                      <div className="eyebrow" style={{ marginBottom: 6 }}>
                        ฟาร์มที่เกี่ยวข้อง
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {a.farms.map((f) => (
                          <span
                            key={f}
                            style={{
                              padding: '4px 10px',
                              background: '#fff',
                              borderRadius: 'var(--radius-pill)',
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                      <div className="eyebrow" style={{ marginTop: 12, marginBottom: 4 }}>
                        แนะนำ
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{a.action}</div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      {a.batch && (
                        <button
                          type="button"
                          className="aw3-btn aw3-btn-soft aw3-btn-sm"
                          onClick={() =>
                            router.push(`/batches/${a.batch!}` as never)
                          }
                        >
                          ดูล็อต {a.batch}
                        </button>
                      )}
                      <NotifyFarmsControl alert={a} />
                      <button
                        type="button"
                        className="aw3-btn aw3-btn-ghost aw3-btn-sm"
                        onClick={() => openModal('closeAlert', { alert: a })}
                      >
                        ปิดเคส
                      </button>
                    </div>
                  </div>
                </div>
              </V3Card>
            );
          })}
          {alerts.length === 0 && (
            <div
              style={{
                padding: 60,
                textAlign: 'center',
                color: 'var(--color-ink-4)',
              }}
            >
              ไม่มีแจ้งเตือนในขณะนี้
            </div>
          )}
        </div>
      </V3Section>
    </div>
  );
}
