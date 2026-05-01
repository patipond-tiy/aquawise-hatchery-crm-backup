'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { exchangeCodeAction, bootstrapCurrentUserAction } from './actions';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const code = searchParams.get('code');

      // PKCE flow — production OTP path from /login
      if (code) {
        const r = await exchangeCodeAction(code);
        if (cancelled) return;
        if (!r.ok) return setError(r.error ?? 'Sign-in failed');
        router.replace('/th');
        return;
      }

      // Implicit/hash flow — admin-generated magic links + some OAuth providers
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : '';
      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        const supabase = createClient();
        const { error: setErr } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (cancelled) return;
        if (setErr) return setError(setErr.message);

        const r = await bootstrapCurrentUserAction();
        if (cancelled) return;
        if (!r.ok) return setError(r.error ?? 'Bootstrap failed');
        router.replace('/th');
        return;
      }

      setError('No auth code or token in callback URL.');
    })();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      {error ? (
        <div style={{ color: 'crimson', textAlign: 'center', padding: 24 }}>
          <h2>Sign-in error</h2>
          <p>{error}</p>
          <a href="/th/login">Back to login</a>
        </div>
      ) : (
        <div>กำลังเข้าสู่ระบบ...</div>
      )}
    </div>
  );
}
