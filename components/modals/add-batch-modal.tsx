'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { addBatchAction } from '@/app/[locale]/(dashboard)/batches/actions';
import { useModal } from '@/lib/store/modal';
import { ModalShell, Field } from './modal-shell';

type Species = 'vannamei' | 'monodon';

const STEPS = ['ข้อมูลล็อต', 'ผลตรวจ PCR', 'ยืนยัน'] as const;
const SOURCES = [
  'CP-Genetics Line A',
  'CP-Genetics Line B',
  'SyAqua Line 7',
  'Charoen Line 3',
  'Shrimp Improvement Sys.',
];
const DISEASES = ['WSSV', 'EHP', 'IHHNV', 'TSV'] as const;

type Result = 'negative' | 'positive';

export function AddBatchModal() {
  const close = useModal((s) => s.close);
  const qc = useQueryClient();
  const tSpecies = useTranslations('batches.species');
  const [step, setStep] = useState(1);
  const [species, setSpecies] = useState<Species>('vannamei');
  const [f, setF] = useState({
    source: SOURCES[0],
    plProduced: 2_000_000,
    date: new Date().toISOString().slice(0, 10),
  });
  const [results, setResults] = useState<Record<string, Result>>(
    Object.fromEntries(DISEASES.map((d) => [d, 'negative']))
  );
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((s) => ({ ...s, [k]: v }));

  const mutation = useMutation({
    mutationFn: () =>
      addBatchAction({
        source: f.source,
        plProduced: f.plProduced,
        date: f.date,
        species,
        pcrResults: DISEASES.map((d) => ({
          disease: d,
          status: results[d],
        })),
        pcrLab: 'กรมประมง',
        pcrFileUrl: fileName || undefined,
      }),
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ['batches'] });
      toast.success(`เพิ่มล็อต "${b.id}" แล้ว`);
      close();
    },
    onError: (e) => {
      setError(
        e instanceof Error ? e.message : 'ลงทะเบียนล็อตไม่สำเร็จ'
      );
    },
  });

  const next = () => {
    setError('');
    // AC #8: cannot advance past PCR step without a file.
    if (step === 2 && !fileName) {
      setError('กรุณาอัปโหลดผล PCR ก่อนดำเนินการต่อ');
      return;
    }
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
              onClick={() => {
                setError('');
                setStep(step - 1);
              }}
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
            {step === 3
              ? mutation.isPending
                ? 'กำลังบันทึก…'
                : 'ลงทะเบียน'
              : 'ถัดไป →'}
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
                i + 1 <= step
                  ? 'var(--color-hero)'
                  : 'var(--color-line-2)',
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
          <Field label="ชนิดสัตว์น้ำ">
            <select
              className="aw3-input"
              value={species}
              onChange={(e) => setSpecies(e.target.value as Species)}
            >
              <option value="vannamei">{tSpecies('vannamei')}</option>
              <option value="monodon">{tSpecies('monodon')}</option>
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
                set(
                  'plProduced',
                  parseFloat(e.target.value) * 1_000_000
                )
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
            อัปโหลดไฟล์ PCR แล้วระบุผลแต่ละโรค
          </div>
          <label
            style={{
              display: 'block',
              padding: 24,
              borderRadius: 'var(--radius)',
              background: 'var(--color-soft)',
              border: '2px dashed var(--color-line-2)',
              textAlign: 'center',
              marginBottom: 18,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              {fileName || 'เลือกไฟล์ PCR'}
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--color-ink-4)',
                marginTop: 4,
              }}
            >
              PDF, JPG หรือ PNG
            </div>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={(e) =>
                setFileName(e.target.files?.[0]?.name ?? '')
              }
            />
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {DISEASES.map((d) => {
              const positive = results[d] === 'positive';
              return (
                <button
                  type="button"
                  key={d}
                  onClick={() =>
                    setResults((r) => ({
                      ...r,
                      [d]: positive ? 'negative' : 'positive',
                    }))
                  }
                  style={{
                    flex: 1,
                    padding: 12,
                    background: positive
                      ? 'var(--color-bad-tint)'
                      : 'var(--color-good-tint)',
                    borderRadius: 'var(--radius-sm)',
                    border: 0,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: positive
                        ? 'var(--color-bad)'
                        : 'var(--color-good)',
                      fontWeight: 700,
                    }}
                  >
                    {d}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: positive
                        ? 'var(--color-bad)'
                        : 'var(--color-good)',
                      marginTop: 2,
                    }}
                  >
                    {positive ? 'พบเชื้อ' : 'ไม่พบเชื้อ'}
                  </div>
                </button>
              );
            })}
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
                [
                  'ปริมาณ',
                  `${(f.plProduced / 1_000_000).toFixed(1)}M PL`,
                ],
                ['ไฟล์ PCR', fileName || '—'],
                [
                  'ผล PCR',
                  DISEASES.every((d) => results[d] === 'negative')
                    ? 'ไม่พบเชื้อทุกชนิด'
                    : DISEASES.filter(
                        (d) => results[d] === 'positive'
                      ).join(', ') + ' พบเชื้อ',
                ],
              ] as const
            ).map(([k, v], i) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderTop:
                    i > 0 ? '1px solid var(--color-line)' : 0,
                }}
              >
                <span
                  style={{
                    color: 'var(--color-ink-3)',
                    fontSize: 13,
                  }}
                >
                  {k}
                </span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{ fontSize: 12.5, color: 'var(--color-ink-4)' }}
          >
            กดลงทะเบียนเพื่อบันทึกล็อตและผลตรวจ PCR
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            color: 'var(--color-bad)',
            fontSize: 13,
            marginTop: 14,
          }}
        >
          {error}
        </div>
      )}
    </ModalShell>
  );
}
