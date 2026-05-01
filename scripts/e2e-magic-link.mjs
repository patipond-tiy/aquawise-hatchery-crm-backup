// One-shot helper to bypass email-based magic-link auth for E2E tests.
// Reads .env.local, creates (or finds) a test user, returns a magic-link URL.
// Usage: node scripts/e2e-magic-link.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = readFileSync('.env.local', 'utf8')
  .split('\n')
  .filter(Boolean)
  .filter((l) => !l.startsWith('#'))
  .reduce((acc, l) => {
    const [k, ...v] = l.split('=');
    if (k) acc[k.trim()] = v.join('=').trim();
    return acc;
  }, {});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_EMAIL = process.argv[2] ?? 'e2e-test@example.com';

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Idempotent: try to create; if exists, fetch and continue.
let userId;
const create = await admin.auth.admin.createUser({
  email: TEST_EMAIL,
  email_confirm: true,
});
if (create.error && !/already.*registered/i.test(create.error.message)) {
  console.error('createUser failed:', create.error);
  process.exit(1);
}
if (create.data?.user) {
  userId = create.data.user.id;
} else {
  const list = await admin.auth.admin.listUsers();
  const existing = list.data.users.find((u) => u.email === TEST_EMAIL);
  userId = existing?.id;
}

const link = await admin.auth.admin.generateLink({
  type: 'magiclink',
  email: TEST_EMAIL,
  options: { redirectTo: 'http://localhost:3000/auth/callback' },
});

if (link.error) {
  console.error('generateLink failed:', link.error);
  process.exit(1);
}

const out = {
  email: TEST_EMAIL,
  user_id: userId,
  action_link: link.data.properties.action_link,
};
console.log(JSON.stringify(out, null, 2));
