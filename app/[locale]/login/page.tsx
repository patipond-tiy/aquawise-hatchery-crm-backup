'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { V3Mark } from '@/components/aw/v3-mark';

// Story S2 AC#6 — Cloudflare Turnstile on the magic-link OTP endpoint.
// The widget only renders when NEXT_PUBLIC_TURNSTILE_SITE_KEY is configured
// (and the matching secret + CAPTCHA provider must be enabled in the
// Supabase Dashboard — documented residual in S2). When unset (e.g. local
// mock dev) the form works without a token and Supabase does not enforce
// CAPTCHA, so the dev click-through path is unaffected.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export default function LoginPage() {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || sent) return;
    let raf = 0;
    const tryRender = () => {
      if (
        window.turnstile &&
        captchaRef.current &&
        widgetIdRef.current === null
      ) {
        widgetIdRef.current = window.turnstile.render(captchaRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => setCaptchaToken(token),
          'expired-callback': () => setCaptchaToken(null),
          'error-callback': () => setCaptchaToken(null),
        });
      } else if (widgetIdRef.current === null) {
        raf = window.requestAnimationFrame(tryRender);
      }
    };
    tryRender();
    return () => window.cancelAnimationFrame(raf);
  }, [sent]);

  const submit = async () => {
    if (!email.includes('@')) {
      toast.error('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      toast.error(t('Login.captcha.required'));
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        ...(captchaToken ? { captchaToken } : {}),
      },
    });
    setPending(false);
    if (error) {
      // Reset the widget so the user can re-attempt with a fresh token.
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
        setCaptchaToken(null);
      }
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
            {TURNSTILE_SITE_KEY && (
              <>
                <Script
                  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                  strategy="afterInteractive"
                />
                <div
                  ref={captchaRef}
                  aria-label={t('Login.captcha.label')}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 14,
                  }}
                />
              </>
            )}
            <button
              type="button"
              className="aw3-btn aw3-btn-hero"
              onClick={submit}
              disabled={
                pending || (Boolean(TURNSTILE_SITE_KEY) && !captchaToken)
              }
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
