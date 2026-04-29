'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useModal } from '@/lib/store/modal';
import { ModalShell, Field } from './modal-shell';
import { inviteTeamMember } from '@/app/[locale]/(dashboard)/settings/team/actions';

const PERMS = [
  { id: 'counter_staff', label: 'พนักงานเคาน์เตอร์', desc: 'จัดการลูกค้า ล็อต และส่งข้อความ' },
  { id: 'lab_tech', label: 'เจ้าหน้าที่ PCR', desc: 'อัปโหลดผล PCR และออกใบรับรอง' },
  { id: 'auditor', label: 'ผู้ตรวจสอบ', desc: 'เปิดดูข้อมูลแต่แก้ไขไม่ได้' },
] as const;

export function InviteTeamModal() {
  const close = useModal((s) => s.close);
  const [f, setF] = useState({
    name: '',
    email: '',
    perm: 'counter_staff' as (typeof PERMS)[number]['id'],
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((s) => ({ ...s, [k]: v }));

  const [pending, startTransition] = useTransition();

  const send = () => {
    startTransition(async () => {
      const result = await inviteTeamMember(f.email, f.perm);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`ส่งคำเชิญถึง ${f.email} แล้ว`);
      close();
    });
  };

  return (
    <ModalShell
      title="เชิญสมาชิก"
      subtitle="ส่งลิงก์เชิญผ่านอีเมลหรือ LINE"
      footer={
        <>
          <button className="aw3-btn aw3-btn-ghost" type="button" onClick={close}>
            ยกเลิก
          </button>
          <button
            className="aw3-btn aw3-btn-hero"
            type="button"
            onClick={send}
            disabled={!f.email || pending}
          >
            {pending ? 'กำลังส่ง...' : 'ส่งคำเชิญ'}
          </button>
        </>
      }
    >
      <Field label="ชื่อ">
        <input
          className="aw3-input"
          value={f.name}
          onChange={(e) => set('name', e.target.value)}
        />
      </Field>
      <Field label="อีเมล">
        <input
          className="aw3-input"
          type="email"
          value={f.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="example@email.com"
        />
      </Field>
      <Field label="สิทธิ์การใช้งาน">
        {PERMS.map((p) => {
          const active = f.perm === p.id;
          return (
            <button
              type="button"
              key={p.id}
              onClick={() => set('perm', p.id)}
              style={{
                width: '100%',
                padding: 14,
                marginBottom: 8,
                borderRadius: 'var(--radius)',
                border: active
                  ? '1.5px solid var(--color-hero)'
                  : '1.5px solid var(--color-line)',
                background: active ? 'var(--color-hero-soft)' : '#fff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: active
                      ? '5px solid var(--color-hero)'
                      : '2px solid var(--color-line-2)',
                    background: '#fff',
                  }}
                />
                <div style={{ fontSize: 14, fontWeight: 700 }}>{p.label}</div>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--color-ink-4)',
                  marginTop: 4,
                  marginLeft: 28,
                }}
              >
                {p.desc}
              </div>
            </button>
          );
        })}
      </Field>
    </ModalShell>
  );
}
