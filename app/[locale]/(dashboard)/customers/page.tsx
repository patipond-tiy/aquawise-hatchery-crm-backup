'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { listCustomers } from '@/lib/api';
import { useModal } from '@/lib/store/modal';
import type { Customer } from '@/lib/types';
import { V3Card } from '@/components/aw/v3-card';
import { V3Grid } from '@/components/aw/v3-grid';
import { V3Chip } from '@/components/aw/v3-chip';
import { V3Avatar } from '@/components/aw/v3-avatar';

type Filter = 'all' | 'active' | 'restock' | 'concern';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'active', label: 'กำลังเลี้ยง' },
  { id: 'restock', label: 'ใกล้ครบรอบ' },
  { id: 'concern', label: 'น่าห่วง' },
];

const TONES = ['lav', 'peach', 'mint', 'sky', 'rose', 'amber'] as const;

function applyFilter(c: Customer, filter: Filter): boolean {
  if (filter === 'active' && !c.cycleDay) return false;
  if (filter === 'restock' && c.restockIn == null) return false;
  if (
    filter === 'concern' &&
    c.status !== 'concern' &&
    c.status !== 'restock-now'
  )
    return false;
  return true;
}

export default function CustomersPage() {
  const router = useRouter();
  const openModal = useModal((s) => s.open);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: listCustomers,
  });

  const filtered = customers.filter((c) => {
    if (q && !(c.farm + c.name).toLowerCase().includes(q.toLowerCase()))
      return false;
    return applyFilter(c, filter);
  });

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '-0.01em',
          }}
        >
          ลูกค้า
        </h1>
        <button
          type="button"
          className="aw3-btn aw3-btn-hero aw3-btn-sm"
          onClick={() => openModal('addCustomer')}
        >
          + เพิ่มลูกค้า
        </button>
      </div>
      <div
        style={{
          color: 'var(--color-ink-3)',
          fontSize: 15,
          marginBottom: 24,
        }}
      >
        {customers.length} ฟาร์ม · {customers.filter((c) => c.cycleDay).length} กำลังเลี้ยง
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <input
          className="aw3-input"
          placeholder="ค้นหาฟาร์มหรือเจ้าของ…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1 }}
        />
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: 4,
            background: 'var(--color-soft)',
            borderRadius: 'var(--radius)',
          }}
        >
          {FILTERS.map((t) => {
            const active = filter === t.id;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setFilter(t.id)}
                style={{
                  padding: '8px 16px',
                  border: 0,
                  borderRadius: 'var(--radius-sm)',
                  background: active ? '#fff' : 'transparent',
                  color: active ? 'var(--color-ink)' : 'var(--color-ink-3)',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <V3Grid cols={2} gap={14}>
        {filtered.map((c, i) => (
          <V3Card
            key={c.id}
            pad={18}
            hover
            onClick={() => router.push({ pathname: '/customers/[id]', params: { id: c.id } } as never)}
            style={{
              border: '1px solid var(--color-line)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <V3Avatar name={c.farm} tone={TONES[i % TONES.length]} size={48} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{c.farm}</span>
                {c.status === 'restock-now' && (
                  <V3Chip tone="bad" size="xs">
                    ติดต่อด่วน
                  </V3Chip>
                )}
                {c.status === 'concern' && (
                  <V3Chip tone="amber" size="xs">
                    น่าห่วง
                  </V3Chip>
                )}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--color-ink-3)',
                  marginTop: 2,
                }}
              >
                {c.name} · {c.zone}
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 12 }}>
                  <b>{c.batches}</b> รอบ
                </span>
                <span style={{ fontSize: 12 }}>
                  มูลค่า ฿{(c.ltv / 1000).toFixed(0)}k
                </span>
                {c.cycleDay && (
                  <span style={{ fontSize: 12 }}>วันที่ {c.cycleDay}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal('sendLine', { customer: c });
              }}
              style={{
                background: 'transparent',
                border: 0,
                padding: 8,
                cursor: 'pointer',
                color: 'var(--color-hero)',
                fontSize: 18,
              }}
              aria-label="Send LINE"
            >
              💬
            </button>
          </V3Card>
        ))}
        {filtered.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: 60,
              textAlign: 'center',
              color: 'var(--color-ink-4)',
            }}
          >
            ไม่พบลูกค้าที่ตรงกับการค้นหา
          </div>
        )}
      </V3Grid>
    </div>
  );
}
