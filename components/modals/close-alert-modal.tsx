'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { Alert } from '@/lib/types';
import { closeAlertAction } from '@/app/[locale]/(dashboard)/alerts/actions';
import { useModal } from '@/lib/store/modal';
import { ModalShell, Field } from './modal-shell';

const FOLLOWUP_ACTIONS: { id: string; label: string }[] = [
  { id: 'lab_retest', label: 'ส่งตรวจ PCR ซ้ำ' },
  { id: 'notify_farms', label: 'แจ้งฟาร์มที่เกี่ยวข้อง' },
  { id: 'quarantine_batch', label: 'กักล็อตไว้ตรวจสอบ' },
  { id: 'customer_followup', label: 'ติดตามลูกค้า' },
];

export function CloseAlertModal({ alert }: { alert?: Alert }) {
  const close = useModal((s) => s.close);
  const qc = useQueryClient();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [notifyFarms, setNotifyFarms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const submit = () => {
    setError(null);
    if (!alert) {
      setError('ไม่พบเคส');
      return;
    }
    if (note.trim().length === 0) {
      setError('กรุณากรอกหมายเหตุการแก้ไข');
      return;
    }
    startTransition(async () => {
      const res = await closeAlertAction(
        alert.id,
        note.trim(),
        selected,
        notifyFarms
      );
      if (res.ok) {
        qc.invalidateQueries({ queryKey: ['alerts'] });
        toast.success('ปิดเคสเรียบร้อยแล้ว');
        close();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <ModalShell
      title="ปิดเคส"
      subtitle={alert?.title}
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
            {pending ? 'กำลังบันทึก…' : 'ปิดเคส'}
          </button>
        </>
      }
    >
      <Field label="หมายเหตุการแก้ไข">
        <textarea
          className="aw3-input"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="อธิบายสิ่งที่ดำเนินการแล้ว…"
        />
      </Field>

      <Field label="การดำเนินการติดตาม">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FOLLOWUP_ACTIONS.map((a) => (
            <label
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(a.id)}
                onChange={() => toggle(a.id)}
              />
              {a.label}
            </label>
          ))}
        </div>
      </Field>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: 4,
        }}
      >
        <input
          type="checkbox"
          checked={notifyFarms}
          onChange={(e) => setNotifyFarms(e.target.checked)}
        />
        แจ้งฟาร์มที่ได้รับผลกระทบ
      </label>

      {error && (
        <div
          style={{
            marginTop: 12,
            color: 'var(--color-bad)',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}
    </ModalShell>
  );
}
