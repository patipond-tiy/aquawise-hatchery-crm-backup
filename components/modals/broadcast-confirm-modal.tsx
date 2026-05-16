'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useModal, type BroadcastFilterId } from '@/lib/store/modal';
import {
  broadcastToFarms,
  type BroadcastTemplate,
} from '@/app/[locale]/(dashboard)/restock/actions';
import { ModalShell, Field } from './modal-shell';

const TEMPLATES: { id: BroadcastTemplate; label: string }[] = [
  { id: 'restock_reminder', label: 'แจ้งเตือนเติมสต็อก' },
  { id: 'new_batch_announcement', label: 'ประกาศล็อตใหม่' },
  { id: 'promo', label: 'โปรโมชั่น' },
];

export function BroadcastConfirmModal({
  filterId,
  farmCount,
}: {
  filterId: BroadcastFilterId;
  farmCount: number;
}) {
  const close = useModal((s) => s.close);
  const [pending, startTransition] = useTransition();
  const [template, setTemplate] = useState<BroadcastTemplate>(
    'restock_reminder'
  );
  const [error, setError] = useState<string | null>(null);

  const confirm = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await broadcastToFarms({ filterId, template });
        if (res.count === 0) {
          toast.message('ไม่มีฟาร์มที่ต้องส่งข้อความ');
        } else {
          toast.success(`ส่งถึง ${res.count} ฟาร์ม`);
        }
        close();
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่'
        );
      }
    });
  };

  return (
    <ModalShell
      title="ส่งข้อความหาฟาร์ม"
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
            onClick={confirm}
            disabled={pending}
          >
            {pending ? 'กำลังส่ง…' : 'ส่งเลย'}
          </button>
        </>
      }
    >
      <div
        style={{
          fontSize: 14,
          color: 'var(--color-ink-2)',
          marginBottom: 18,
        }}
      >
        จะส่งข้อความถึง <strong>{farmCount}</strong> ฟาร์มในกลุ่มนี้
      </div>

      <Field label="เลือกข้อความ">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TEMPLATES.map((t) => (
            <label
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-line)',
                cursor: 'pointer',
                background:
                  template === t.id
                    ? 'var(--color-soft)'
                    : 'transparent',
              }}
            >
              <input
                type="radio"
                name="broadcast-template"
                value={t.id}
                checked={template === t.id}
                onChange={() => setTemplate(t.id)}
              />
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {t.label}
              </span>
            </label>
          ))}
        </div>
      </Field>

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
