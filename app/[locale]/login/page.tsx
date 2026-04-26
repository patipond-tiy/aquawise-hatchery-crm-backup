'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { V3Mark } from '@/components/aw/v3-mark';

export default function LoginPage() {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email.includes('@')) {
      toast.error('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--color-canvas)',
      }}
    >
      <div
        className="aw3-card"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 36,
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <V3Mark size={56} />
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
          {t('app.title')}
        </h1>
        <div
          style={{
            color: 'var(--color-ink-3)',
            fontSize: 14,
            marginTop: 6,
            marginBottom: 28,
          }}
        >
          {t('app.tagline')}
        </div>

        {sent ? (
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📨</div>
            <div style={{ fontWeight: 700 }}>
              ส่งลิงก์เข้าสู่ระบบไปที่ {email} แล้ว
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--color-ink-3)',
                marginTop: 8,
              }}
            >
              เปิดอีเมลและกดลิงก์เพื่อเข้าสู่ระบบ
            </div>
          </div>
        ) : (
          <>
            <input
              className="aw3-input"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ textAlign: 'center', marginBottom: 14 }}
            />
            <button
              type="button"
              className="aw3-btn aw3-btn-hero"
              onClick={submit}
              disabled={pending}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {pending ? 'กำลังส่ง…' : 'ส่งลิงก์เข้าสู่ระบบ'}
            </button>
            <div
              style={{
                fontSize: 12,
                color: 'var(--color-ink-4)',
                marginTop: 16,
              }}
            >
              เราจะส่งลิงก์เข้าสู่ระบบให้ทางอีเมล (Magic Link)
            </div>
          </>
        )}
      </div>
    </div>
  );
}
