'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { V3Grid } from '@/components/aw/v3-grid';
import { V3Card } from '@/components/aw/v3-card';

type Kind = 'customers_csv' | 'pcr_zip' | 'full_backup';

export function DataExport() {
  const [busy, setBusy] = useState<Kind | null>(null);

  const download = async (kind: Kind) => {
    setBusy(kind);
    try {
      const res = await fetch(`/api/export/${kind}`);
      if (!res.ok) {
        if (res.status === 403) {
          toast.error('บทบาทของคุณไม่มีสิทธิ์ส่งออกข้อมูล');
        } else {
          toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
        }
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition') ?? '';
      const m = cd.match(/filename="([^"]+)"/);
      const filename = m?.[1] ?? `${kind}.dat`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('ดาวน์โหลดสำเร็จ');
    } catch {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setBusy(null);
    }
  };

  const items: {
    title: string;
    desc: string;
    cta: string;
    kind?: Kind;
    danger?: boolean;
  }[] = [
    {
      title: 'ส่งออกข้อมูลลูกค้า',
      desc: 'CSV รายชื่อฟาร์ม เจ้าของ เบอร์โทร โซน สถานะ',
      cta: 'ดาวน์โหลด CSV',
      kind: 'customers_csv',
    },
    {
      title: 'ส่งออกประวัติ PCR',
      desc: 'ZIP ใบรับรอง PCR ของทุกล็อต',
      cta: 'ดาวน์โหลด ZIP',
      kind: 'pcr_zip',
    },
    {
      title: 'สำรองข้อมูลทั้งหมด',
      desc: 'NDJSON สำรองไว้ — ใช้เมื่อย้ายระบบ',
      cta: 'ดาวน์โหลด',
      kind: 'full_backup',
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
            disabled={r.kind ? busy === r.kind : false}
            onClick={() => {
              if (r.kind) void download(r.kind);
              else
                toast.message(
                  'กรุณาติดต่อทีมงานเพื่อขอลบข้อมูลตามสิทธิ PDPA'
                );
            }}
          >
            {r.kind && busy === r.kind ? 'กำลังเตรียมข้อมูล…' : r.cta}
          </button>
        </V3Card>
      ))}
    </V3Grid>
  );
}
