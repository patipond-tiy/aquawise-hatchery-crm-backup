'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { Batch } from '@/lib/types';
import { CUSTOMERS } from '@/lib/mock/data';
import { useModal } from '@/lib/store/modal';
import { ModalShell, Field } from './modal-shell';

export function CertModal({ batch }: { batch?: Batch }) {
  const close = useModal((s) => s.close);
  const [recipients, setRecipients] = useState<string[]>(
    CUSTOMERS.slice(0, 4).map((c) => c.id)
  );

  const toggle = (id: string) =>
    setRecipients((r) =>
      r.includes(id) ? r.filter((x) => x !== id) : [...r, id]
    );

  const send = () => {
    toast.success(
      `ส่งใบรับรอง ${batch?.id ?? ''} ให้ ${recipients.length} ฟาร์มแล้ว`
    );
    close();
  };

  return (
    <ModalShell
      title="ส่งใบรับรอง"
      subtitle={`ล็อต ${batch?.id ?? 'B-2604-A'}`}
      footer={
        <>
          <button className="aw3-btn aw3-btn-ghost" type="button" onClick={close}>
            ยกเลิก
          </button>
          <button
            className="aw3-btn aw3-btn-hero"
            type="button"
            onClick={send}
            disabled={recipients.length === 0}
          >
            ส่งให้ {recipients.length} ฟาร์ม
          </button>
        </>
      }
    >
      <Field label="วิธีการส่ง">
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="aw3-btn aw3-btn-hero aw3-btn-sm"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            LINE Flex
          </button>
          <button
            type="button"
            className="aw3-btn aw3-btn-soft aw3-btn-sm"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            PDF แนบ
          </button>
          <button
            type="button"
            className="aw3-btn aw3-btn-soft aw3-btn-sm"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            SMS ลิงก์
          </button>
        </div>
      </Field>
      <Field label="ส่งให้ฟาร์ม">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            maxHeight: 280,
            overflow: 'auto',
            padding: 4,
            margin: -4,
          }}
        >
          {CUSTOMERS.slice(0, 8).map((c) => {
            const on = recipients.includes(c.id);
            return (
              <button
                type="button"
                key={c.id}
                onClick={() => toggle(c.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 10,
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  background: on
                    ? 'var(--color-hero-soft)'
                    : 'var(--color-soft)',
                  border: 0,
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 'var(--radius-sm)',
                    background: on ? 'var(--color-hero)' : '#fff',
                    border: on ? 0 : '1.5px solid var(--color-line-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {on ? '✓' : ''}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{c.farm}</div>
                  <div
                    style={{ fontSize: 11.5, color: 'var(--color-ink-4)' }}
                  >
                    {c.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Field>
    </ModalShell>
  );
}
