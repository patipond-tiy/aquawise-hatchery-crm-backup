'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { Customer } from '@/lib/types';
import { useModal } from '@/lib/store/modal';
import { ModalShell, Field } from './modal-shell';

const TEMPLATES = ['ใกล้ครบรอบ', 'มีล็อตใหม่', 'ส่งใบรับรอง', 'ขอราคาเก็บเกี่ยว'];

export function SendLineModal({ customer }: { customer?: Customer }) {
  const close = useModal((s) => s.close);
  const firstName = customer?.name?.split(' ')[0] ?? '';
  const [msg, setMsg] = useState(
    `สวัสดีครับ คุณ${firstName} รอบนี้ใกล้ครบแล้ว ทางเรามีล็อตใหม่ B-2604-A พร้อมส่ง 320k PL ครับ`
  );

  const send = () => {
    toast.success(`ส่งข้อความถึง ${customer?.farm ?? 'ลูกค้า'} แล้ว`);
    close();
  };

  return (
    <ModalShell
      title="ส่งข้อความผ่าน LINE"
      subtitle={customer?.farm}
      footer={
        <>
          <button className="aw3-btn aw3-btn-ghost" type="button" onClick={close}>
            ยกเลิก
          </button>
          <button className="aw3-btn aw3-btn-hero" type="button" onClick={send}>
            ส่งข้อความ
          </button>
        </>
      }
    >
      <Field label="แม่แบบ">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TEMPLATES.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setMsg(`[แม่แบบ "${t}"] สวัสดีครับ ...`)}
              style={{
                padding: '7px 12px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-soft)',
                border: 0,
                fontFamily: 'inherit',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </Field>
      <Field label="ข้อความ" hint={`${msg.length} / 1000 อักษร`}>
        <textarea
          className="aw3-input"
          rows={5}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          style={{ fontSize: 14, lineHeight: 1.6, resize: 'vertical' }}
        />
      </Field>
      <div
        style={{
          padding: 14,
          borderRadius: 'var(--radius)',
          background: 'var(--color-mint)',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 18 }}>💬</span>
        <div
          style={{
            fontSize: 12.5,
            color: 'var(--color-mint-fg)',
            fontWeight: 600,
          }}
        >
          จะส่งผ่าน LINE Official Account @fasaihatchery
        </div>
      </div>
    </ModalShell>
  );
}
