'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { Customer } from '@/lib/types';
import { useModal } from '@/lib/store/modal';
import { scheduleCallbackAction } from '@/app/[locale]/(dashboard)/customers/actions';
import { ModalShell, Field } from './modal-shell';

export function ScheduleModal({ customer }: { customer?: Customer }) {
  const close = useModal((s) => s.close);
  const qc = useQueryClient();
  // Lazy initializer keeps the impure Date.now() out of render (react-hooks/purity).
  const [date, setDate] = useState(
    () => new Date(Date.now() + 864e5).toISOString().slice(0, 10)
  );
  const [time, setTime] = useState('09:00');
  const [channel, setChannel] = useState<'call' | 'line'>('call');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async () => {
    if (!customer) return;
    const scheduledFor = new Date(`${date}T${time}:00`);
    // AC #3: past-date blocked client-side (also enforced server-side).
    if (scheduledFor.getTime() <= Date.now()) {
      setError('กรุณาเลือกวันที่ในอนาคต');
      return;
    }
    setError('');
    setPending(true);
    try {
      await scheduleCallbackAction({
        customerId: customer.id,
        scheduledFor: scheduledFor.toISOString(),
        channel,
        note: note || undefined,
      });
      qc.invalidateQueries({ queryKey: ['callbacks', customer.id] });
      toast.success(
        `บันทึกนัด "${scheduledFor.toLocaleDateString('th-TH')}" แล้ว`
      );
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'บันทึกนัดไม่สำเร็จ');
    } finally {
      setPending(false);
    }
  };

  return (
    <ModalShell
      title="นัดโทร"
      subtitle={customer?.farm}
      footer={
        <>
          <button
            className="aw3-btn aw3-btn-ghost"
            type="button"
            onClick={close}
          >
            ยกเลิก
          </button>
          <button
            className="aw3-btn aw3-btn-hero"
            type="button"
            onClick={submit}
            disabled={pending}
          >
            {pending ? 'กำลังบันทึก…' : 'บันทึกนัด'}
          </button>
        </>
      }
    >
      <Field label="วันที่">
        <input
          className="aw3-input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Field>
      <Field label="เวลา">
        <input
          className="aw3-input"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </Field>
      <Field label="ช่องทาง">
        <div style={{ display: 'flex', gap: 8 }}>
          {(
            [
              ['call', 'โทรศัพท์'],
              ['line', 'LINE'],
            ] as const
          ).map(([v, label]) => {
            const active = channel === v;
            return (
              <button
                type="button"
                key={v}
                onClick={() => setChannel(v)}
                style={{
                  flex: 1,
                  padding: '10px 0',
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
                {label}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="หมายเหตุ">
        <input
          className="aw3-input"
          placeholder="(ไม่บังคับ)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>
      {error && (
        <div
          style={{
            color: 'var(--color-bad)',
            fontSize: 13,
            marginTop: 4,
          }}
        >
          {error}
        </div>
      )}
    </ModalShell>
  );
}
