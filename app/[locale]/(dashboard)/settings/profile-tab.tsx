'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getNursery } from '@/lib/api';
import type { Nursery } from '@/lib/types';
import { V3Card } from '@/components/aw/v3-card';
import { V3Grid, V3Col } from '@/components/aw/v3-grid';
import { V3Mark } from '@/components/aw/v3-mark';

export function Profile() {
  // AC#1 — inputs are seeded from the fetched nursery (not hardcoded
  // defaults). The inner form is keyed by the loaded row so its useState
  // initializers take the real values without a setState-in-effect.
  const { data: nursery } = useQuery({
    queryKey: ['nursery'],
    queryFn: getNursery,
  });

  return (
    <ProfileForm
      key={nursery ? `${nursery.name}|${nursery.nameEn}` : 'loading'}
      nursery={nursery ?? null}
    />
  );
}

function ProfileForm({ nursery }: { nursery: Nursery | null }) {
  const [name, setName] = useState(nursery?.name ?? '');
  const [nameEn, setNameEn] = useState(nursery?.nameEn ?? '');
  const [location, setLocation] = useState(nursery?.location ?? '');
  const [locationEn, setLocationEn] = useState(nursery?.locationEn ?? '');
  const [displayNameTh, setDisplayNameTh] = useState(nursery?.name ?? '');
  const [displayNameEn, setDisplayNameEn] = useState(nursery?.nameEn ?? '');
  const [brandColor, setBrandColor] = useState('#1F6FEB');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { updateProfile } = await import('./actions');
    const result = await updateProfile(
      {
        name,
        name_en: nameEn,
        location,
        location_en: locationEn,
        display_name_th: displayNameTh,
        display_name_en: displayNameEn,
        brand_color: brandColor,
      },
      logoFile
    );
    setSaving(false);
    if (result.ok) {
      toast.success('บันทึกสำเร็จ');
    } else {
      toast.error(result.error);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoFile(e.target.files?.[0] ?? null);
  };

  const FIELDS: { label: string; value: string; onChange: (v: string) => void }[] = [
    { label: 'ชื่อโรงเพาะ', value: name, onChange: setName },
    { label: 'ชื่อภาษาอังกฤษ', value: nameEn, onChange: setNameEn },
    { label: 'ที่อยู่', value: location, onChange: setLocation },
    { label: 'ที่อยู่ (อังกฤษ)', value: locationEn, onChange: setLocationEn },
    { label: 'ชื่อแบรนด์ (ไทย)', value: displayNameTh, onChange: setDisplayNameTh },
    { label: 'ชื่อแบรนด์ (อังกฤษ)', value: displayNameEn, onChange: setDisplayNameEn },
  ];

  return (
    <V3Grid cols={12} gap={16}>
      <V3Col span={8}>
        <V3Card pad={26} style={{ border: '1px solid var(--color-line)' }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>ข้อมูลฟาร์ม</h3>
          <div
            style={{
              fontSize: 13,
              color: 'var(--color-ink-3)',
              marginTop: 4,
              marginBottom: 22,
            }}
          >
            ข้อมูลนี้จะแสดงในใบรับรองและในโปรไฟล์สาธารณะ
          </div>
          {FIELDS.map((f) => (
            <div key={f.label} style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--color-ink-3)',
                  marginBottom: 6,
                }}
              >
                {f.label}
              </label>
              <input
                className="aw3-input"
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                style={{ fontSize: 14 }}
              />
            </div>
          ))}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--color-ink-3)',
                marginBottom: 6,
              }}
            >
              สีแบรนด์
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                style={{ width: 40, height: 36, cursor: 'pointer', border: 'none', padding: 2 }}
              />
              <input
                className="aw3-input"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                style={{ fontSize: 14, width: 120 }}
              />
            </div>
          </div>
          <button
            type="button"
            className="aw3-btn aw3-btn-hero"
            style={{ marginTop: 8 }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'กำลังบันทึก…' : 'บันทึก'}
          </button>
        </V3Card>
      </V3Col>
      <V3Col span={4}>
        <V3Card pad={22} style={{ border: '1px solid var(--color-line)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>โลโก้</h3>
          <div
            style={{
              marginTop: 14,
              height: 160,
              borderRadius: 'var(--radius)',
              background: 'var(--color-soft)',
              border: '2px dashed var(--color-line-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 8,
              color: 'var(--color-ink-4)',
            }}
          >
            <V3Mark size={48} />
            <div style={{ fontSize: 12, fontWeight: 600 }}>
              {logoFile ? logoFile.name : 'ลากไฟล์มาวางหรือคลิก'}
            </div>
          </div>
          <label style={{ display: 'block', marginTop: 12 }}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleLogoChange}
            />
            <span
              className="aw3-btn aw3-btn-soft"
              style={{ width: '100%', justifyContent: 'center', display: 'flex', cursor: 'pointer' }}
            >
              อัปโหลด
            </span>
          </label>
        </V3Card>
        <V3Card
          pad={22}
          style={{ border: '1px solid var(--color-line)', marginTop: 16 }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>เปิดมาแล้ว</h3>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              marginTop: 8,
              letterSpacing: '-0.02em',
            }}
          >
            8{' '}
            <span
              style={{
                fontSize: 14,
                color: 'var(--color-ink-4)',
                fontWeight: 600,
              }}
            >
              ปี
            </span>
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-ink-3)',
              marginTop: 4,
            }}
          >
            เริ่มกิจการ มี.ค. 2018
          </div>
        </V3Card>
      </V3Col>
    </V3Grid>
  );
}
