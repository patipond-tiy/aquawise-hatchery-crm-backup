'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCustomer } from '@/lib/api';
import { useModal } from '@/lib/store/modal';
import { ModalShell, Field } from './modal-shell';

const ZONES = [
  'สมุทรสาคร',
  'ฉะเชิงเทรา',
  'สมุทรสงคราม',
  'เพชรบุรี',
  'ตราด',
];
const PLANS = ['200k', '300k', '500k', '1M'] as const;

export function AddCustomerModal() {
  const close = useModal((s) => s.close);
  const qc = useQueryClient();
  const [f, setF] = useState({
    farm: '',
    name: '',
    phone: '',
    zone: ZONES[0],
    plan: '300k' as (typeof PLANS)[number],
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((s) => ({ ...s, [k]: v }));

  const mutation = useMutation({
    mutationFn: () => addCustomer({ farm: f.farm, name: f.name, zone: f.zone, phone: f.phone, plan: f.plan }),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      toast.success(`เพิ่มลูกค้า "${c.farm}" แล้ว`);
      close();
    },
  });

  const submit = () => {
    if (!f.farm || !f.name) return;
    mutation.mutate();
  };

  return (
    <ModalShell
      title="เพิ่มลูกค้าใหม่"
      subtitle="ข้อมูลฟาร์มที่จะใช้ในใบรับรองและ LINE OA"
      footer={
        <>
          <button className="aw3-btn aw3-btn-ghost" onClick={close} type="button">
            ยกเลิก
          </button>
          <button
            className="aw3-btn aw3-btn-hero"
            onClick={submit}
            type="button"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'กำลังบันทึก…' : 'เพิ่มลูกค้า'}
          </button>
        </>
      }
    >
      <Field label="ชื่อฟาร์ม">
        <input
          className="aw3-input"
          placeholder="เช่น ฟาร์มกุ้งบ้านสวน"
          value={f.farm}
          onChange={(e) => set('farm', e.target.value)}
        />
      </Field>
      <Field label="ชื่อเจ้าของ">
        <input
          className="aw3-input"
          placeholder="ชื่อ-นามสกุล"
          value={f.name}
          onChange={(e) => set('name', e.target.value)}
        />
      </Field>
      <Field label="เบอร์โทรศัพท์">
        <input
          className="aw3-input"
          placeholder="081-234-5678"
          value={f.phone}
          onChange={(e) => set('phone', e.target.value)}
        />
      </Field>
      <Field label="เขต/จังหวัด">
        <select
          className="aw3-input"
          value={f.zone}
          onChange={(e) => set('zone', e.target.value)}
        >
          {ZONES.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </Field>
      <Field label="แพ็กเกจที่สนใจ" hint="ปรับเปลี่ยนได้ตอนเสนอราคา">
        <div style={{ display: 'flex', gap: 8 }}>
          {PLANS.map((p) => {
            const active = f.plan === p;
            return (
              <button
                type="button"
                key={p}
                onClick={() => set('plan', p)}
                style={{
                  flex: 1,
                  padding: '10px 0',
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
                {p} PL
              </button>
            );
          })}
        </div>
      </Field>
    </ModalShell>
  );
}
