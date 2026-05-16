'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getNursery } from '@/lib/api';
import { updateRestockThresholdsAction } from './actions';
import { V3Card } from '@/components/aw/v3-card';
import { Field } from '@/components/modals/modal-shell';

/**
 * D1 — per-nursery restock urgency thresholds editor. Three controlled
 * number inputs seeded from the real `getNursery().restockThresholds`.
 * Submit calls the owner-only `updateRestockThresholdsAction` server action.
 */
export function RestockThresholds() {
  const qc = useQueryClient();
  const { data: nursery } = useQuery({
    queryKey: ['nursery'],
    queryFn: getNursery,
  });

  const [now, setNow] = useState<string>('');
  const [week, setWeek] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [seeded, setSeeded] = useState(false);

  if (nursery && !seeded) {
    setNow(String(nursery.restockThresholds.now));
    setWeek(String(nursery.restockThresholds.week));
    setMonth(String(nursery.restockThresholds.month));
    setSeeded(true);
  }

  const save = async () => {
    const n = parseInt(now, 10);
    const w = parseInt(week, 10);
    const m = parseInt(month, 10);
    if (Number.isNaN(n) || Number.isNaN(w) || Number.isNaN(m)) {
      toast.error('กรุณากรอกตัวเลขให้ครบ');
      return;
    }
    setSaving(true);
    const res = await updateRestockThresholdsAction({
      now: n,
      week: w,
      month: m,
    });
    setSaving(false);
    if (res.ok) {
      qc.setQueryData(
        ['nursery'],
        nursery
          ? { ...nursery, restockThresholds: { now: n, week: w, month: m } }
          : nursery
      );
      qc.invalidateQueries({ queryKey: ['nursery'] });
      toast.success('บันทึกแล้ว');
    } else {
      toast.error(res.error);
    }
  };

  if (!nursery) return null;

  return (
    <V3Card
      pad={26}
      style={{ border: '1px solid var(--color-line)', maxWidth: 560 }}
    >
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>
        กำหนดช่วงเวลาการเติมสต็อก
      </h3>
      <div
        style={{
          fontSize: 12.5,
          color: 'var(--color-ink-4)',
          marginBottom: 20,
        }}
      >
        ใช้จัดกลุ่มฟาร์มในหน้า &ldquo;ฟาร์มที่ใกล้ครบรอบ&rdquo; — ค่าต้องเรียงจากน้อยไปมาก
      </div>

      <Field label="ด่วน (วัน ≤)">
        <input
          className="aw3-input"
          type="number"
          min={0}
          value={now}
          onChange={(e) => setNow(e.target.value)}
        />
      </Field>
      <Field label="สัปดาห์นี้ (วัน ≤)">
        <input
          className="aw3-input"
          type="number"
          min={0}
          value={week}
          onChange={(e) => setWeek(e.target.value)}
        />
      </Field>
      <Field label="เดือนนี้ (วัน ≤)">
        <input
          className="aw3-input"
          type="number"
          min={0}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </Field>

      <button
        type="button"
        className="aw3-btn aw3-btn-hero"
        onClick={save}
        disabled={saving}
        style={{ marginTop: 8 }}
      >
        {saving ? 'กำลังบันทึก…' : 'บันทึก'}
      </button>
    </V3Card>
  );
}
