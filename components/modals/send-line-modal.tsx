'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { Customer } from '@/lib/types';
import { useModal } from '@/lib/store/modal';
import { sendLineEvent } from '@/app/[locale]/(dashboard)/customers/[id]/actions';
import { ModalShell, Field } from './modal-shell';

type TemplateKey = 'restock_reminder' | 'new_batch_announcement' | 'custom_note';

const TEMPLATES: { key: TemplateKey; label: string }[] = [
  { key: 'restock_reminder', label: 'แจ้งเตือนรีสต็อก' },
  { key: 'new_batch_announcement', label: 'ประกาศล็อตใหม่' },
  { key: 'custom_note', label: 'ข้อความอิสระ' },
];

export function SendLineModal({ customer }: { customer?: Customer }) {
  const close = useModal((s) => s.close);
  const qc = useQueryClient();
  const [pending, startTransition] = useTransition();
  const [template, setTemplate] = useState<TemplateKey>('restock_reminder');
  const [note, setNote] = useState('');

  const send = () => {
    if (!customer?.id) {
      toast.error('ไม่พบลูกค้า');
      return;
    }
    if (template === 'custom_note' && note.trim().length === 0) {
      toast.error('กรุณาพิมพ์ข้อความ');
      return;
    }
    startTransition(async () => {
      const res = await sendLineEvent({
        customerId: customer.id,
        template,
        note: template === 'custom_note' ? note : undefined,
      });
      if (!res.ok) {
        if (res.error === 'PAYWALL') {
          toast.error('กรุณาสมัครแพ็กเกจเพื่อใช้งานต่อ');
        } else {
          toast.error(res.error);
        }
        return;
      }
      qc.invalidateQueries({ queryKey: ['line-events', customer.id] });
      toast.success(res.deduped ? 'มีข้อความนี้ในคิวอยู่แล้ว' : 'ส่งข้อความแล้ว');
      close();
    });
  };

  return (
    <ModalShell
      title="ส่งข้อความ LINE"
      subtitle={customer?.farm}
      footer={
        <>
          <button
            className="aw3-btn aw3-btn-ghost"
            type="button"
            onClick={close}
            disabled={pending}
          >
            ยกเลิก
          </button>
          <button
            className="aw3-btn aw3-btn-hero"
            type="button"
            onClick={send}
            disabled={pending}
          >
            {pending ? 'กำลังส่ง…' : 'ส่งข้อความ'}
          </button>
        </>
      }
    >
      <Field label="แม่แบบ">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TEMPLATES.map((t) => {
            const active = template === t.key;
            return (
              <button
                type="button"
                key={t.key}
                onClick={() => setTemplate(t.key)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-pill)',
                  background: active
                    ? 'var(--color-hero)'
                    : 'var(--color-soft)',
                  color: active ? '#fff' : 'var(--color-ink)',
                  border: 0,
                  fontFamily: 'inherit',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </Field>
      {template === 'custom_note' && (
        <Field label="ข้อความ" hint={`${note.length} / 300 อักษร`}>
          <textarea
            className="aw3-input"
            rows={5}
            maxLength={300}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="พิมพ์ข้อความถึงลูกค้า…"
            style={{ fontSize: 14, lineHeight: 1.6, resize: 'vertical' }}
          />
        </Field>
      )}
      <div
        style={{
          padding: 14,
          borderRadius: 'var(--radius)',
          background: 'var(--color-mint)',
          fontSize: 12.5,
          color: 'var(--color-mint-fg)',
          fontWeight: 600,
        }}
      >
        ข้อความจะถูกจัดคิวและส่งผ่าน LINE Official Account
        {customer && !customer.farmEn ? '' : ''}
      </div>
    </ModalShell>
  );
}
