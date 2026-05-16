'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotificationSettings,
  updateNotificationSettings,
  getSubscription,
  listTeam,
} from '@/lib/api';
import {
  createCheckoutSession,
  createPortalSession,
  fetchInvoiceHistory,
} from './billing/actions';
import { useModal } from '@/lib/store/modal';
import {
  daysLeftInTrial,
  effectiveStatus,
} from '@/lib/billing/trial';
import { PRO_AMOUNT_THB } from '@/lib/stripe/config';
import { V3Card } from '@/components/aw/v3-card';
import { V3Grid, V3Col } from '@/components/aw/v3-grid';
import { V3Chip } from '@/components/aw/v3-chip';
import { V3Avatar } from '@/components/aw/v3-avatar';
import { V3Mark } from '@/components/aw/v3-mark';
import { Toggle } from '@/components/modals/modal-shell';

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

function Profile() {
  const [name, setName] = useState('ฟ้าใส แฮทเชอรี่');
  const [nameEn, setNameEn] = useState('Fasai Nursery');
  const [location, setLocation] = useState('78/12 ม.4 ต.บ้านบ่อ อ.เมือง สมุทรสาคร 74000');
  const [locationEn, setLocationEn] = useState('');
  const [displayNameTh, setDisplayNameTh] = useState('ฟ้าใส แฮทเชอรี่');
  const [displayNameEn, setDisplayNameEn] = useState('Fasai Nursery');
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

function Notifications() {
  const qc = useQueryClient();
  const { data: notifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotificationSettings,
  });
  const mutation = useMutation({
    mutationFn: updateNotificationSettings,
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: ['notifications'] });
      const prev = qc.getQueryData(['notifications']);
      qc.setQueryData(['notifications'], (s: typeof notifs) =>
        s ? { ...s, ...patch } : s
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['notifications'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (!notifs) return null;

  const ROWS: { key: keyof typeof notifs; label: string; desc: string }[] = [
    {
      key: 'restock',
      label: 'มีฟาร์มที่ใกล้ครบรอบ (≤14 วัน)',
      desc: 'สรุปทุกเช้า 7:00 น.',
    },
    {
      key: 'lowD30',
      label: 'D30 ของล็อตต่ำกว่าเป้า',
      desc: 'ส่งเมื่อมีฟาร์ม ≥2 ที่รายงานต่ำ',
    },
    {
      key: 'disease',
      label: 'พบเชื้อในล็อตที่ส่งไปแล้ว',
      desc: 'ส่งทันที + เสนอให้ส่งข้อความถึงทุกฟาร์ม',
    },
    {
      key: 'lineReply',
      label: 'ลูกค้าตอบรับใน LINE',
      desc: 'ทุกข้อความที่ส่งมา',
    },
    { key: 'weekly', label: 'สรุปรายสัปดาห์', desc: 'ทุกวันจันทร์เช้า' },
    {
      key: 'priceMove',
      label: 'ราคาตลาดเปลี่ยน > 5%',
      desc: 'จากตลาดทะเลไทย สมุทรสาคร',
    },
  ];

  return (
    <V3Card pad={26} style={{ border: '1px solid var(--color-line)', maxWidth: 720 }}>
      {ROWS.map((r, i) => (
        <div
          key={r.key}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '16px 0',
            borderTop: i > 0 ? '1px solid var(--color-line)' : 0,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{r.label}</div>
            <div
              style={{
                fontSize: 12.5,
                color: 'var(--color-ink-4)',
                marginTop: 2,
              }}
            >
              {r.desc}
            </div>
          </div>
          <Toggle
            on={notifs[r.key]}
            onChange={(v) => mutation.mutate({ [r.key]: v })}
          />
        </div>
      ))}
    </V3Card>
  );
}

const ROLE_LABELS: Record<string, { label: string; tone: 'solid' | 'sky' | 'soft' }> = {
  owner:         { label: 'เจ้าของ', tone: 'solid' },
  counter_staff: { label: 'เคาน์เตอร์', tone: 'sky' },
  lab_tech:      { label: 'PCR', tone: 'sky' },
  auditor:       { label: 'ดูเท่านั้น', tone: 'soft' },
};

const TONE_CYCLE = ['lav', 'mint', 'sky', 'rose', 'amber'] as const;

function Team() {
  const openModal = useModal((s) => s.open);
  const { data: team = [] } = useQuery({
    queryKey: ['team'],
    queryFn: listTeam,
  });

  return (
    <div>
      <V3Card
        pad={0}
        style={{
          border: '1px solid var(--color-line)',
          overflow: 'hidden',
          maxWidth: 820,
        }}
      >
        {team.map((t, i) => {
          const permInfo = ROLE_LABELS[t.perm] ?? { label: t.perm, tone: 'soft' as const };
          const tone = (t.tone as (typeof TONE_CYCLE)[number]) ?? TONE_CYCLE[i % TONE_CYCLE.length];
          return (
            <div
              key={t.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 22px',
                borderTop: i > 0 ? '1px solid var(--color-line)' : 0,
              }}
            >
              <V3Avatar name={t.name} tone={tone} size={42} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                  {t.role}
                </div>
              </div>
              <V3Chip tone={permInfo.tone} size="xs">
                {permInfo.label}
              </V3Chip>
              <button type="button" className="aw3-btn aw3-btn-ghost aw3-btn-sm">
                แก้ไข
              </button>
            </div>
          );
        })}
      </V3Card>
      <button
        type="button"
        className="aw3-btn aw3-btn-hero"
        style={{ marginTop: 16 }}
        onClick={() => openModal('invite')}
      >
        + เชิญสมาชิก
      </button>
    </div>
  );
}

function DataExport() {
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

function Billing() {
  const t = useTranslations('billing');
  const search = useSearchParams();

  // One-shot toast on Checkout return
  useEffect(() => {
    if (search.get('checkout') === 'success') toast.success(t('checkout_success'));
    if (search.get('checkout') === 'cancel') toast.message(t('checkout_canceled'));
  }, [search, t]);

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscription,
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoiceHistory,
  });

  if (!sub) return null;
  const status = effectiveStatus(sub.status, sub.trialEndsAt);
  const features = t('pro_features').split('|');

  return (
    <V3Grid cols={12} gap={16}>
      <V3Col span={7}>
        {(status === 'trialing' || status === 'trial_expired') && (
          <SubscribeCard
            status={status}
            daysLeft={daysLeftInTrial(sub.trialEndsAt)}
            trialEndsAt={sub.trialEndsAt}
            features={features}
          />
        )}
        {status === 'active' && (
          <ActiveCard sub={sub} />
        )}
        {status === 'past_due' && (
          <PastDueCard sub={sub} />
        )}
        {status === 'canceled' && (
          <SubscribeCard status="trial_expired" daysLeft={0} trialEndsAt={null} features={features} />
        )}
      </V3Col>
      <V3Col span={5}>
        <V3Card pad={22} style={{ border: '1px solid var(--color-line)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{t('payment_history')}</h3>
          {invoices.length === 0 ? (
            <div
              style={{
                fontSize: 13,
                color: 'var(--color-ink-4)',
                marginTop: 14,
                paddingTop: 14,
                borderTop: '1px solid var(--color-line)',
                textAlign: 'center',
              }}
            >
              {t('no_invoices')}
            </div>
          ) : (
            invoices.map((inv, i) => (
              <div
                key={inv.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 0',
                  borderTop: '1px solid var(--color-line)',
                  marginTop: i === 0 ? 14 : 0,
                  fontSize: 13,
                }}
              >
                <span style={{ color: 'var(--color-ink-3)' }}>
                  {inv.paidAt
                    ? new Date(inv.paidAt).toLocaleDateString()
                    : '—'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700 }}>
                    ฿{inv.amount.toLocaleString()}
                  </span>
                  {inv.pdfUrl && (
                    <a
                      href={inv.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 11,
                        color: 'var(--color-hero)',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      PDF
                    </a>
                  )}
                </span>
              </div>
            ))
          )}
        </V3Card>
      </V3Col>
    </V3Grid>
  );
}

function SubscribeCard({
  status,
  daysLeft,
  trialEndsAt,
  features,
}: {
  status: 'trialing' | 'trial_expired';
  daysLeft: number;
  trialEndsAt: string | null;
  features: string[];
}) {
  const t = useTranslations('billing');
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const subscribe = () => {
    setLoading(true);
    startTransition(async () => {
      const result = await createCheckoutSession();
      if (!result.ok) {
        toast.error(result.error);
        setLoading(false);
        return;
      }
      window.location.href = result.data.url;
    });
  };

  const isTrial = status === 'trialing';

  return (
    <V3Card
      pad={28}
      style={{
        border: '1px solid var(--color-line)',
        background: 'linear-gradient(135deg, #004AAD 0%, #1A66C7 100%)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.85)' }}>
        {isTrial ? t('free_trial_label') : t('current_plan')}
      </div>
      <h2
        style={{
          margin: '8px 0 0',
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: '-0.01em',
        }}
      >
        Pro
      </h2>
      <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>
        {PRO_AMOUNT_THB.toLocaleString()} ฿ / {t('per_month')}
        {isTrial && trialEndsAt
          ? ' · ' +
            t('trial_until', {
              date: new Date(trialEndsAt).toLocaleDateString(),
            })
          : ''}
      </div>

      {isTrial && (
        <div
          style={{
            marginTop: 14,
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(255,255,255,0.18)',
            borderRadius: 'var(--radius-pill)',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {t('trial_days_left', { days: Math.max(0, daysLeft) })}
        </div>
      )}

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '20px 0 0',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          fontSize: 13,
        }}
      >
        {features.map((f) => (
          <li key={f} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ opacity: 0.85 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="aw3-btn"
        onClick={subscribe}
        disabled={pending || loading}
        style={{
          background: '#fff',
          color: 'var(--color-hero)',
          marginTop: 24,
        }}
      >
        {loading ? t('preparing_checkout') : t('subscribe_cta')}
      </button>
    </V3Card>
  );
}

function ActiveCard({ sub }: { sub: import('@/lib/types').Subscription }) {
  const t = useTranslations('billing');
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const manage = () => {
    setLoading(true);
    startTransition(async () => {
      const result = await createPortalSession();
      if (!result.ok) {
        toast.error(result.error);
        setLoading(false);
        return;
      }
      window.location.href = result.data.url;
    });
  };

  return (
    <V3Card
      pad={28}
      style={{
        border: '1px solid var(--color-line)',
        background: 'linear-gradient(135deg, #004AAD 0%, #1A66C7 100%)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.85)' }}>
        {t('current_plan')}
      </div>
      <h2
        style={{
          margin: '8px 0 0',
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: '-0.01em',
        }}
      >
        Pro
      </h2>
      <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>
        {PRO_AMOUNT_THB.toLocaleString()} ฿ / {t('per_month')}
      </div>
      {sub.cancelAtPeriodEnd && sub.currentPeriodEnd ? (
        <div
          style={{
            marginTop: 14,
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(255,200,200,0.25)',
            borderRadius: 'var(--radius-pill)',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {t('canceled_until', {
            date: new Date(sub.currentPeriodEnd).toLocaleDateString(),
          })}
        </div>
      ) : (
        sub.currentPeriodEnd && (
          <div style={{ marginTop: 8, fontSize: 12.5, opacity: 0.85 }}>
            {t('next_renewal', {
              date: new Date(sub.currentPeriodEnd).toLocaleDateString(),
            })}
          </div>
        )
      )}

      <button
        type="button"
        className="aw3-btn"
        onClick={manage}
        disabled={pending || loading}
        style={{
          background: '#fff',
          color: 'var(--color-hero)',
          marginTop: 24,
        }}
      >
        {loading ? t('preparing_checkout') : t('manage_cta')}
      </button>
    </V3Card>
  );
}

function PastDueCard({ sub }: { sub: import('@/lib/types').Subscription }) {
  const t = useTranslations('billing');
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const manage = () => {
    setLoading(true);
    startTransition(async () => {
      const result = await createPortalSession();
      if (!result.ok) {
        toast.error(result.error);
        setLoading(false);
        return;
      }
      window.location.href = result.data.url;
    });
  };

  return (
    <V3Card
      pad={28}
      style={{
        border: '1.5px solid var(--color-bad)',
        background: 'var(--color-bad-tint)',
        color: 'var(--color-bad)',
      }}
    >
      <div className="eyebrow">{t('current_plan')} · Pro</div>
      <h2 style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 800 }}>
        {t('past_due_banner')}
      </h2>
      {sub.currentPeriodEnd && (
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9 }}>
          {t('next_renewal', {
            date: new Date(sub.currentPeriodEnd).toLocaleDateString(),
          })}
        </div>
      )}
      <button
        type="button"
        className="aw3-btn aw3-btn-hero"
        onClick={manage}
        disabled={pending || loading}
        style={{ marginTop: 22 }}
      >
        {loading ? t('preparing_checkout') : t('update_payment')}
      </button>
    </V3Card>
  );
}
