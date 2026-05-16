'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import type { Batch } from '@/lib/types';
import { getBatch } from '@/lib/api';
import { sendCertificateAction } from '@/app/[locale]/(dashboard)/batches/actions';
import { useModal } from '@/lib/store/modal';
import { ModalShell, Field } from './modal-shell';

export function CertModal({ batch }: { batch?: Batch }) {
  const close = useModal((s) => s.close);
  const { data: detail } = useQuery({
    queryKey: ['batch', batch?.id],
    queryFn: () => getBatch(batch!.id),
    enabled: Boolean(batch?.id),
  });
  const buyers = detail?.buyers ?? [];
  const [recipients, setRecipients] = useState<string[]>([]);
  const [pending, setPending] = useState(false);

  const toggle = (id: string) =>
    setRecipients((r) =>
      r.includes(id) ? r.filter((x) => x !== id) : [...r, id]
    );

  const send = async () => {
    if (!batch || recipients.length === 0) return;
    setPending(true);
    try {
      const { enqueued } = await sendCertificateAction(
        batch.id,
        recipients
      );
      toast.success(`เพิ่มคิวส่งใบรับรองให้ ${enqueued} ราย แล้ว`);
      close();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'ส่งใบรับรองไม่สำเร็จ'
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <ModalShell
      title="ส่งใบรับรอง PCR"
      subtitle={`ล็อต ${batch?.id ?? ''}`}
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
            onClick={send}
            disabled={recipients.length === 0 || pending}
          >
            {pending ? 'กำลังบันทึก…' : `เพิ่มคิวส่ง`}
          </button>
        </>
      }
    >
      <Field label="เลือกผู้รับ">
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
          {buyers.length === 0 && (
            <div
              style={{
                fontSize: 13,
                color: 'var(--color-ink-4)',
                padding: 12,
              }}
            >
              ยังไม่มีผู้ซื้อล็อตนี้
            </div>
          )}
          {buyers.map((c) => {
            const on = recipients.includes(c.customerId);
            return (
              <button
                type="button"
                key={c.customerId}
                onClick={() => toggle(c.customerId)}
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
                    border: on
                      ? 0
                      : '1.5px solid var(--color-line-2)',
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
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    {c.farm}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: 'var(--color-ink-4)',
                    }}
                  >
                    {c.zone}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Field>
      <div
        style={{
          fontSize: 12.5,
          color: 'var(--color-ink-4)',
          marginTop: 10,
          lineHeight: 1.5,
        }}
      >
        จะส่งเมื่อระบบ LINE พร้อม
      </div>
    </ModalShell>
  );
}
