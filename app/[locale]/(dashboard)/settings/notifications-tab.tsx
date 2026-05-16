'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '@/lib/api';
import { V3Card } from '@/components/aw/v3-card';
import { Toggle } from '@/components/modals/modal-shell';

export function Notifications() {
  const qc = useQueryClient();
  const { data: notifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotificationSettings,
  });
  const mutation = useMutation({
    mutationFn: updateNotificationSettings,
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
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (!notifs) return null;

  const ROWS: { key: keyof typeof notifs; label: string; desc: string }[] = [
    {
      key: 'restock',
      label: 'มีฟาร์มที่ใกล้ครบรอบ (≤14 วัน)',
      desc: 'สรุปทุกเช้า 7:00 น.',
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

  return (
    <V3Card pad={26} style={{ border: '1px solid var(--color-line)', maxWidth: 720 }}>
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
            on={notifs[r.key]}
            onChange={(v) => mutation.mutate({ [r.key]: v })}
          />
        </div>
      ))}
    </V3Card>
  );
}
