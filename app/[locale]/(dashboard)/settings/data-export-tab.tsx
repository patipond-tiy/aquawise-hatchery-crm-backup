'use client';

import { V3Grid } from '@/components/aw/v3-grid';
import { V3Card } from '@/components/aw/v3-card';

export function DataExport() {
  const items = [
    {
      title: 'ส่งออกข้อมูลลูกค้า',
      desc: 'CSV รายชื่อฟาร์ม ประวัติการสั่ง และผลลัพธ์',
      cta: 'ดาวน์โหลด CSV',
    },
    {
      title: 'ส่งออกประวัติ PCR',
      desc: 'PDF + ภาพถ่ายของทุกล็อตในช่วงที่เลือก',
      cta: 'ดาวน์โหลด ZIP',
    },
    {
      title: 'สำรองข้อมูลทั้งหมด',
      desc: 'JSON สำรองไว้ — ใช้เมื่อย้ายระบบ',
      cta: 'ดาวน์โหลด',
    },
    {
      title: 'ลบข้อมูลทั้งหมด',
      desc: 'ทำไม่ได้กลับ — ติดต่อทีมงานก่อน',
      cta: 'ติดต่อทีม',
      danger: true,
    },
  ];
  return (
    <V3Grid cols={2} gap={16} style={{ maxWidth: 920 }}>
      {items.map((r, i) => (
        <V3Card key={i} pad={22} style={{ border: '1px solid var(--color-line)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{r.title}</h3>
          <div
            style={{
              fontSize: 13,
              color: 'var(--color-ink-3)',
              marginTop: 6,
              lineHeight: 1.6,
              marginBottom: 16,
            }}
          >
            {r.desc}
          </div>
          <button
            type="button"
            className={r.danger ? 'aw3-btn aw3-btn-ghost' : 'aw3-btn aw3-btn-soft'}
            style={{ color: r.danger ? 'var(--color-bad)' : undefined }}
          >
            {r.cta}
          </button>
        </V3Card>
      ))}
    </V3Grid>
  );
}
