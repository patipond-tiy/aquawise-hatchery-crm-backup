import { describe, it, expect, beforeEach, vi } from 'vitest';

// G1 — bind/consume one-shot token semantics (expired→410, reused→409,
// valid→sets line_id + consumes).

vi.mock('server-only', () => ({}));

type Row = Record<string, unknown>;
let token: Row | null = null;
let custUpdates: Row[] = [];
let lineUsers: Row[] = [];
let chatThreads: Row[] = [];

// customers.update(...).eq(...) resolves directly; bind_tokens uses .eq().is().
vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () =>
    Promise.resolve({
      from(table: string) {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: table === 'customer_bind_tokens' ? token : null,
                }),
            }),
          }),
          update: (patch: Row) => ({
            eq: () => {
              if (table === 'customers') custUpdates.push(patch);
              return {
                is: () => {
                  if (table === 'customer_bind_tokens' && token)
                    Object.assign(token, patch);
                  return Promise.resolve({ error: null });
                },
              };
            },
          }),
          upsert: (row: Row) => {
            if (table === 'line_users') lineUsers.push(row);
            if (table === 'chat_threads') chatThreads.push(row);
            return Promise.resolve({ error: null });
          },
          insert: () => Promise.resolve({ error: null }),
        };
      },
    }),
}));

function req(body: unknown) {
  return {
    json: () => Promise.resolve(body),
  } as unknown as import('next/server').NextRequest;
}

beforeEach(() => {
  custUpdates = [];
  lineUsers = [];
  chatThreads = [];
  token = null;
  vi.resetModules();
});

describe('POST /api/line/bind/consume', () => {
  it('returns 410 for an expired token (no customer update)', async () => {
    token = {
      token: 't1',
      nursery_id: 'n1',
      customer_id: 'c1',
      expires_at: new Date(Date.now() - 1000).toISOString(),
      consumed_at: null,
    };
    const { POST } = await import('@/app/api/line/bind/consume/route');
    const res = await POST(req({ token: 't1', lineUserId: 'U1' }));
    expect(res.status).toBe(410);
    expect(custUpdates).toHaveLength(0);
  });

  it('returns 409 for an already-consumed token', async () => {
    token = {
      token: 't2',
      nursery_id: 'n1',
      customer_id: 'c1',
      expires_at: new Date(Date.now() + 1e9).toISOString(),
      consumed_at: new Date().toISOString(),
    };
    const { POST } = await import('@/app/api/line/bind/consume/route');
    const res = await POST(req({ token: 't2', lineUserId: 'U1' }));
    expect(res.status).toBe(409);
  });

  it('valid token → sets customers.line_id, upserts line_users + chat_threads, consumes', async () => {
    token = {
      token: 't3',
      nursery_id: 'n1',
      customer_id: 'c1',
      expires_at: new Date(Date.now() + 1e9).toISOString(),
      consumed_at: null,
    };
    const { POST } = await import('@/app/api/line/bind/consume/route');
    const res = await POST(
      req({
        token: 't3',
        lineUserId: 'U_real',
        lineProfile: { displayName: 'พี่ปลา' },
      })
    );
    expect(res.status).toBe(200);
    expect(custUpdates[0]).toEqual({ line_id: 'U_real' });
    expect(lineUsers[0].line_user_id).toBe('U_real');
    expect(chatThreads[0].customer_id).toBe('c1');
    expect(token.consumed_at).toBeTruthy();
  });

  it('400 when token or lineUserId missing', async () => {
    const { POST } = await import('@/app/api/line/bind/consume/route');
    const res = await POST(req({ token: 't' }));
    expect(res.status).toBe(400);
  });
});
