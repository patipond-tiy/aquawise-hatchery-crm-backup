'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { Customer } from '@/lib/types';
import { useModal } from '@/lib/store/modal';
import { sendQuote, type QuoteLineItem } from '@/app/[locale]/(dashboard)/restock/actions';
import { ModalShell, Field } from './modal-shell';

const SIZE_PRESETS: { label: string; defaultPrice: number }[] = [
  { label: '200k', defaultPrice: 0.18 },
  { label: '300k', defaultPrice: 0.18 },
  { label: '500k', defaultPrice: 0.17 },
  { label: '1M', defaultPrice: 0.16 },
];

export function QuoteModal({ customer }: { customer?: Customer }) {
  const close = useModal((s) => s.close);
  const qc = useQueryClient();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<QuoteLineItem[]>([
    { sizeLabel: '300k', unitPrice: 0.18, quantity: 1 },
  ]);
  const [note, setNote] = useState('');

  const setItem = (idx: number, patch: Partial<QuoteLineItem>) =>
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it))
    );

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { sizeLabel: '500k', unitPrice: 0.17, quantity: 1 },
    ]);

  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const total = items.reduce(
    (sum, it) =>
      sum +
      (parseInt(it.sizeLabel, 10) || 0) * 1000 * it.unitPrice * it.quantity,
    0
  );

  const submit = () => {
    setError(null);
    if (!customer) {
      setError('ไม่พบลูกค้า');
      return;
    }
    if (items.length === 0) {
      setError('กรุณาเพิ่มรายการสินค้าอย่างน้อยหนึ่งรายการ');
      return;
    }
    startTransition(async () => {
      try {
        const res = await sendQuote({
          customerId: customer.id,
          items,
          note: note || undefined,
        });
        qc.invalidateQueries({ queryKey: ['quotes', customer.id] });
        toast.success(
          res.duplicate
            ? 'ใบเสนอราคานี้ส่งไปแล้ว'
            : 'ส่งใบเสนอราคาแล้ว'
        );
        close();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
      }
    });
  };

  return (
    <ModalShell
      title="ส่งใบเสนอราคา"
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
            {pending ? 'กำลังส่ง…' : 'ส่งใบเสนอราคา'}
          </button>
        </>
      }
    >
      <Field label="รายการสินค้า">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((it, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr auto',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <select
                className="aw3-input"
                value={it.sizeLabel}
                onChange={(e) => {
                  const preset = SIZE_PRESETS.find(
                    (p) => p.label === e.target.value
                  );
                  setItem(idx, {
                    sizeLabel: e.target.value,
                    unitPrice: preset?.defaultPrice ?? it.unitPrice,
                  });
                }}
              >
                {SIZE_PRESETS.map((p) => (
                  <option key={p.label} value={p.label}>
                    {p.label} PL
                  </option>
                ))}
              </select>
              <input
                className="aw3-input"
                type="number"
                step="0.01"
                min={0}
                value={it.unitPrice}
                onChange={(e) =>
                  setItem(idx, { unitPrice: parseFloat(e.target.value) || 0 })
                }
                aria-label="ราคาต่อ PL"
              />
              <input
                className="aw3-input"
                type="number"
                min={1}
                value={it.quantity}
                onChange={(e) =>
                  setItem(idx, {
                    quantity: parseInt(e.target.value, 10) || 1,
                  })
                }
                aria-label="จำนวนชุด"
              />
              <button
                type="button"
                className="aw3-btn aw3-btn-ghost aw3-btn-sm"
                onClick={() => removeItem(idx)}
                disabled={items.length === 1}
              >
                ลบ
              </button>
            </div>
          ))}
          <button
            type="button"
            className="aw3-btn aw3-btn-soft aw3-btn-sm"
            onClick={addItem}
            style={{ alignSelf: 'flex-start' }}
          >
            + เพิ่มรายการ
          </button>
        </div>
      </Field>

      <Field label="หมายเหตุ (ไม่จำเป็น)">
        <textarea
          className="aw3-input"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="เช่น ราคาพิเศษลูกค้าเก่า ส่งภายใน 3 วัน"
        />
      </Field>

      <div
        style={{
          padding: 16,
          borderRadius: 'var(--radius)',
          background: 'var(--color-soft)',
          marginTop: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <span style={{ fontWeight: 700 }}>รวมโดยประมาณ</span>
        <span style={{ fontSize: 20, fontWeight: 800 }}>
          ฿{Math.round(total).toLocaleString()}
        </span>
      </div>

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
