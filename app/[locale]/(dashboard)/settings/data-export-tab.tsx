'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { V3Grid } from '@/components/aw/v3-grid';
import { V3Card } from '@/components/aw/v3-card';

type Kind = 'customers_csv' | 'pcr_zip' | 'full_backup';

export function DataExport() {
  const t = useTranslations();
  const [busy, setBusy] = useState<Kind | null>(null);
  const [dsrBusy, setDsrBusy] = useState<'export' | 'delete' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Story S7 — PDPA DSR self-service (DSR-SPEC §3). Subject = the signed-in
  // operator. 60s client-side cooldown after a request (server enforces the
  // real 5/24h limit via dsr_rate_check).
  const dsrExport = async () => {
    setDsrBusy('export');
    try {
      const res = await fetch('/api/dsr/export');
      if (res.status === 404) {
        toast.message(t('Settings.privacy.export.empty'));
        return;
      }
      if (res.status === 429) {
        toast.error(t('Settings.privacy.rate_limited'));
        return;
      }
      if (!res.ok) {
        toast.error(t('Settings.privacy.error'));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dsr-export.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t('Settings.privacy.export.done'));
    } catch {
      toast.error(t('Settings.privacy.error'));
    } finally {
      setTimeout(() => setDsrBusy(null), 60_000);
      setDsrBusy(null);
    }
  };

  const dsrDelete = async () => {
    setDsrBusy('delete');
    setConfirmDelete(false);
    try {
      const res = await fetch('/api/dsr/delete', { method: 'POST' });
      if (res.status === 429) {
        toast.error(t('Settings.privacy.rate_limited'));
        return;
      }
      if (!res.ok) {
        toast.error(t('Settings.privacy.error'));
        return;
      }
      toast.success(t('Settings.privacy.delete.done'));
      // §3.2 — session invalidated server-side; send the user to login.
      setTimeout(() => {
        window.location.href = '/th/login';
      }, 1500);
    } catch {
      toast.error(t('Settings.privacy.error'));
    } finally {
      setDsrBusy(null);
    }
  };

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
  ];

  return (
    <div style={{ maxWidth: 920 }}>
      <V3Grid cols={2} gap={16}>
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
              className="aw3-btn aw3-btn-soft"
              disabled={r.kind ? busy === r.kind : false}
              onClick={() => {
                if (r.kind) void download(r.kind);
              }}
            >
              {r.kind && busy === r.kind ? 'กำลังเตรียมข้อมูล…' : r.cta}
            </button>
          </V3Card>
        ))}
      </V3Grid>

      {/* Story S7 — PDPA Privacy & Data (DSR self-service). Voice:
          ลูกหลานที่เรียนมา — respectful, factual, no exclamation. */}
      <h2
        style={{
          margin: '32px 0 4px',
          fontSize: 20,
          fontWeight: 800,
        }}
      >
        {t('Settings.privacy.title')}
      </h2>
      <div
        style={{
          fontSize: 13,
          color: 'var(--color-ink-3)',
          marginBottom: 16,
          lineHeight: 1.6,
        }}
      >
        {t('Settings.privacy.intro')}
      </div>
      <V3Grid cols={2} gap={16}>
        <V3Card pad={22} style={{ border: '1px solid var(--color-line)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
            {t('Settings.privacy.export.title')}
          </h3>
          <div
            style={{
              fontSize: 13,
              color: 'var(--color-ink-3)',
              marginTop: 6,
              lineHeight: 1.6,
              marginBottom: 16,
            }}
          >
            {t('Settings.privacy.export.desc')}
          </div>
          <button
            type="button"
            className="aw3-btn aw3-btn-soft"
            disabled={dsrBusy !== null}
            onClick={() => void dsrExport()}
          >
            {dsrBusy === 'export'
              ? t('Settings.privacy.working')
              : t('Settings.privacy.export.button')}
          </button>
        </V3Card>
        <V3Card pad={22} style={{ border: '1px solid var(--color-line)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
            {t('Settings.privacy.delete.title')}
          </h3>
          <div
            style={{
              fontSize: 13,
              color: 'var(--color-ink-3)',
              marginTop: 6,
              lineHeight: 1.6,
              marginBottom: 16,
            }}
          >
            {t('Settings.privacy.delete.desc')}
          </div>
          <button
            type="button"
            className="aw3-btn aw3-btn-ghost"
            style={{ color: 'var(--color-bad)' }}
            disabled={dsrBusy !== null}
            onClick={() => setConfirmDelete(true)}
          >
            {dsrBusy === 'delete'
              ? t('Settings.privacy.working')
              : t('Settings.privacy.delete.button')}
          </button>
        </V3Card>
      </V3Grid>

      {confirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: 24,
          }}
        >
          <V3Card pad={28} style={{ maxWidth: 440, background: '#fff' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
              {t('Settings.privacy.delete.confirm.title')}
            </h3>
            <div
              style={{
                fontSize: 14,
                color: 'var(--color-ink-3)',
                marginTop: 10,
                marginBottom: 22,
                lineHeight: 1.7,
              }}
            >
              {t('Settings.privacy.delete.confirm.body')}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="aw3-btn aw3-btn-ghost"
                onClick={() => setConfirmDelete(false)}
              >
                {t('Settings.privacy.delete.confirm.cancel')}
              </button>
              <button
                type="button"
                className="aw3-btn aw3-btn-soft"
                style={{ color: 'var(--color-bad)' }}
                onClick={() => void dsrDelete()}
              >
                {t('Settings.privacy.delete.confirm.confirm')}
              </button>
            </div>
          </V3Card>
        </div>
      )}
    </div>
  );
}
