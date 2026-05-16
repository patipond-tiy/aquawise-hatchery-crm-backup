'use client';

import { useState } from 'react';
import { Profile } from './profile-tab';
import { Notifications } from './notifications-tab';
import { Team } from './team-tab';
import { DataExport } from './data-export-tab';
import { Billing } from './billing-tab';

type TabId = 'profile' | 'notifications' | 'team' | 'data' | 'billing';

const TABS: { id: TabId; label: string }[] = [
  { id: 'profile', label: 'โปรไฟล์ฟาร์ม' },
  { id: 'notifications', label: 'การแจ้งเตือน' },
  { id: 'team', label: 'ทีมงาน' },
  { id: 'data', label: 'ข้อมูลและส่งออก' },
  { id: 'billing', label: 'แพ็กเกจ' },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>('profile');

  return (
    <div>
      <h1
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.01em',
        }}
      >
        ตั้งค่า
      </h1>
      <div
        style={{
          color: 'var(--color-ink-3)',
          fontSize: 15,
          marginBottom: 24,
          marginTop: 4,
        }}
      >
        จัดการโปรไฟล์ การแจ้งเตือน และข้อมูลส่งออก
      </div>

      <div
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 22,
          padding: 4,
          background: 'var(--color-soft)',
          borderRadius: 'var(--radius)',
          width: 'fit-content',
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              type="button"
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 18px',
                border: 0,
                borderRadius: 'var(--radius-sm)',
                background: active ? '#fff' : 'transparent',
                color: active ? 'var(--color-ink)' : 'var(--color-ink-3)',
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'profile' && <Profile />}
      {tab === 'notifications' && <Notifications />}
      {tab === 'team' && <Team />}
      {tab === 'data' && <DataExport />}
      {tab === 'billing' && <Billing />}
    </div>
  );
}
