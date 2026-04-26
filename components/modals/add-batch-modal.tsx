'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addBatch } from '@/lib/api';
import { useModal } from '@/lib/store/modal';
import { ModalShell, Field } from './modal-shell';

const STEPS = ['ข้อมูลล็อต', 'ผลตรวจ PCR', 'ยืนยัน'] as const;
const SOURCES = [
  'CP-Genetics Line A',
  'CP-Genetics Line B',
  'SyAqua Line 7',
  'Shrimp Improvement Sys.',
];

export function AddBatchModal() {
  const close = useModal((s) => s.close);
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [f, setF] = useState({
    source: SOURCES[0],
    plProduced: 2_000_000,
    date: new Date().toISOString().slice(0, 10),
    pcr: 'pending' as 'clean' | 'flagged' | 'pending',
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((s) => ({ ...s, [k]: v }));

  const mutation = useMutation({
    mutationFn: () => addBatch({ source: f.source, plProduced: f.plProduced, date: f.date, pcr: 'clean' }),
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ['batches'] });
      toast.success(`ลงทะเบียนล็อต ${b.source} แล้ว`);
      close();
    },
  });

  const next = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      mutation.mutate();
    }
  };

  return (
    <ModalShell
      title="ลงทะเบียนล็อตใหม่"
      subtitle={`ขั้นที่ ${step} จาก 3 — ${STEPS[step - 1]}`}
      footer={
        <>
          {step > 1 && (
            <button
              className="aw3-btn aw3-btn-ghost"
              type="button"
              onClick={() => setStep(step - 1)}
            >
              ย้อนกลับ
            </button>
          )}
          <button
            className="aw3-btn aw3-btn-hero"
            type="button"
            onClick={next}
            disabled={mutation.isPending}
          >
            {step === 3 ? (mutation.isPending ? 'กำลังบันทึก…' : 'ลงทะเบียน') : 'ถัดไป →'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 'var(--radius-pill)',
              background:
                i + 1 <= step ? 'var(--color-hero)' : 'var(--color-line-2)',
            }}
          />
        ))}
      </div>

      {step === 1 && (
        <>
          <Field label="สายพันธุ์">
            <select
              className="aw3-input"
              value={f.source}
              onChange={(e) => set('source', e.target.value)}
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="วันที่ลงไข่">
            <input
              className="aw3-input"
              type="date"
              value={f.date}
              onChange={(e) => set('date', e.target.value)}
            />
          </Field>
          <Field label="จำนวน PL ที่ผลิต" hint="หน่วยล้านตัว">
            <input
              className="aw3-input"
              type="number"
              step="0.1"
              value={f.plProduced / 1_000_000}
              onChange={(e) =>
                set('plProduced', parseFloat(e.target.value) * 1_000_000)
              }
            />
          </Field>
        </>
      )}

      {step === 2 && (
        <>
          <div
            style={{
              fontSize: 13,
              color: 'var(--color-ink-3)',
              marginBottom: 14,
            }}
          >
            เลือกอัปโหลดไฟล์ PCR หรือกรอกผลด้วยตัวเอง
          </div>
          <div
            style={{
              padding: 24,
              borderRadius: 'var(--radius)',
              background: 'var(--color-soft)',
              border: '2px dashed var(--color-line-2)',
              textAlign: 'center',
              marginBottom: 18,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>อัปโหลดไฟล์ PCR</div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--color-ink-4)',
                marginTop: 4,
              }}
            >
              PDF, JPG หรือ PNG
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['WSSV', 'EHP', 'IHHNV', 'TSV'] as const).map((d) => (
              <div
                key={d}
                style={{
                  flex: 1,
                  padding: 12,
                  background: 'var(--color-good-tint)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--color-good)',
                    fontWeight: 700,
                  }}
                >
                  {d}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: 'var(--color-good)',
                    marginTop: 2,
                  }}
                >
                  ✓ ผ่าน
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <div>
          <div
            style={{
              padding: 18,
              borderRadius: 'var(--radius)',
              background: 'var(--color-soft)',
              marginBottom: 14,
            }}
          >
            {(
              [
                ['สายพันธุ์', f.source],
                ['วันที่ลงไข่', f.date],
                ['ปริมาณ', `${(f.plProduced / 1_000_000).toFixed(1)}M PL`],
                ['PCR', '✓ ผ่านทุกชนิด'],
              ] as const
            ).map(([k, v], i) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderTop: i > 0 ? '1px solid var(--color-line)' : 0,
                }}
              >
                <span style={{ color: 'var(--color-ink-3)', fontSize: 13 }}>
                  {k}
                </span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--color-ink-4)' }}>
            กดลงทะเบียนเพื่อสร้างใบรับรองและเปิดให้ขายในระบบ
          </div>
        </div>
      )}
    </ModalShell>
  );
}
