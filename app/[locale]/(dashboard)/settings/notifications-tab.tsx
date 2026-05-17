'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotificationSettings } from '@/lib/api';
import type { NotificationSettings } from '@/lib/types';
import { updateNotificationSettingsAction } from './actions';
import { V3Card } from '@/components/aw/v3-card';
import { Toggle } from '@/components/modals/modal-shell';

export function Notifications() {
  const qc = useQueryClient();
  const { data: notifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotificationSettings,
  });
  const mutation = useMutation({
    mutationFn: (
      patch: Partial<NotificationSettings> & {
        quietHoursStart?: string;
        quietHoursEnd?: string;
      }
    ) => updateNotificationSettingsAction(patch),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: ['notifications'] });
      const prev = qc.getQueryData(['notifications']);
      qc.setQueryData(['notifications'], (s: typeof notifs) =>
        s ? { ...s, ...patch } : s
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['notifications'], ctx.prev);
      toast.error('บันทึกไม่สำเร็จ');
    },
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        qc.invalidateQueries({ queryKey: ['notifications'] });
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const [qStart, setQStart] = useState<string | null>(null);
  const [qEnd, setQEnd] = useState<string | null>(null);
  const [savingQH, startQH] = useTransition();

  if (!notifs) return null;

  const ROWS: { key: keyof NotificationSettings; label: string; desc: string }[] =
    [
      {
        key: 'restock',
        label: 'มีฟาร์มที่ใกล้ครบรอบ (≤14 วัน)',
        desc: 'สรุปทุกเช้า 9:00 น.',
      },
      {
        key: 'lowD30',
        label: 'D30 ของล็อตต่ำกว่าเป้า',
        desc: 'ส่งเมื่อมีฟาร์ม ≥2 ที่รายงานต่ำ',
      },
      {
        key: 'disease',
        label: 'พบเชื้อในล็อตที่ส่งไปแล้ว',
        desc: 'ส่งทันที + เสนอให้ส่งข้อความถึงทุกฟาร์ม',
      },
      {
        key: 'lineReply',
        label: 'ลูกค้าตอบรับใน LINE',
        desc: 'ทุกข้อความที่ส่งมา',
      },
      { key: 'weekly', label: 'สรุปรายสัปดาห์', desc: 'ทุกวันจันทร์เช้า' },
      {
        key: 'priceMove',
        label: 'ราคาตลาดเปลี่ยน > 5%',
        desc: 'จากตลาดทะเลไทย สมุทรสาคร',
      },
    ];

  const startVal = qStart ?? notifs.quietHoursStart;
  const endVal = qEnd ?? notifs.quietHoursEnd;

  const saveQuietHours = () => {
    startQH(async () => {
      const res = await updateNotificationSettingsAction({
        quietHoursStart: startVal,
        quietHoursEnd: endVal,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success('บันทึกเวลาปิดการแจ้งเตือนแล้ว');
      qc.invalidateQueries({ queryKey: ['notifications'] });
      setQStart(null);
      setQEnd(null);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
      <V3Card pad={26} style={{ border: '1px solid var(--color-line)' }}>
        {ROWS.map((r, i) => (
          <div
            key={r.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 0',
              borderTop: i > 0 ? '1px solid var(--color-line)' : 0,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{r.label}</div>
              <div
                style={{
                  fontSize: 12.5,
                  color: 'var(--color-ink-4)',
                  marginTop: 2,
                }}
              >
                {r.desc}
              </div>
            </div>
            <Toggle
              on={notifs[r.key] as boolean}
              onChange={(v) => mutation.mutate({ [r.key]: v })}
            />
          </div>
        ))}
      </V3Card>

      <V3Card pad={26} style={{ border: '1px solid var(--color-line)' }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>
          เวลาปิดการแจ้งเตือน
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: 'var(--color-ink-4)',
            marginTop: 2,
            marginBottom: 16,
          }}
        >
          การแจ้งเตือนอัตโนมัติจะหยุดชั่วคราวในช่วงเวลานี้ ·
          การแจ้งโรคระดับวิกฤตจะยังคงส่งทันที
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <label style={{ fontSize: 12.5, fontWeight: 600 }}>
            เริ่มปิด
            <input
              type="time"
              className="aw3-input"
              value={startVal}
              onChange={(e) => setQStart(e.target.value)}
              style={{ display: 'block', marginTop: 6 }}
            />
          </label>
          <label style={{ fontSize: 12.5, fontWeight: 600 }}>
            เปิดใหม่
            <input
              type="time"
              className="aw3-input"
              value={endVal}
              onChange={(e) => setQEnd(e.target.value)}
              style={{ display: 'block', marginTop: 6 }}
            />
          </label>
          <button
            type="button"
            className="aw3-btn aw3-btn-soft"
            onClick={saveQuietHours}
            disabled={savingQH}
          >
            {savingQH ? 'กำลังบันทึก…' : 'บันทึก'}
          </button>
        </div>
      </V3Card>
    </div>
  );
}
