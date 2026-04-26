'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { Customer } from '@/lib/types';
import { useModal } from '@/lib/store/modal';
import { ModalShell, Field } from './modal-shell';

const DAYS = ['วันนี้', 'พรุ่งนี้', 'มะรืน', 'สัปดาห์หน้า', 'เลือกวัน'];
const TIMES = ['08:00', '09:00', '10:00', '13:00', '15:00', '17:00'];

export function ScheduleModal({ customer }: { customer?: Customer }) {
  const close = useModal((s) => s.close);
  const [day, setDay] = useState('พรุ่งนี้');
  const [time, setTime] = useState('09:00');

  const send = () => {
    toast.success(
      `นัดโทรหา ${customer?.farm ?? 'ลูกค้า'} ${day} ${time} น.`
    );
    close();
  };

  return (
    <ModalShell
      title="นัดโทรกลับ"
      subtitle={customer?.farm}
      footer={
        <>
          <button className="aw3-btn aw3-btn-ghost" type="button" onClick={close}>
            ยกเลิก
          </button>
          <button className="aw3-btn aw3-btn-hero" type="button" onClick={send}>
            นัดเลย
          </button>
        </>
      }
    >
      <Field label="วัน">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DAYS.map((d) => {
            const active = day === d;
            return (
              <button
                type="button"
                key={d}
                onClick={() => setDay(d)}
                style={{
                  padding: '10px 14px',
                  border: 0,
                  borderRadius: 'var(--radius)',
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
                {d}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="เวลา">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TIMES.map((t) => {
            const active = time === t;
            return (
              <button
                type="button"
                key={t}
                onClick={() => setTime(t)}
                style={{
                  padding: '8px 14px',
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
                {t}
              </button>
            );
          })}
        </div>
      </Field>
    </ModalShell>
  );
}
