'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { Customer } from '@/lib/types';
import { BATCHES } from '@/lib/mock/data';
import { useModal } from '@/lib/store/modal';
import { ModalShell, Field } from './modal-shell';

const SIZES: Record<string, number> = {
  '200k': 200,
  '300k': 300,
  '500k': 500,
  '1M': 1000,
};
const UNIT_PRICE = 0.18;

export function QuoteModal({ customer }: { customer?: Customer }) {
  const close = useModal((s) => s.close);
  const [size, setSize] = useState<keyof typeof SIZES>('300k');
  const [batch, setBatch] = useState('B-2604-A');
  const [discount, setDiscount] = useState(5);

  const subtotal = SIZES[size] * 1000 * UNIT_PRICE;
  const total = subtotal * (1 - discount / 100);

  const send = () => {
    toast.success(`ส่งใบเสนอราคาให้ ${customer?.farm ?? 'ลูกค้า'} แล้ว`);
    close();
  };

  return (
    <ModalShell
      title="เสนอราคาล็อตใหม่"
      subtitle={customer?.farm}
      footer={
        <>
          <button className="aw3-btn aw3-btn-ghost" type="button" onClick={close}>
            ยกเลิก
          </button>
          <button className="aw3-btn aw3-btn-hero" type="button" onClick={send}>
            ส่งใบเสนอราคา LINE
          </button>
        </>
      }
    >
      <Field label="เลือกล็อต">
        <select
          className="aw3-input"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
        >
          {BATCHES.filter((b) => b.pcr === 'clean').map((b) => (
            <option key={b.id} value={b.id}>
              {b.id} — {b.source} ({(b.plProduced / 1_000_000).toFixed(1)}M)
            </option>
          ))}
        </select>
      </Field>
      <Field label="ปริมาณ">
        <div style={{ display: 'flex', gap: 8 }}>
          {(Object.keys(SIZES) as Array<keyof typeof SIZES>).map((s) => {
            const active = size === s;
            return (
              <button
                type="button"
                key={s}
                onClick={() => setSize(s)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  border: 0,
                  borderRadius: 'var(--radius)',
                  background: active ? 'var(--color-hero)' : 'var(--color-soft)',
                  color: active ? '#fff' : 'var(--color-ink-2)',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {s} PL
              </button>
            );
          })}
        </div>
      </Field>
      <Field label={`ส่วนลดลูกค้าเก่า: ${discount}%`}>
        <input
          type="range"
          min={0}
          max={15}
          value={discount}
          onChange={(e) => setDiscount(parseInt(e.target.value, 10))}
          style={{ width: '100%', accentColor: 'var(--color-hero)' }}
        />
      </Field>
      <div
        style={{
          padding: 18,
          borderRadius: 'var(--radius)',
          background: 'var(--color-soft)',
          marginTop: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
            marginBottom: 6,
          }}
        >
          <span style={{ color: 'var(--color-ink-3)' }}>
            ราคา {SIZES[size]}k × ฿{UNIT_PRICE}/PL
          </span>
          <span>฿{subtotal.toLocaleString()}</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
            marginBottom: 10,
          }}
        >
          <span style={{ color: 'var(--color-ink-3)' }}>
            ส่วนลด {discount}%
          </span>
          <span style={{ color: 'var(--color-bad)' }}>
            −฿{(subtotal - total).toLocaleString()}
          </span>
        </div>
        <div
          style={{
            borderTop: '1px solid var(--color-line)',
            paddingTop: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <span style={{ fontWeight: 700 }}>รวม</span>
          <span style={{ fontSize: 22, fontWeight: 800 }}>
            ฿{total.toLocaleString()}
          </span>
        </div>
      </div>
    </ModalShell>
  );
}
