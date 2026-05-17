# AquaWise Nursery CRM — Code Design Handbook

> PURPOSE: Recipes, patterns, and anti-patterns for writing code that obeys `architecture.md`.
> READ ORDER: `architecture.md` (rules) → this file (how to apply them) → story file (today's task).
> SECURITY: For threats, OWASP-style mitigations, and pre-launch hardening, see `security.md`.
> When this file and `architecture.md` disagree, **`architecture.md` wins** and this file is a bug.
> When this file and a story Dev Note disagree, **this file wins** — stories must be amended, not contradicted.

This document is the merge-gate reference. A reviewer who pastes "see code-design.md §16" into a PR thread is correct by default; the burden of proof is on the author to show why their case is exceptional.

Last reviewed: 2026-05-15. Patterns verified against Next.js 16.2.6 docs, React 19, TanStack Query v5, Supabase docs (May 2026), and the actual codebase at commit `2504e16`.

---

## Table of contents

1. [Module boundaries & import direction](#1-module-boundaries--import-direction)
2. ["Add a new feature" walkthrough](#2-add-a-new-feature-walkthrough)
3. [Component design](#3-component-design)
4. [Data fetching patterns](#4-data-fetching-patterns)
5. [Server actions](#5-server-actions)
6. [Forms](#6-forms)
7. [Error & loading UX](#7-error--loading-ux)
8. [Database & migrations](#8-database--migrations)
9. [RBAC patterns](#9-rbac-patterns)
10. [i18n patterns](#10-i18n-patterns)
11. [Testing strategy](#11-testing-strategy)
12. [Performance defaults](#12-performance-defaults)
13. [Security checklist](#13-security-checklist) — full threat catalog in [`security.md`](./security.md)
14. [Observability](#14-observability)
15. [Naming](#15-naming)
16. [Code review checklist](#16-code-review-checklist)
17. [PR / commit / branch conventions](#17-pr--commit--branch-conventions)
18. [Anti-patterns](#18-anti-patterns)
19. [Decision log](#19-decision-log)
20. [Further reading](#20-further-reading)

---

## 1. Module boundaries & import direction

The codebase is layered. Imports flow **down** only. A lower layer never imports from a higher layer.

```
┌─────────────────────────────────────────────────────────┐
│  app/[locale]/...        routes, server actions          │  ← orchestration
├─────────────────────────────────────────────────────────┤
│  components/<domain>/    feature components              │  ← may use facade
│  components/modals/      modal screens                   │
│  components/layout/      shell, rails, top bar           │
├─────────────────────────────────────────────────────────┤
│  components/aw/          AquaWise UI primitives          │  ← presentation
├─────────────────────────────────────────────────────────┤
│  lib/api/                API facade (`@/lib/api`)        │  ← single entry point
├─────────────────────────────────────────────────────────┤
│  lib/mock/    lib/api/supabase.ts                        │  ← two implementations
│  lib/stripe/  lib/auth/  lib/billing/  lib/supabase/     │
├─────────────────────────────────────────────────────────┤
│  lib/types.ts  lib/database.types.ts  lib/rbac.ts        │  ← shared kernel
│  lib/utils/    lib/derive/    lib/store/                 │
└─────────────────────────────────────────────────────────┘
```

### Allowed-import matrix

|                      | `app/` | `components/<domain>/` | `components/modals/` | `components/aw/` | `lib/api` | `lib/mock` / `lib/api/supabase` | `lib/stripe/server` `lib/auth.ts` `lib/auth/*` `lib/billing/guard` `lib/supabase/storage` `lib/supabase/server` | `lib/store/*` | `lib/utils` / `lib/types` / `lib/rbac` |
|----------------------|:------:|:----------------------:|:--------------------:|:----------------:|:---------:|:-------------------------------:|:-------------------------------------------------------------:|:-------------:|:--------------------------------------:|
| `app/`               | ✅     | ✅                     | ✅                   | ✅               | ✅        | ❌                              | ✅ (server only)                                              | ✅            | ✅                                     |
| `components/<dom>/`  | ❌     | ✅                     | ❌                   | ✅               | ✅        | ❌                              | ❌                                                            | ✅            | ✅                                     |
| `components/modals/` | ❌     | ✅                     | ✅                   | ✅               | ✅        | ❌                              | ❌                                                            | ✅            | ✅                                     |
| `components/aw/`     | ❌     | ❌                     | ❌                   | ✅               | ❌        | ❌                              | ❌                                                            | ❌            | utils, types (UI-shape only)           |
| `lib/api`            | ❌     | ❌                     | ❌                   | ❌               | ✅        | ✅                              | ❌                                                            | ❌            | ✅                                     |
| `lib/mock` etc.      | ❌     | ❌                     | ❌                   | ❌               | ❌        | ✅                              | ❌                                                            | ❌            | ✅                                     |

### What `components/aw/*` may and may not do

Primitives in `components/aw/` are UI building blocks. Today some of them legitimately import `useTranslations` (for generic UI labels) and `useState` (for an open/closed flag inside a tooltip). That is **allowed** within these constraints:

- ✅ `useTranslations` for **generic UI strings** that exist on any platform (e.g. "Open", "Close", "Sort ascending", aria-labels). Use a `Common.*` namespace.
- ✅ `useState`, `useRef`, `useTransition` for **local presentational state** (hover, focus, expanded).
- ❌ Domain types in props or imports: `Customer`, `Batch`, `Alert`, `Quote`. If a primitive needs to render a batch, the consumer passes already-formatted strings.
- ❌ Calls to `@/lib/api` or Zustand stores. Primitives are stateless w.r.t. server data.
- ❌ RBAC checks. Permission gating happens in feature components, not in primitives.

The litmus test: **could this primitive ship as a standalone npm package called `@aquawise/ui`?** If yes, the import is fine. If no, the import is leaking the project into the primitive.

### What "downward" means in practice

> ✅ A page imports a modal. A modal imports a primitive. A primitive imports `cn()` from `lib/utils`.
> ❌ A primitive imports `useCustomers()`. A primitive imports `Customer` from `lib/types`.
> ❌ `lib/api/supabase.ts` imports anything from `app/` or `components/`.
> ❌ A component imports directly from `lib/mock/api` or `lib/api/supabase` — go through `@/lib/api`.

If you need to break a rule, the right answer is almost always: **lift the thing you needed upward**, not break the layering.

### Zustand stores

`lib/store/*` is for **ephemeral UI state only** (modal stack, sidebar collapsed flag). Never store fetched server data there. Server data lives in TanStack Query cache (§4) or comes from server components.

---

## 2. "Add a new feature" walkthrough

Reference end-to-end: adding **Quotes** (planned in `architecture.md` §5). Every step links to the rule it satisfies and uses helpers that **actually exist** in the codebase today.

### Step 1 — Migration

`supabase/migrations/013_quotes.sql`:

```sql
create table public.quotes (
  id          uuid primary key default gen_random_uuid(),
  nursery_id uuid not null references public.nurseries(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  size        text not null,
  qty         integer not null check (qty > 0),
  unit_price  numeric(10,2) not null check (unit_price >= 0),
  status      text not null default 'draft'
              check (status in ('draft','sent','accepted','expired')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid not null references auth.users(id)
);

create index quotes_nursery_id_idx on public.quotes(nursery_id);
create index quotes_customer_id_idx on public.quotes(customer_id);

alter table public.quotes enable row level security;

-- IMPORTANT: existing codebase uses `current_user_nursery_ids()` returning `setof uuid`,
-- with `IN` operator (NOT `current_nursery_id()` with `=`). Match the existing pattern.
-- The `select ()` wrap is essential — it triggers Postgres initPlan caching
-- (evaluated once per statement instead of once per row). Without it, RLS is ~20× slower
-- on large tables. See §8 for details.
create policy quotes_rw on public.quotes for all
  using (nursery_id in (select public.current_user_nursery_ids()))
  with check (nursery_id in (select public.current_user_nursery_ids()));

-- Future tightening per architecture.md §5: separate insert/update/delete policies
-- restricting writes to owner/counter_staff. For now, the `for all` policy mirrors
-- existing tables (customers, batches).
```

Then: `pnpm supabase db push` and `pnpm supabase gen types typescript --linked > lib/database.types.ts`.

### Step 2 — Domain type

`lib/types.ts`:

```typescript
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'expired';

export type Quote = {
  id: string;
  customerId: string;
  customerName: string;       // joined
  size: string;
  qty: number;
  unitPriceTHB: number;       // suffix unit to prevent currency bugs
  totalTHB: number;           // derived; qty * unitPriceTHB
  status: QuoteStatus;
  createdAt: string;          // ISO 8601 UTC
};

export type AddQuoteInput = {
  customerId: string;
  size: string;
  qty: number;
  unitPriceTHB: number;
};
```

Note on units: Stripe represents THB in satang (×100, no decimals). Domain types use **major units (THB)** as `number`; conversion to satang happens at the Stripe boundary only. Always suffix money fields with the currency code.

### Step 3 — Mock implementation

`lib/mock/api.ts` (in-memory, Thai seed):

```typescript
const mockQuotes: Quote[] = [/* Thai seed data — see existing mock for tone */];

export async function listQuotes(): Promise<Quote[]> {
  return [...mockQuotes];
}

export async function addQuote(input: AddQuoteInput): Promise<Quote> {
  const customer = mockCustomers.find((c) => c.id === input.customerId);
  if (!customer) throw new Error('customer_not_found');
  const quote: Quote = {
    id: crypto.randomUUID(),
    customerName: customer.name,
    totalTHB: input.qty * input.unitPriceTHB,
    status: 'draft',
    createdAt: new Date().toISOString(),
    ...input,
  };
  mockQuotes.unshift(quote);
  return quote;
}
```

### Step 4 — Live implementation (browser client, not server client)

`lib/api/supabase.ts`. **The facade uses the BROWSER Supabase client** (`@/lib/supabase/client`) so it runs from server components, server actions, and `'use client'` components alike — RLS scopes by session cookie regardless of where the call originates. Reserve `lib/supabase/server.ts` for code that needs `'server-only'` (server actions, route handlers, webhooks).

```typescript
import { createClient } from '@/lib/supabase/client';
import type { Quote, QuoteStatus } from '@/lib/types';

export async function listQuotes(): Promise<Quote[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('quotes')
    // Include nursery_id in the .eq() if you know it client-side, even with RLS — it
    // lets Postgres use the index to prune BEFORE applying the policy. RLS alone does
    // not give you index pruning. See §8 perf note.
    .select('id, size, qty, unit_price, status, created_at, customers(id, name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToQuote);
}

function rowToQuote(r: QuoteRow): Quote {
  return {
    id: r.id,
    customerId: r.customers.id,
    customerName: r.customers.name,
    size: r.size,
    qty: r.qty,
    unitPriceTHB: Number(r.unit_price),
    totalTHB: r.qty * Number(r.unit_price),
    status: r.status as QuoteStatus,
    createdAt: r.created_at,
  };
}
```

The mapper is the **only** place `as` is allowed (architecture.md §2 rule 3).

### Step 5 — Facade export

`lib/api/index.ts`:

```typescript
export const listQuotes = impl.listQuotes;
export const addQuote   = impl.addQuote;
export type { AddQuoteInput } from '@/lib/types';
```

### Step 6 — Page (server component)

`app/[locale]/(dashboard)/quotes/page.tsx`:

```tsx
import { listQuotes } from '@/lib/api';
import { getTranslations } from 'next-intl/server';
import { QuotesTable } from '@/components/quotes/quotes-table';

export default async function QuotesPage() {
  const [quotes, t] = await Promise.all([
    listQuotes(),
    getTranslations('Quotes'),
  ]);
  return (
    <section>
      <h1>{t('title')}</h1>
      <QuotesTable quotes={quotes} />
    </section>
  );
}
```

### Step 7 — Server action (the real shape)

`app/[locale]/(dashboard)/quotes/actions.ts`. Use the helpers that exist today: `isMockMode()`, `requireActiveSubscription()`, and `currentNurseryScope()` (FLAG: function name — returns the nursery tenant scope). There is **no `requireMember`/`requireCan`/`logAudit` helper** in the codebase yet — those names are aspirational. Inline the membership lookup and the RBAC check; the audit-log write is a TBD (see §19).

```typescript
'use server';

import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireActiveSubscription, PaywallError } from '@/lib/billing/guard';
import { isMockMode } from '@/lib/utils/mock-mode';
import { can } from '@/lib/rbac';
import { addQuote } from '@/lib/api';

export const AddQuoteSchema = z.object({
  customerId: z.string().uuid(),
  size: z.string().min(1).max(40),
  qty: z.coerce.number().int().positive(),
  unitPriceTHB: z.coerce.number().nonnegative(),
});

type Result<T> = { ok: true; data: T } | { ok: false; error: string; field?: string };

export async function createQuoteAction(raw: unknown): Promise<Result<{ id: string }>> {
  // Mock-mode short-circuit. Mirrors existing actions in settings/.
  if (isMockMode()) return { ok: false, error: 'โหมดเดโม — ยังไม่บันทึกจริง' };

  // Throws PaywallError on expired/canceled tenants. PaywallError carries status 402.
  try { await requireActiveSubscription(); }
  catch (e) {
    if (e instanceof PaywallError) return { ok: false, error: e.message };
    throw e;
  }

  // Validate input.
  const parsed = AddQuoteSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: first.path.join('.') };
  }

  // Auth + membership lookup. Pattern mirrors lib/auth.ts:currentNurseryScope.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data: membership } = await supabase
    .from('nursery_members')
    .select('nursery_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();
  if (!membership) return { ok: false, error: 'No hatchery membership found' }; // FLAG: error string references nursery_members table (code identifier — nursery tenant membership)

  // RBAC. Use can() — never branch on role strings. Proxy mapping: quotes use customer:write
  // because they're customer-scoped (see §9).
  if (!can(membership.role, 'customer:write')) {
    return { ok: false, error: 'Permission denied' };
  }

  try {
    const quote = await addQuote(parsed.data);
    // TODO(audit-log): insert into audit_log once the table + helper exist. See §19.
    revalidateTag('quotes');
    return { ok: true, data: { id: quote.id } };
  } catch (e) {
    console.error('[hatchery-crm]', 'createQuoteAction.failed', {
      userId: user.id,
      nurseryId: membership.nursery_id,
      error: e instanceof Error ? e.message : String(e),
    });
    return { ok: false, error: 'Could not create quote' };
  }
}
```

Notes:
- `revalidateTag` is preferred over `revalidatePath` in Next.js 16 — more precise, fewer over-invalidations. Pair it with `cacheTag('quotes')` inside a cached fetch (see §12).
- The action returns `{ field?: string }` so the client can map server-side validation errors back to the form field (§6).
- The audit log write is left as `// TODO(audit-log)` until the table + helper exist; the security catalog in `security.md` requires this for tenant accountability.

### Step 8 — i18n keys (both files, same commit)

```json
// messages/th.json (source of truth)
{ "Quotes": { "title": "ใบเสนอราคา", "form": { "errors": { "qty_positive": "จำนวนต้องมากกว่า 0" } } } }
// messages/en.json
{ "Quotes": { "title": "Quotes", "form": { "errors": { "qty_positive": "Quantity must be greater than 0" } } } }
```

### Step 9 — Tests + mock-mode click-through

```bash
pnpm dev                                            # USE_MOCK=true; click through at /th/quotes
pnpm vitest run tests/api/list-quotes.test.ts       # mapper + facade contract
pnpm typecheck && pnpm lint && pnpm test            # green-build gate
```

### Step 10 — Story alignment

If a BMAD story (`docs/bmad/stories/X.quotes.md`) exists, mark its tasks `[x]` and set `Status: review`. If no story exists, this feature does not ship.

---

## 3. Component design

### Three component tiers

| Tier | Path | May import | Knows domain? | Has i18n? | Has data fetching? |
|---|---|---|---|---|---|
| Primitive | `components/aw/` | utils, types-as-shape, generic i18n | No (no domain types) | Generic UI strings only | No |
| Feature | `components/<domain>/` | primitives, facade hooks, store, utils, types | Yes | Yes | Optional (client) |
| Modal | `components/modals/` | feature components, primitives, facade hooks, store | Yes | Yes | Optional |
| Layout | `components/layout/` | primitives, store | Layout-only | Yes | No |
| Route | `app/[locale]/.../page.tsx` | everything below | Yes | Yes | Yes (server-first) |

### Server vs. client decision tree

```
Does the component need any of: useState, useEffect, useReducer, useRef (for DOM),
useTransition, useQuery, useForm, useActionState, onClick, onChange,
window/document, Zustand?
│
├─ No  → server component (no directive). Use await.
└─ Yes → 'use client' directive at top of file.
```

**Push `'use client'` to the leaf.** A server component may render a client component as a child without becoming client itself. Passing server components as `children` or props into a client component **keeps them server-rendered** — they're delivered as an opaque RSC payload, not pulled into the client bundle. This is the most-overlooked optimization in App Router code.

```tsx
// ✅ Correct: Server wraps Client; only AddToCart enters the client bundle
// app/page.tsx (Server Component)
import { AddToCart } from './add-to-cart' // 'use client'
export default async function ProductPage() {
  const product = await db.product.findUnique(...);
  return (
    <div>
      <h1>{product.name}</h1>                {/* server-rendered */}
      <ProductDescription product={product}/>{/* server-rendered */}
      <AddToCart productId={product.id}/>    {/* client boundary */}
    </div>
  );
}
```

### When to extract a component

**Three-strike rule.** Inline once. Duplicate once. On the third use, extract.

Do **not** extract on:
- "It might be reused later" (speculative).
- "It's too long" (length is not the smell; mixed responsibilities are).
- "It would look cleaner" (cleanliness is not a reason to add a file).

Do extract when:
- The third caller appears.
- A reviewer cannot describe the JSX block in one sentence.
- The block has its own loading/error/empty states.

### Prop shape

- Required props before optional props.
- No boolean explosion. `<Button primary danger small disabled />` → `<Button variant="primary-sm" disabled />`. Use `cva` (already a dep) for variants.
- Never pass `className` through three levels. If a primitive needs styling overrides, it accepts `className`; feature components do not.
- Children over `content` prop. `<Card>{stuff}</Card>` not `<Card content={stuff} />`.

### React Compiler

React Compiler 1.0 (Oct 2025) is **stable** and Next.js 16 promotes the `reactCompiler` config from experimental to stable. It is **not enabled by default**.

If turned on, the compiler auto-memoizes — you can remove most `useMemo` / `useCallback` from new code. Until §19 records adoption, **do not** preemptively strip existing memoization; existing patterns continue to work.

Whether to enable: a §19 decision (see "React Compiler adoption").

---

## 4. Data fetching patterns

### Default: server component reads through the facade

```tsx
// app/[locale]/(dashboard)/customers/page.tsx
import { listCustomers } from '@/lib/api';

export default async function CustomersPage() {
  const customers = await listCustomers();
  return <CustomersTable customers={customers} />;
}
```

This is the default. Fast, cacheable, SEO-friendly, zero JS for the data layer.

### Pattern: server prefetch → client interactive (HydrationBoundary)

When a page must render server-side AND the client needs to refetch/mutate later (filter, optimistic update), use TanStack Query's hydration pattern:

```tsx
// app/[locale]/(dashboard)/quotes/page.tsx (server component)
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { listQuotes } from '@/lib/api';
import { QuotesClient } from './quotes-client';
import { queryKeys } from './query-keys';

export default async function QuotesPage() {
  const qc = new QueryClient();
  await qc.prefetchQuery({ queryKey: queryKeys.quotes.all(), queryFn: listQuotes });
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <QuotesClient />
    </HydrationBoundary>
  );
}

// quotes-client.tsx
'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { listQuotes } from '@/lib/api';
import { queryKeys } from './query-keys';

export function QuotesClient() {
  const { data } = useSuspenseQuery({ queryKey: queryKeys.quotes.all(), queryFn: listQuotes });
  return <QuotesTable rows={data} />;
}
```

The client component re-declares the same query and reads from the hydrated cache — **no loading flash on first render**, and subsequent refetches work normally.

### Query key factory (the right way to organize keys)

For anything beyond a single list, centralize keys in a per-domain factory. Ad-hoc inline arrays don't scale once you need "invalidate all lists of X but not detail":

```typescript
// app/[locale]/(dashboard)/quotes/query-keys.ts
export const queryKeys = {
  quotes: {
    all:    () => ['quotes'] as const,
    lists:  () => [...queryKeys.quotes.all(), 'list'] as const,
    list:   (filters?: Record<string, unknown>) => [...queryKeys.quotes.lists(), filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.quotes.all(), 'detail', id] as const,
  },
};

// Invalidate all quote lists (keeps details warm):
qc.invalidateQueries({ queryKey: queryKeys.quotes.lists() });
// Invalidate ALL quotes (lists + details):
qc.invalidateQueries({ queryKey: queryKeys.quotes.all() });
// Invalidate one detail:
qc.invalidateQueries({ queryKey: queryKeys.quotes.detail(id) });
```

### Global QueryClient defaults

Default `staleTime: 0` is **wrong for a SaaS** — every mount and window-focus triggers an unnecessary refetch, hammering Supabase and producing flicker. Set sensible defaults on the QueryClient:

```typescript
// components/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,       // 1 minute — most dashboard data tolerates this
      gcTime: 5 * 60_000,      // 5 minutes
      refetchOnWindowFocus: true,  // still useful — won't refetch fresh data
    },
  },
});
```

Override per-query as needed:
- Reference data (roles, nursery config): `staleTime: Infinity` + manual invalidate.
- Real-time-critical (alert list during active incident): `staleTime: 0`.

### Loading / pending / fetching (v5 semantics)

- `isPending` — no cached data exists; the first fetch hasn't completed (or query is disabled).
- `isFetching` — a fetch is in flight, including background refetches.
- `isLoading` — `isPending && isFetching` (first fetch in flight, no cache yet).
- **Gotcha**: a query with `enabled: false` is `isPending: true` and `isFetching: false`. `isLoading` is `false`. So `isLoading` alone is unreliable for conditional queries — check `enabled` explicitly.

Prefer `useSuspenseQuery` + `<Suspense fallback>` for new code (§7); the `isPending` ladder is the escape hatch for queries that need `enabled` or `placeholderData`.

### Mutations

```typescript
// components/quotes/hooks.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addQuote } from '@/lib/api';
import { queryKeys } from '@/app/[locale]/(dashboard)/quotes/query-keys';

export function useAddQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddQuoteInput) => addQuote(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.quotes.lists() });
      qc.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}
```

Prefer **invalidate** over manual cache writes.

### Optimistic updates — v5 has two paths

**Path A — UI-only, via `mutation.variables` (simpler, new in v5).** No cache manipulation. Render a temporary item while pending; React removes it once the mutation completes.

```tsx
const { mutate, variables, isPending } = useAddQuote();
return (
  <>
    {quotes.map((q) => <Row key={q.id} quote={q}/>)}
    {isPending && <Row pending key="optimistic" quote={variablesAsQuote(variables)}/>}
  </>
);
```

**Path B — cache-based (`onMutate` snapshot + rollback).** Required when the optimistic value must appear in multiple places at once.

```typescript
useMutation({
  mutationFn: closeAlert,
  onMutate: async (alertId) => {
    await qc.cancelQueries({ queryKey: queryKeys.alerts.all() });
    const previous = qc.getQueryData(queryKeys.alerts.all());
    qc.setQueryData(queryKeys.alerts.all(), (old) => old.map(a => a.id === alertId ? { ...a, closed: true } : a));
    return { previous };
  },
  onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(queryKeys.alerts.all(), ctx.previous),
  onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.alerts.all() }),
});
```

**When NOT to use optimistic updates:** writes that cascade to `audit_log`, billing, PCR results, batch creation, exports — anything where failure must be visible. "Trivially reversible" (alert close, callback schedule, toggle) only.

### Critical gotcha: server actions don't talk to the TanStack cache

A mutation called via `useMutation(mutationFn: action)` runs through the QueryClient and fires `onSuccess`. But a mutation called via React 19's `<form action={action}>` (or `useActionState`) is invoked **directly by React** — bypasses the QueryClient — and `onSuccess` never fires. The two caches do not auto-sync.

The fix has two parts:

1. **Server side**: `revalidateTag` (or `revalidatePath`) in the action — invalidates Next.js's RSC cache so server components re-fetch.
2. **Client side**: trigger a TanStack invalidation after the form submits — either by calling `router.refresh()` + `qc.invalidateQueries(...)` in a `useEffect` watching the action's state, or by reading the action result and dispatching the invalidation explicitly.

```tsx
'use client';
import { useActionState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { createQuoteAction } from './actions';
import { queryKeys } from './query-keys';

export function QuoteForm() {
  const [state, formAction] = useActionState(createQuoteAction, null);
  const qc = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      qc.invalidateQueries({ queryKey: queryKeys.quotes.lists() });
      router.refresh();
    }
  }, [state, qc, router]);

  return <form action={formAction}>...</form>;
}
```

---

## 5. Server actions

### Canonical skeleton (matches existing codebase helpers)

```typescript
'use server';

import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireActiveSubscription, PaywallError } from '@/lib/billing/guard';
import { isMockMode } from '@/lib/utils/mock-mode';
import { can } from '@/lib/rbac';

const Input = z.object({ /* ... */ });

type Ok<T>  = { ok: true; data: T };
type Err    = { ok: false; error: string; field?: string };
type Result<T> = Ok<T> | Err;

export async function someAction(raw: unknown): Promise<Result<Thing>> {
  // 1. Mock-mode short-circuit (Vercel previews without Supabase, dev without env)
  if (isMockMode()) return { ok: false, error: 'โหมดเดโม — ยังไม่บันทึกจริง' };

  // 2. Billing gate — throws PaywallError on expired tenants
  try { await requireActiveSubscription(); }
  catch (e) { if (e instanceof PaywallError) return { ok: false, error: e.message }; throw e; }

  // 3. Input validation
  const parsed = Input.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: first.path.join('.') };
  }

  // 4. Auth + membership (the trust boundary)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();   // getUser, NOT getSession
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data: membership } = await supabase
    .from('nursery_members')
    .select('nursery_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();
  if (!membership) return { ok: false, error: 'No hatchery membership found' }; // FLAG: error string references nursery_members table (code identifier — nursery tenant membership)

  // 5. RBAC — via can(), never on role strings
  if (!can(membership.role, 'thing:write')) return { ok: false, error: 'Permission denied' };

  // 6. Do the work + audit log + revalidate
  try {
    const thing = await /* mutation */;
    // TODO(audit-log): write audit_log row once helper exists — see §19
    revalidateTag('things');
    return { ok: true, data: thing };
  } catch (e) {
    console.error('[hatchery-crm]', 'someAction.failed', {
      userId: user.id,
      nurseryId: membership.nursery_id,
      error: e instanceof Error ? e.message : String(e),
    });
    return { ok: false, error: 'Internal error' };
  }
}
```

### Rules

1. **`getUser()`, never `getSession()`** in server contexts. `getUser()` makes a server round-trip to Supabase Auth and validates the JWT; `getSession()` just decodes locally and can be spoofed by client-side cookie tampering.
2. **Re-check RBAC inside the action.** UI hides are advisory; the action is the trust boundary.
3. **Validate input with zod.** Even if a typed client form called you — the action's signature is `(input: unknown)` (or `(prevState, formData)` for `useActionState`); treat the input as adversarial.
4. **Return, don't throw, for user errors.** Throw only for programmer errors (impossible state). The `{ ok, data | error, field? }` shape is uniform; client code branches on `result.ok`.
5. **Never return raw error messages from the database or Stripe to the client.** Map to a known short message. Stack traces and internal errors go to `console.error`, not the client.
6. **`revalidateTag` (preferred) or `revalidatePath` after every successful write.** Without one, server components still show stale data after navigation.
7. **Audit-log every state-changing action** that affects another user (invite, role change, batch publish, alert close, export, billing change). Currently the helper doesn't exist (§19); leave `// TODO(audit-log)` comments at each call site so they're trivially grep-able once the helper lands.
8. **Server actions live next to their route.** `actions.ts` in the same folder as `page.tsx`. Do not move actions into `lib/`.
9. **Never accept `nursery_id` / `user_id` / `role` as a server-action argument** (FLAG: `nursery_id` is the nursery tenant identifier — code identifier). Always derive from the session (see step 4 above). Even with Next.js's AES-encrypted closure variables, the client can replay an action with an attacker-controlled FormData; deriving authority server-side is the only reliable defense.

### React 19's `useActionState` — when to use

For straightforward server-round-trip forms (auth, single-mutation CRUD), `useActionState` is the React 19 canonical pattern and integrates with progressive enhancement (form works without JS):

```tsx
'use client';
import { useActionState } from 'react';   // from 'react', NOT 'react-dom'
import { createQuoteAction } from './actions';

export function QuoteForm() {
  const [state, formAction, pending] = useActionState(createQuoteAction, null);
  return (
    <form action={formAction}>
      <input name="customerId" type="hidden" value={customerId}/>
      <input name="qty" type="number" required/>
      {state?.ok === false && state.field === 'qty' && <p>{state.error}</p>}
      <button disabled={pending}>Create quote</button>
    </form>
  );
}
```

For this to work, the action signature must accept `(prevState, formData)`:

```typescript
export async function createQuoteAction(prevState: unknown, formData: FormData) {
  const raw = {
    customerId: formData.get('customerId'),
    qty: formData.get('qty'),
    /* ... */
  };
  // ...same body as the canonical skeleton above, but reading from raw above
}
```

When to use `useActionState`:
- Simple-to-moderate forms (auth, single-field CRUD)
- Progressive enhancement matters (form works without JS)
- You don't need fancy client-side validation

When to use `react-hook-form` + imperative action call instead (§6):
- Complex multi-field zod schemas with instant client-side feedback
- Conditional fields driven by `watch()`
- `useFieldArray` for dynamic field lists
- Cross-field validation (confirm-password, total-of-line-items)

### `next-safe-action` — defer adoption

`next-safe-action` (v8, actively maintained, see [next-safe-action.dev](https://next-safe-action.dev/)) wraps actions with shared zod validation, typed middleware, and `useAction`/`useOptimisticAction` hooks. Worth pulling in once we have 5+ actions with shared auth concerns. Until then, the canonical skeleton above is enough. See §19 decision log.

### Action vs. API route — when which

| Use case | Use |
|---|---|
| Form submission, button click that mutates | Server action |
| Stripe webhook | API route (`app/api/webhooks/stripe/route.ts`) |
| LINE webhook | API route (when implemented in this repo) |
| Cron-triggered endpoint | API route with `Authorization: Bearer ${CRON_SECRET}` check |
| Public read (e.g. `/h/{slug}` scorecard JSON) | Server component or route handler — both fine |

API routes do **not** get the automatic CSRF Origin-vs-Host check that server actions get; webhook routes rely on the platform's signature verification (`stripe.webhooks.constructEvent`, LINE's `validateSignature`) as the trust boundary.

---

## 6. Forms

Stack: `react-hook-form` + `zod 4` + `@hookform/resolvers/zod` + `sonner` for toasts (all in `package.json`).

### Two canonical patterns — pick by complexity

**Pattern A — `useActionState` (canonical for simple forms; see §5):** Best when the form is straightforward and progressive enhancement matters.

**Pattern B — `react-hook-form` + imperative action call (for complex forms):** Best when you need client-side validation before submit, conditional fields, or `useFieldArray`.

### Pattern B canonical skeleton

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { createQuoteAction, AddQuoteSchema } from '../actions';
// import the schema from actions.ts so client and server validate against THE SAME zod

type Values = z.infer<typeof AddQuoteSchema>;

export function AddQuoteForm({ onSuccess }: { onSuccess: () => void }) {
  const t = useTranslations('Quotes.form');
  const form = useForm<Values>({ resolver: zodResolver(AddQuoteSchema) });

  async function onSubmit(values: Values) {
    const res = await createQuoteAction(values);
    if (!res.ok) {
      if (res.field) form.setError(res.field as keyof Values, { message: res.error });
      else toast.error(res.error);
      return;
    }
    toast.success(t('toasts.created'));
    onSuccess();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* fields */}
      <button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
```

### Rules

- **Schema lives in `actions.ts` and is exported.** Client and server validate against the same zod schema. This is the single biggest scaffold-bug killer.
- **`z.coerce.number()`** for numeric inputs — HTML inputs always send strings; the same `FormData` semantics apply to `useActionState`.
- **Field error from server** → `form.setError(field, ...)` (Pattern B) or render from `state.field === 'foo'` (Pattern A). Toast for non-field errors.
- **Disable submit while submitting.** No double-fires.
- **Never call `addQuote` etc. directly from a form.** Always through a server action; the action is the audit/auth boundary.
- **`useFormState` is deprecated** in React 19 — import `useActionState` from `react` (not `react-dom`).

---

## 7. Error & loading UX

### Three Next.js conventions

| File | When it fires |
|---|---|
| `loading.tsx` | Route segment is fetching; replaces children with skeleton until ready. Acts as a Suspense boundary. |
| `error.tsx` | A server component or action under this segment threw. Must be a client component. |
| `not-found.tsx` | A server component called `notFound()`. |

Place these at the **most specific** segment that needs them. A single global `error.tsx` is a code smell — everything degrades to the same generic message.

### Default for new client queries: `useSuspenseQuery` + `<Suspense>` / `loading.tsx`

`useSuspenseQuery` integrates cleanly with `loading.tsx` (which is itself a Suspense boundary) and removes the `if (isPending) return …` ladder. The `data` is always defined — no defensive checks needed.

```tsx
// route segment: loading.tsx
export default function Loading() { return <QuotesSkeleton rows={5}/>; }

// quotes-client.tsx
'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { listQuotes } from '@/lib/api';
import { queryKeys } from './query-keys';

export function QuotesClient() {
  const { data } = useSuspenseQuery({ queryKey: queryKeys.quotes.all(), queryFn: listQuotes });
  // data: Quote[] — guaranteed defined
  if (data.length === 0) return <EmptyState/>;
  return <Table rows={data}/>;
}
```

Use plain `useQuery` (with the `isPending` ladder) when you need `enabled: false`, `placeholderData`, or any other escape hatch. New code defaults to `useSuspenseQuery`.

### Empty states

Always handle the empty state explicitly. **The empty state is the most-seen state of every feature in its first week** — design it as deliberately as the populated state.

```tsx
<EmptyState
  title={t('empty.title')}        // ยังไม่มีใบเสนอราคา
  body={t('empty.body')}          // เมื่อสร้างใบเสนอราคา จะแสดงรายการที่นี่
  cta={can(role,'customer:write') ? { label: t('empty.cta'), onClick: openModal } : undefined}
/>
```

Banned in empty states:
- "Get started by..." (editorial)
- "Looks like nothing here!" (excitement punctuation, faux-warmth)
- Emoji of any kind
- Cartoon illustrations on professional surfaces

### Error boundaries

`error.tsx` catches thrown errors in server components and route handlers. For thrown errors in client components, wrap with React's error boundary. For thrown errors in server actions invoked from a form, the form's `state` will carry the error — surface it via toast or field message, don't crash the page.

---

## 8. Database & migrations

### Naming

`supabase/migrations/NNN_short_snake_case.sql` where `NNN` is the next zero-padded integer (`013`, not `13`).

### Table template (matches existing migrations)

Every tenant-scoped table must have:

```sql
create table public.<name> (
  id          uuid primary key default gen_random_uuid(),
  nursery_id uuid not null references public.nurseries(id) on delete cascade,
  -- ... domain columns ...
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id)
);

create index <name>_nursery_id_idx on public.<name>(nursery_id);

alter table public.<name> enable row level security;

-- IMPORTANT: use the existing `current_user_nursery_ids()` setof function with IN,
-- wrapped in (select …) to trigger initPlan caching. This is the codebase pattern.
create policy <name>_rw on public.<name> for all
  using (nursery_id in (select public.current_user_nursery_ids()))
  with check (nursery_id in (select public.current_user_nursery_ids()));
```

Future tightening: split `for all` into separate insert/update/delete policies that check role membership (see existing 011_rls_tighten.sql). New tables can follow that pattern as soon as the role assertion needs to differ from the membership assertion.

### RLS performance — three pitfalls to avoid

1. **No `(select …)` wrap.** `using (auth.uid() = user_id)` calls `auth.uid()` per row. Wrap: `using ((select auth.uid()) = user_id)`. Benchmarked ~20× faster on large tables.
2. **No `.eq('nursery_id', …)` in the client query** (FLAG: `nursery_id` is the nursery tenant FK — code identifier). Even with correct RLS, Postgres cannot use the index to prune rows BEFORE applying the policy if you don't filter by the tenant ID explicitly. Add both: RLS for safety, `.eq` for performance.
3. **Missing index.** Every tenant-scoped table needs `create index … on public.<name>(nursery_id)`. The membership table needs `create index … on public.nursery_members(user_id, nursery_id)` (FLAG: all identifiers — pending rename decision).

### Adding a table — 8-step checklist

1. Write the migration with RLS policies.
2. `pnpm supabase db push` (local) or commit + Vercel preview push.
3. Regenerate types: `pnpm supabase gen types typescript --linked > lib/database.types.ts`.
4. Add the domain type to `lib/types.ts`.
5. Add mock data + mock methods to `lib/mock/api.ts`.
6. Add live methods to `lib/api/supabase.ts` (with `rowTo*` mapper — the **only** place `as` is allowed).
7. Export through `lib/api/index.ts`.
8. Run the **P0 cross-tenant block test** against the new table. **If the new table is tenant-scoped (directly via `nursery_id` or via an FK chain), you MUST add it to `supabase/tests/cross-tenant.sql` in the SAME PR** — seed one nursery-A row and add an `is(count, 0, …)` assertion that owner_B cannot read it. This pgTAP suite is a **required CI check** (`.github/workflows/ci.yml` job `pgtap-cross-tenant`, story S8); a missing table = an unprotected leak path that CI cannot catch. (Canonical path: `supabase/tests/cross-tenant.sql`; see `security.md` §22.)

### Audit log table (planned)

The action skeleton in §5 leaves a `// TODO(audit-log)` because the table and helper don't exist yet. Canonical shape when added:

```sql
create table public.audit_log (
  id            bigserial primary key,
  nursery_id   uuid        not null,
  actor_user_id uuid        not null references auth.users,
  actor_role    text        not null,
  action        text        not null,                  -- 'quote.create', 'alert.close', …
  target_type   text        not null,                  -- table name
  target_id     uuid,
  old_record    jsonb,
  new_record    jsonb,
  ip            inet,
  user_agent    text,
  created_at    timestamptz not null default now()
);

-- Immutability via trigger (revoking UPDATE/DELETE from authenticated isn't enough —
-- a future bug could grant it back; the trigger is belt-and-braces).
create or replace function public.audit_log_immutable() returns trigger language plpgsql as $$
begin raise exception 'audit_log is append-only'; end;
$$;
create trigger no_modify before update or delete on public.audit_log
  for each row execute function public.audit_log_immutable();

-- BRIN index for time-range queries (tiny on append-only timestamp columns).
create index audit_log_created_at_brin on public.audit_log using brin (created_at);
create index audit_log_hatchery_time on public.audit_log (nursery_id, created_at desc);
create index audit_log_actor on public.audit_log (actor_user_id);

-- Partition by month for storage growth. Archive cold partitions to Storage after 90 days.
```

A helper `logAudit({ action, nurseryId, targetType, targetId, oldRecord?, newRecord? })` lives in `lib/audit.ts` once the table ships. Until then, the recipe in §5 leaves a comment at each call site.

### Index policy

Add an index when **either**:
- The column appears in a `where` clause of a query you have actually written, **or**
- The column is an FK that gets joined frequently.

Do not add speculative indexes. Postgres index churn hurts writes.

### JSONB vs. column

Use JSONB when:
- The shape is configuration owned by the tenant (`restock_thresholds`, `scorecard_settings`).
- You query the whole document, not individual fields.

Use columns when:
- You filter, sort, or aggregate by the value.
- The value is constrained (enum, FK, NOT NULL).

When in doubt, columns. JSONB is a one-way door for query patterns.

### Migration rollback

Supabase migrations are **forward-only**. To "rollback", write a forward migration that undoes the prior one. There is no `down.sql`. This is by design — versioning is linear and reproducible.

If a migration breaks production, the path is: revert the application code, write a corrective migration, deploy together.

---

## 9. RBAC patterns

### Three-layer enforcement

```
1. Route guard       — server component checks can() and renders <AccessDenied />
2. UI advisory hide  — components/<domain>/ hides actions the user can't take
3. Action enforcement — server action calls can() and rejects ← ACTUAL trust boundary
```

The first two improve UX. The third is the **only** one that actually prevents abuse. **Always implement layer 3, even if you also implemented 1 and 2.**

### Adding a new action

1. Add the string literal to the `Action` union in `lib/rbac.ts`.
2. Add a row to the `RULES` matrix in `lib/rbac.ts` AND in `architecture.md` §4. Both must match exactly.
3. Use `can(role, 'thing:write')` in UI and inside the action.
4. Add a Vitest case that asserts each role's `can()` returns the expected boolean.

### Action proxy mapping

When a story says "use `customer:write` for X" even though X is a quote/callback/whatever — that's a proxy. Stories document proxies explicitly; do not invent new proxies. If you think a new proxy is needed, **stop and ask the PM**.

Current proxies (from architecture.md §4 and story Dev Notes):
- Quote write → `customer:write` (quotes are customer-scoped)
- Callback write → `customer:write`
- Restock broadcast → `settings:write`

### Anti-pattern

```typescript
// ❌ NEVER — but existing code in some places does this; cleanup work tracked
if (member.role === 'owner') { ... }

// ✅
if (can(member.role, 'customer:write')) { ... }
```

Some current code (e.g. `settings/actions.ts` `if (logoFile && role === 'owner')`) does branch on role strings. Treat those as cleanup work, not as license to propagate the pattern.

---

## 10. i18n patterns

### Key naming

```
<Namespace>.<feature>.<state>
```

Examples:
- `Customers.list.title`
- `Customers.list.empty.title`
- `Quotes.form.errors.qty_positive`

Rules:
- `Namespace` is PascalCase, equals the page or major feature.
- Nested keys are snake_case (matches existing files like `Settings.team.invite`).
- Error keys mirror the zod field path: `Quotes.form.errors.<field>` so server-action field errors map mechanically.

### Both files, same commit

```jsonc
// messages/th.json (source of truth)
{ "Quotes": { "form": { "errors": { "qty_positive": "จำนวนต้องมากกว่า 0" } } } }
// messages/en.json
{ "Quotes": { "form": { "errors": { "qty_positive": "Quantity must be greater than 0" } } } }
```

Missing key renders `⚠️ {key}` in dev — visible in any click-through.

### Server vs. client

```typescript
// Server component
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('Quotes');

// Client component
import { useTranslations } from 'next-intl';
const t = useTranslations('Quotes');
```

### Date / number / currency formatting

```typescript
import { useFormatter } from 'next-intl';
const f = useFormatter();
f.dateTime(date, { dateStyle: 'medium', timeZone: 'Asia/Bangkok' });
f.number(priceTHB, { style: 'currency', currency: 'THB' });
```

Never `toLocaleString()` directly — it doesn't see the active locale.

For cron / scheduled operations always specify the timezone (`Asia/Bangkok` for ICT). Storing dates as UTC ISO strings (already the convention) avoids most DST/offset bugs, but rendering must format in ICT for users.

### "I added a string" 3-step checklist

1. Add the key to `messages/th.json`.
2. Add the **same key** to `messages/en.json`.
3. Render the page in dev and confirm no `⚠️ {key}` appears.

---

## 11. Testing strategy

### Test pyramid (this repo)

```
                    ┌─────────────────────┐
                    │  pgTAP cross-tenant │   ← run on every deploy (P0)
                    │  RLS test (CLI)     │
                    └─────────────────────┘
                  ┌───────────────────────────┐
                  │  UAT (manual, per epic)   │   ← QA gate before release
                  └───────────────────────────┘
              ┌─────────────────────────────────┐
              │  Mock-mode click-through (dev)  │   ← primary UI verification today
              └─────────────────────────────────┘
          ┌───────────────────────────────────────┐
          │  Vitest — facade contract (mock impl) │   ← lib/mock/api.test.ts
          └───────────────────────────────────────┘
        ┌─────────────────────────────────────────────┐
        │  Vitest — pure logic (mappers, rbac, deriv) │   ← high ROI
        └─────────────────────────────────────────────┘
      ┌───────────────────────────────────────────────────┐
      │  tsc --noEmit (strict)  +  next lint              │   ← CI green-gate
      └───────────────────────────────────────────────────┘
```

### What to unit-test (high ROI)

- **`rowTo*` mappers** — they convert untyped DB rows into domain types. Test edge cases: nulls, missing joins, enum values.
- **`can(role, action)`** — every role × every action is one assertion. Easy to write, catches matrix typos.
- **`lib/derive/*`** — pure functions computing things like `cycleDay`, status, totals. Test with table-driven cases.
- **Date / cron math** — quiet hours, restock thresholds, trial expiry, ICT conversions.
- **Mock methods** — `addCustomer`, `addBatch`, etc. The mock IS the contract that the live impl must match.

### What NOT to unit-test (low ROI here)

- React component rendering of static markup. (No bugs, only churn.)
- Supabase round-trips against a real DB. (That's UAT and the P0 RLS check.)
- Mocks against mocks. If both sides of a test are mocks, the test asserts nothing about production.

### Existing pattern: `vi.mock('@/lib/supabase/client')`

Existing tests in `tests/api/` mock the Supabase browser client at module level and intercept `.from(table).select(...)` / `.insert(...)`. Follow this pattern for new facade tests:

```typescript
// tests/api/list-quotes.test.ts
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: (table: string) => ({
      select: () => ({
        order: () => Promise.resolve({
          data: [/* row fixtures */],
          error: null,
        }),
      }),
    }),
  }),
}));

describe('listQuotes', () => {
  it('maps rows to domain types', async () => {
    const { listQuotes } = await import('@/lib/api/supabase');
    const quotes = await listQuotes();
    expect(quotes[0].totalTHB).toBe(quotes[0].qty * quotes[0].unitPriceTHB);
  });
});
```

`tests/setup.ts` configures `@testing-library/jest-dom/vitest` so DOM matchers (`toBeInTheDocument`) work in jsdom.

### Cross-tenant test (P0)

Use Supabase's pgTAP via `supabase test db`. Authenticate as two separate users in the same transaction; assert the second cannot read the first's rows:

```sql
-- supabase/tests/cross-tenant.sql
begin;
  select plan(2);
  select tests.create_supabase_user('owner_a');
  select tests.create_supabase_user('owner_b');

  select tests.authenticate_as('owner_a');
  insert into public.quotes (nursery_id, customer_id, size, qty, unit_price)
    values (tests.get_supabase_uid('owner_a')::uuid, /* … */);

  select tests.authenticate_as('owner_b');
  select is((select count(*) from public.quotes)::int, 0, 'owner_b cannot read owner_a quotes');

  select tests.clear_authentication();
  select * from finish();
rollback;
```

Run with `supabase test db`. This is the canonical multi-tenant safety net.

### File location

```
tests/<domain>/<feature>.test.ts
tests/rbac/can.test.ts
tests/derive/cycle-day.test.ts
tests/api/supabase-mappers.test.ts
```

Test file name = source file name + `.test.ts`. Tests live in `tests/` not next to source — keeps `tsconfig` paths simple and excludes tests from build.

### Mock factory

```typescript
// tests/factories.ts
export function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'cust_1',
    name: 'พี่ชาติ',
    farm: 'ฟาร์มชายฝั่ง',
    /* ... */
    ...overrides,
  };
}
```

Use factories. Inline fixtures rot.

### E2E (deferred)

No Playwright in deps today. Mock-mode click-through covers the gap for now. E2E adoption is a §19 decision.

---

## 12. Performance defaults

### Defaults that need no justification

- **Server components by default.** Client components are an opt-in cost.
- **`next/image` for all images.** No raw `<img>` outside `prototypes/`.
- **No barrel files.** They defeat tree-shaking. The single allowed barrel is `lib/api/index.ts`, and it re-exports a curated facade, not a folder dump.
- **Dynamic imports for modals.** Modals are off-screen 99% of the time. `next/dynamic` with `{ ssr: false }` is fine for the modal body.
- **Dynamic imports for `recharts` and `framer-motion`.** Both are heavy and only on some pages.

### Caching in Next.js 16

Defaults flipped between versions; pin the mental model:
- **Next 14**: `fetch()` cached by default.
- **Next 15**: `fetch()` no longer cached by default.
- **Next 16 with `cacheComponents: true`** (the "Cache Components" opt-in): nothing is cached unless you mark it `'use cache'`. PPR (Partial Prerendering) becomes the default rendering model. Without `cacheComponents`, Next 15 semantics apply.

This repo runs on Next 16 default semantics (Next 15 caching behavior). Whether to opt into `cacheComponents` is a §19 decision.

### `revalidateTag` vs `revalidatePath`

Prefer `revalidateTag` — more precise, fewer over-invalidations:

```typescript
// Mark cached fetches with tags
async function getQuotes() {
  'use cache';
  cacheTag('quotes');
  return /* fetch */;
}

// In a mutation: stale-while-revalidate (catalogs)
import { revalidateTag } from 'next/cache';
revalidateTag('quotes');

// Read-your-own-writes (Server Actions only, Next 16+)
import { updateTag } from 'next/cache';
updateTag('quotes');
```

`revalidatePath` remains valid as a coarse hammer; reach for it only when tag-level invalidation is impractical.

### React Compiler

React Compiler 1.0 is stable; Next.js 16 promotes its config to GA. Opt-in:

```ts
// next.config.ts
const nextConfig: NextConfig = { reactCompiler: true };
// or gradual annotation mode:
const nextConfig: NextConfig = { reactCompiler: { compilationMode: 'annotation' } };
```

When enabled: the compiler auto-memoizes — most `useMemo`/`useCallback` become unnecessary. Don't strip existing memoization preemptively; the compiler is idempotent on existing patterns. Adoption is a §19 decision.

### Don't optimize until measured

- Don't add `useMemo` / `useCallback` without a profile showing the re-render is a problem.
- Don't add `React.memo` unless re-renders are profiled to be expensive AND the props are stable.
- Don't add `revalidate` ISR config unless you've identified the page is slow.

If you do optimize, leave a one-line comment with the measured before/after so the next reader doesn't strip it.

---

## 13. Security checklist

A reviewer runs this top-to-bottom. Any unchecked box = request changes.

**See [`security.md`](./security.md) for the full threat catalog** with concrete prevention steps per OWASP-style threat. This section is the merge-gate fast-scan; `security.md` is the deep reference.

- [ ] Files that use Stripe SDK or service-role key import `'server-only'` at the top.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is referenced only in: `app/api/webhooks/stripe/route.ts`, server actions, and `lib/auth.ts` / `lib/auth/bootstrap.ts` / `lib/billing/guard.ts` / `lib/supabase/storage.ts`. Never in a client component, hook, or any file with `'use client'`.
- [ ] Every new server action calls `supabase.auth.getUser()` (NOT `getSession()`), inline-looks up `nursery_members` (FLAG: table name — nursery tenant membership table), and runs `can(role, action)` before doing any work.
- [ ] Every new tenant-scoped table has RLS enabled with policies referencing `nursery_id in (select public.current_user_nursery_ids())` (FLAG: all identifiers — scope to the nursery tenant).
- [ ] The **P0 cross-tenant block test** (§11) runs and returns 0 for every new table.
- [ ] No PII appears in `console.log` (no phone, no email, no `line_user_id`, no Thai national ID, no full LINE Flex payloads).
- [ ] File uploads go to Supabase Storage with a signed URL **or** a public bucket if the asset is genuinely public (only the logo bucket today). Validate magic bytes (not just `file.type`) before upload — see `security.md` §file-upload.
- [ ] `audit_log` is written for every state-changing action (placeholder `// TODO(audit-log)` is acceptable until the table ships).
- [ ] No secrets in commit (`.env.example` has placeholders only; `.env.local` is in `.gitignore`).
- [ ] If the change touches Stripe webhook handling, signature verification + `subscription_events` idempotency are both preserved. Webhook routes do NOT have JSON body middleware.
- [ ] No server action accepts `nursery_id`, `user_id`, or `role` as a parameter (FLAG: `nursery_id` is the nursery tenant identifier — code identifier) — all derived from the session (§5 rule 9).
- [ ] `dangerouslySetInnerHTML` is not added (lint rule pending).
- [ ] Redirect targets are validated against the request origin (auth callbacks, invite acceptance) — see `security.md` §open-redirect.
- [ ] `pnpm audit --audit-level=high` passes (or every finding is documented with remediation plan in §19). **Enforced in CI** (`.github/workflows/ci.yml`, story S5) — the build fails on any unaddressed high-severity advisory. **Dependabot** (`.github/dependabot.yml`) opens grouped weekly PRs (Mondays); the team reviews + merges them weekly, and any high-severity advisory must be merged or explicitly waived (via `--ignore <id>` + a §19 deferral entry) within 48 hours. Dependabot PRs that fail CI are fixed or closed — never merged red.

---

## 14. Observability

### Server log prefix convention

Every server-side log uses a stable prefix so it can be filtered in Cloud Logging / Vercel.

```typescript
console.log('[hatchery-crm]', 'event_name', { nurseryId, customerId });
console.error('[hatchery-crm]', 'event_name_failed', { error: e, ...context });
```

Sub-systems extend the prefix: `[hatchery-crm:stripe]`, `[hatchery-crm:line-worker]`, `[hatchery-crm:cron]`.

### What to log

For every facade call from a server action:
- Entry: `facade:<method> start { nurseryId }` (FLAG: `nurseryId` = nursery tenant ID — code identifier)
- Success: `facade:<method> ok { nurseryId, durationMs }`
- Failure: `facade:<method> error { nurseryId, error }`

For every Stripe webhook:
- Event type, event ID, idempotency hit/miss, action taken.

For every LINE outbound:
- Queue ID, template, recipient (`line_user_id` is OK in `line_message_logs` table; **never** in `console.log`), status.

### What NEVER to log

- PCR certificate PDF contents (binary).
- LINE Flex message bodies (may contain customer copy).
- Customer phone, address, name (use the customer ID for traceability).
- `line_user_id` in `console.log` — it's a stable user identifier. Allowed only in DB tables with RLS.
- Any value of `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `LINE_CHANNEL_SECRET`.
- Full request bodies or JWT payloads.

### Error reporting — Sentry (recommended, not yet wired)

Adoption is a §19 decision. When wired, configure PII scrubbing in `beforeSend`:

```typescript
// instrumentation.ts (Next.js 16)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? 'development',
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Scrub PII from breadcrumbs and event payloads
    if (event.request?.data) delete event.request.data;
    if (event.user) delete event.user.email;
    // Drop log strings that look like PII
    if (event.message?.match(/\b\d{10}\b|line_user_id/i)) return null;
    return event;
  },
  ignoreErrors: ['PaywallError', 'Network request failed'],
});
```

### Vercel Analytics + Speed Insights

`@vercel/analytics` and `@vercel/speed-insights` are zero-config drop-ins. Worth enabling for any production tenant once the app is live. Not in scope before first paying tenant.

---

## 15. Naming

| Artifact | Convention | Example |
|---|---|---|
| File (page) | `page.tsx` (route convention) | `app/[locale]/(dashboard)/quotes/page.tsx` |
| File (action) | `actions.ts` | `app/[locale]/(dashboard)/quotes/actions.ts` |
| File (component) | `PascalCase.tsx` for primitives; `kebab-case.tsx` for modals/features | `V3Card.tsx`, `add-quote-modal.tsx` |
| File (hook) | `use-<name>.ts` | `use-customers.ts` |
| File (test) | `<source>.test.ts` | `quotes-mapper.test.ts` |
| File (query keys) | `query-keys.ts` colocated with the route | `app/.../quotes/query-keys.ts` |
| React component | `PascalCase` | `QuotesTable` |
| Hook | `useCamelCase` | `useAddQuote` |
| Server action | `verbNoun` + `Action` | `createQuoteAction`, `closeAlertAction` |
| Type | `PascalCase` | `Quote`, `AddQuoteInput` |
| Type union | `PascalCase` ending in `Status` for state machines | `QuoteStatus`, `SubscriptionStatus` |
| Money fields | suffix with currency code | `unitPriceTHB`, `totalTHB`, `amountSatang` |
| Date fields | ISO 8601 UTC strings; suffix `At` for timestamps | `createdAt`, `trialEndsAt` |
| Constant | `SCREAMING_SNAKE` for top-level; `camelCase` for module-private | `CRON_SECRET_HEADER` |
| Zustand store hook | `use<Name>Store` | `useModalStore` |
| TanStack query key | factory module per domain (§4) | `queryKeys.quotes.list(filters)` |
| Modal `kind` slug | `kebab-case` | `'add-quote'`, `'close-alert'` |
| Audit log action | `domain.verb` | `quote.create`, `customer.delete`, `alert.close` |
| RBAC action | `domain:verb` | `customer:write`, `alert:close` |
| i18n key | See §10 | `Quotes.form.errors.qty_positive` |
| DB table | `snake_case`, plural | `quotes`, `batch_buyers` |
| DB column | `snake_case` | `unit_price`, `created_at` |
| Migration | `NNN_short_name.sql` | `013_quotes.sql` |
| Branch | `<story-id>/<slug>` | `B3/customer-detail`, `K2/batch-read-api` |
| Commit subject | Conventional Commits, story ID scope | `feat(B3): wire customer detail to db` |

---

## 16. Code review checklist

A reviewer pastes this into the PR thread and checks each item. The author cannot merge until every box is checked or explicitly waived with rationale.

### Correctness
- [ ] `pnpm typecheck` passes (CI gate).
- [ ] `pnpm lint` passes (CI gate).
- [ ] `pnpm test` passes (CI gate).
- [ ] Mock-mode click-through works at `/th` for every changed user-visible surface.
- [ ] The story's tasks are all `[x]` and Status is `review`.

### Architecture
- [ ] No imports violate the matrix in §1.
- [ ] No page or component calls Supabase directly — only `@/lib/api`.
- [ ] No `'use client'` added where not needed.
- [ ] No `any` in app code; `as` only in `lib/api/supabase.ts` mappers.
- [ ] Client component is the leaf, server component wraps it (§3).

### Data
- [ ] If a new table: RLS enabled with `IN (select current_user_nursery_ids())`; both mock and live impls; types regenerated; P0 cross-tenant SQL verified.
- [ ] If a new **tenant-scoped** table: `supabase/tests/cross-tenant.sql` is updated with that table (seed + `is(count,0,…)` assertion) in the same PR — the `pgtap-cross-tenant` CI gate (story S8) only protects tables present in that file.
- [ ] If a new facade method: signatures match between `lib/mock/api.ts` and `lib/api/supabase.ts`.
- [ ] Mutation invalidates the right query keys via the factory (§4).
- [ ] Mutation that runs via `useActionState` / `<form action>` also triggers TanStack invalidate on success (§4 gotcha).

### RBAC + auth
- [ ] Every new server action does the full sequence: `isMockMode()` → `requireActiveSubscription()` → zod parse → `getUser()` → `nursery_members` lookup → `can(role, action)` → work → revalidate.
- [ ] No code branches on role strings (§9).
- [ ] No server action accepts `nursery_id` / `user_id` / `role` as a parameter.
- [ ] If a new action: matrix in `lib/rbac.ts` and `architecture.md` §4 both updated.

### i18n
- [ ] Every new user-facing string has a key.
- [ ] Both `messages/th.json` and `messages/en.json` updated in this PR.
- [ ] No `⚠️ {key}` visible during click-through.

### Brand
- [ ] No emoji on professional surfaces.
- [ ] No banned words ("AI-powered", "platform", "revolutionary", excitement punctuation).
- [ ] Empty states have explicit copy, not placeholders.

### Security
- [ ] §13 checklist passes.

### Observability
- [ ] Server logs use the `[hatchery-crm]` prefix.
- [ ] No PII in `console.log`.

If all boxes are checked, **merge**. Do not bikeshed beyond this list. Style nits go in a follow-up PR or a `code-design.md` proposal — not in the current thread.

---

## 17. PR / commit / branch conventions

### Branch

```
<story-id>/<short-kebab-slug>
```

Examples: `A1/sign-up-bootstrap`, `B3/customer-detail`, `K2/batch-read-api`.

Out-of-story branches (rare): `chore/<slug>`, `fix/<slug>`, `docs/<slug>`.

### Commit

Conventional Commits with the story ID in the scope:

```
<type>(<story-id>): <subject>

<body — optional, what + why, not how>
```

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `perf`, `style`.

Examples:
```
feat(B3): wire customer detail page to db
fix(C4): handle missing PCR rows in cert generator
docs(bmad): add code-design handbook
```

Subject is imperative ("add", "fix") not past. Lowercase. No period.

### PR

- Title = the same as the commit subject.
- Body links the story file: `Implements docs/bmad/stories/B3.view-customer-detail-and-history.md`.
- Body pastes the §16 checklist with boxes checked.
- Body links the UAT file for the epic.
- One story = one PR. If a story is too big for one PR, the story is too big — split it before coding.

### Definition of done

A story is done when:
1. All tasks `[x]` in the story file.
2. `pnpm typecheck && pnpm lint && pnpm test` passes.
3. The §16 checklist is fully checked in the PR.
4. The story's UAT cases pass in mock mode.
5. The reviewer approved.
6. PR is merged to the tracked branch (umbrella auto-bumps within ~10s).

---

## 18. Anti-patterns

Each section is paired: bad code + why bad + correct version.

### A. Supabase from a page

```tsx
// ❌
import { createBrowserClient } from '@supabase/ssr';
export default async function CustomersPage() {
  const supabase = createBrowserClient(/* ... */);
  const { data } = await supabase.from('customers').select('*');
}
```

Why bad: bypasses the facade, defeats mock-mode, leaks the schema into the UI layer.

```tsx
// ✅
import { listCustomers } from '@/lib/api';
export default async function CustomersPage() {
  const customers = await listCustomers();
}
```

### B. Branching on role strings

```typescript
// ❌
if (member.role === 'owner' || member.role === 'counter_staff') { ... }
```

Why bad: the matrix drifts. Adding a role requires touching every branch.

```typescript
// ✅
if (can(member.role, 'customer:write')) { ... }
```

### C. `getSession()` for authorization

```typescript
// ❌
const { data: { session } } = await supabase.auth.getSession();
if (session?.user) { /* trust */ }
```

Why bad: `getSession()` only decodes the JWT locally. A tampered cookie passes this check. The JWT validation does not happen on the client.

```typescript
// ✅
const { data: { user } } = await supabase.auth.getUser();  // server round-trip
if (user) { /* trust */ }
```

### D. Hardcoded strings in JSX

```tsx
// ❌
<h1>Customers</h1>
```

Why bad: breaks the locale switch, ships English to Thai users.

```tsx
// ✅
<h1>{t('list.title')}</h1>
```

### E. `any` in app code

```typescript
// ❌
function format(row: any) { return row.created_at; }
```

Why bad: hides schema drift; the next migration will break this silently.

```typescript
// ✅
function format(row: Customer) { return row.createdAt; }
```

### F. Mutating in place

```typescript
// ❌
function setStatus(customers: Customer[], id: string, status: CustomerStatus) {
  const c = customers.find((c) => c.id === id);
  if (c) c.status = status;
  return customers;
}
```

Why bad: React + TanStack Query treat arrays as immutable. Mutating in place skips re-renders.

```typescript
// ✅
function setStatus(customers: Customer[], id: string, status: CustomerStatus) {
  return customers.map((c) => (c.id === id ? { ...c, status } : c));
}
```

### G. `useEffect` for data fetching

```tsx
// ❌
'use client';
function CustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  useEffect(() => { listCustomers().then(setCustomers); }, []);
}
```

Why bad: no caching, no dedup, no loading state, no error state, refetches on every mount, races on unmount.

```tsx
// ✅ — server component (default)
export default async function CustomersList() {
  const customers = await listCustomers();
  return <Table rows={customers} />;
}

// ✅ — client when interactivity required
'use client';
function CustomersList() {
  const { data } = useSuspenseQuery({ queryKey: queryKeys.customers.all(), queryFn: listCustomers });
  return <Table rows={data}/>;
}
```

### H. `useFormState` (deprecated)

```tsx
// ❌
import { useFormState } from 'react-dom';
```

Why bad: deprecated in React 19. The replacement is in `react`, not `react-dom`.

```tsx
// ✅
import { useActionState } from 'react';
```

### I. Cross-module reach-in

```typescript
// ❌
import { mockCustomers } from '@/lib/mock/api';     // from a component
import { rowToCustomer } from '@/lib/api/supabase'; // from a page
```

Why bad: violates §1 import matrix. Mock seed data and row mappers are private to their module.

```typescript
// ✅
import { listCustomers } from '@/lib/api';
```

### J. Speculative abstraction

```typescript
// ❌
function makeListEndpoint<T>(table: string, options: ListOptions<T>) { /* 200 lines */ }
// used exactly once
```

Why bad: the abstraction's surface is bigger than the duplication it removes.

```typescript
// ✅
async function listCustomers(): Promise<Customer[]> { /* 12 lines, obvious */ }
```

### K. Server action accepts authority

```typescript
// ❌
export async function deleteQuote(quoteId: string, nurseryId: string) {
  // …attacker controls nurseryId
}
```

Why bad: client-supplied authority. Even with Next.js's AES-encrypted closure variables, FormData is fully under the attacker's control. **Always derive the nursery tenant ID (`nursery_id` — FLAG: code identifier) server-side from the session.**

```typescript
// ✅
export async function deleteQuoteAction(raw: unknown) {
  // derive nursery_id from getUser() + nursery_members lookup (see §5)
}
```

### L. Toast as a state machine

```tsx
// ❌
toast.success('Saving...');
await save();
toast.success('Saved!');
```

Why bad: toasts are for non-blocking acknowledgments, not progress. A spinner on the button is correct.

```tsx
// ✅
<button disabled={pending}>{pending ? t('saving') : t('save')}</button>
// then on success:
toast.success(t('toasts.saved'));
```

### M. `console.log` of PII

```typescript
// ❌
console.log('Sending to', customer.phone, customer.lineUserId);
```

Why bad: leaks PII into Vercel/Cloud Logging, indexed for the lifetime of the project.

```typescript
// ✅
console.log('[hatchery-crm]', 'line.send', { customerId: customer.id });
```

### N. Missing `.eq('nursery_id')` with RLS

```typescript
// ❌ — RLS will scope correctly, but Postgres can't prune by index before the policy
const { data } = await supabase.from('customers').select('*');
```

Why bad: even though RLS gives you correctness, it doesn't give you performance. Postgres reads the full table, applies the policy per row.

```typescript
// ✅ — let the index prune first
const { data } = await supabase.from('customers').select('*').eq('nursery_id', nurseryId);
```

---

## 19. Decision log

Append-only. When the team makes a non-obvious technical decision, add a row. Future readers grep here before relitigating.

Format:

```
### YYYY-MM-DD · <short title>
- Decision: <one sentence>
- Alternatives considered: <list>
- Rationale: <why this won>
- Owner: <person>
- Link: <PR or doc>
```

### 2026-05-17 · S4 — Adopted nonce-based CSP (incompatible with PPR)

- Decision: `proxy.ts` emits a fresh per-request nonce + `script-src 'self' 'nonce-…' 'strict-dynamic'` CSP (canonical string = `security.md` §17), plus `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`; HSTS via `next.config.mjs` `headers()` (production only). Nonce pushed onto request headers (`x-nonce`) and surfaced at `<html data-nonce>` for any future inline `<Script>`.
- Trade-off: nonce-based CSP forces fully dynamic rendering — **incompatible with `cacheComponents: true` / PPR**. Hash-based CSP (experimental `sri` option) is the migration path if/when PPR becomes worthwhile. Until then, do not enable `cacheComponents`.
- Dev exception: `'unsafe-eval'` is appended to `script-src` only when `NODE_ENV !== 'production'` (Next.js HMR / React Refresh requires it). Never in prod.
- Owner: Patipond (story S4).
- Link: this commit.

### 2026-05-15 · Launch target — first paying tenant within 90 days

- Decision: ship to first paying tenant within 90 days (target ~2026-08-15). The hatchery-crm scaffold is the platform; the first tenant is most likely a nursery using the scaffold (the codebase is "nursery-style CRM scaffolded against hatchery vocabulary" per `CLAUDE.md`). Hatchery proper remains 2027 per `prd.md` §2.
- Implication: every "before launch" decision below is bounded by this date.
- Owner: Chain (CEO) + Patipond.
- Link: this commit.

### 2026-05-15 · Audit log table + `logAudit()` helper — build pre-launch

- Decision: build before first paying tenant. Single `audit_log` table with jsonb payload, immutability trigger, BRIN time index, monthly partitioning. Helper at `lib/audit.ts` writes via `SECURITY DEFINER` RPC. Schema in §8.
- Alternatives considered: per-domain audit tables (rejected — too many migrations), external audit service like DataDog/BetterStack (rejected — vendor lock-in, cost), defer until first incident (rejected — PDPA accountability requires it).
- Rationale: Supabase-recommended pattern, cheapest to operate, one trigger surface, BRIN-indexable.
- Owner: Patipond.
- Link: TBD (story to be scheduled in Epic S follow-up).

### 2026-05-15 · Error reporting — Sentry, wired next sprint

- Decision: Sentry on `instrumentation.ts` with `beforeSend` PII scrub (config in §14). Free tier sufficient pre-launch.
- Alternatives considered: Highlight, Vercel native observability, Datadog, none (rely on Vercel/Cloud Logging only).
- Rationale: Next.js integration is well-documented, free tier covers pre-launch volume, `beforeSend` gives us deterministic PII redaction.
- Owner: Patipond.
- Link: TBD.

### 2026-05-15 · Rate limiting — Vercel WAF Rate Limiting SDK

- Decision: use `@vercel/firewall` (Vercel WAF Rate Limiting SDK, GA 2026). Composite key `${ip}:${userId}`. Limits configured in Vercel Firewall dashboard.
- Alternatives considered: Upstash Ratelimit + Vercel KV.
- Rationale: we're all-in on Vercel for the user-facing app (cron + LINE worker stay on GCP Cloud Run, but those don't need user-facing rate-limit). First-party tooling, no extra service to operate. Switch to Upstash if we ever leave Vercel.
- Owner: Patipond.
- Link: TBD.

### 2026-05-15 · PDPA — DSR endpoint cross-repo, with shared spec

- Decision: ship Data Subject Request endpoint pre-launch. Spec lives in `aquawise-docs/DSR-SPEC.md`; hatchery-crm and line-bot each implement their own endpoint conforming to the spec. Customer-facing UX is a single button that calls both.
- Alternatives considered: this-repo only (rejected — line-bot stores `line_user_id`, must be covered), umbrella proxy service (rejected — extra deployment), shared service in new repo (rejected — overkill at this scale), decide later (rejected — PDPA requires response within 30 days, can't be ad-hoc).
- Rationale: looser coupling than a proxy, easier to evolve, each repo owns its own data lifecycle.
- Owner: Patipond drives spec; engineers split implementation per repo.
- Link: cross-repo PR — `aquawise-docs/DSR-SPEC.md` + hatchery-crm story S7 + line-bot story (TBD).

### 2026-05-15 · DPO — Founder/CEO as interim

- Decision: name Patipond as interim DPO in the public privacy notice. Complete PDPC online course before launch.
- Alternatives considered: hire external DPO service (~30-60k THB/yr) (deferred — revisit at 100+ tenants or enterprise customer demand), defer naming (rejected — company-level PDPA liability without a named DPO).
- Rationale: standard for pre-Series-A SaaS; cheap; revisit when scale or customer demands change.
- Owner: Patipond.
- Link: privacy notice TBD.

### 2026-05-15 · Cross-tenant pgTAP test — CI required check

- Decision: wire pgTAP cross-tenant test (recipe in §11) into `.github/workflows/ci.yml` as a required check before launch. Every PR runs `supabase test db`.
- Alternatives considered: manual check only (rejected — drift inevitable), defer until first incident (rejected — `architecture.md` already calls cross-tenant block P0), skip — trust RLS (rejected — RLS bugs are the #1 multi-tenant incident class).
- Rationale: automated CI catches cross-tenant leaks before deploy. No exceptions.
- Owner: Patipond (and Epic S follow-up story S8).
- Link: TBD.

### 2026-05-15 · ESLint custom rules — three bans

- Decision: enforce three §18 anti-patterns via ESLint at lint time, not review time:
  1. `no-restricted-syntax` — ban `getSession` outside `lib/supabase/middleware.ts`
  2. `react/no-danger` set to `error`
  3. Custom rule — ban `=== 'owner'` / `=== 'counter_staff'` etc. on member.role
- Alternatives considered: just the highest-leverage two (deferred — role-string ban needs cleanup first; see next entry), document only (rejected — drifts), lint the whole §18 list (rejected — some rules hard to express as lint).
- Rationale: shifts enforcement left. Combined with §16 review checklist, catches violations before merge.
- Owner: Patipond (Epic S story S9).
- Link: TBD.

### 2026-05-15 · Existing role-string violations — Epic S story for cleanup

- Decision: catalog every existing `if (role === 'owner')` (and variants) in `settings/actions.ts` and elsewhere; refactor to `can()`. Estimated ~half-day. Story S6.
- Alternatives considered: opportunistic fix when touching the file (rejected — drift), generic tech-debt backlog (rejected — never cleared), relax the §9 rule (rejected — defeats merge-gate purpose).
- Rationale: clean baseline before ESLint custom rule ships, so the rule doesn't turn the codebase into a wall of red.
- Owner: Patipond (story S6).
- Link: TBD.

### 2026-05-15 · Test coverage backfill — critical paths only

- Decision: ~3 days of Vitest backfill before launch covering: auth bootstrap idempotency, Stripe webhook idempotency, RBAC matrix (`can()` × every role × every action), pgTAP cross-tenant SQL test. Skip UI rendering tests; mock-mode click-through remains the dominant verification path for UI.
- Alternatives considered: full Vitest + Playwright E2E suite (rejected — ~2 weeks, too costly for the 90-day window), no backfill (rejected — billing webhook regressions would be silent), incremental as features change (deferred — falls back to this if S-series timing slips).
- Rationale: highest-ROI coverage on the high-blast-radius code; mock-mode handles the UI surface.
- Owner: Patipond.
- Link: TBD.

### 2026-05-15 · React Compiler — annotation mode on heavy pages

- Decision: `reactCompiler: { compilationMode: 'annotation' }` in `next.config.ts`. Add `'use memo'` to: dashboard hero, customer detail (sparkline), batch detail. Promote to global opt-in only when a tenant is in production and we have real perf data.
- Alternatives considered: global opt-in (deferred — higher risk if any pattern relies on referential equality), don't adopt (rejected — compiler is mature and gradual mode is safe), skip entirely (rejected — easy auto-perf win on charts/tables).
- Rationale: low-risk gradual adoption. Compiler is idempotent on existing memoization; existing `useMemo`/`useCallback` stay intact.
- Owner: Patipond.
- Link: TBD.

### 2026-05-15 · Epic K sequencing — line-bot ships first, hatchery-crm follows

- Decision: line-bot Epic K (LINE batch attribution, 13 stories K1-K13) ships before hatchery-crm K1-K4. The bot side defines the webhook publisher contract (K12); the CRM side implements the consumer (K4).
- Alternatives considered: parallel ship (rejected — coordinated cut-over risk), CRM stubs first (rejected — CRM is 2027-customer; LINE bot is 2026-customer per prd §2), no decision (rejected — duplicate-work risk).
- Rationale: prd-driven. Stakeholder order: farmer + nursery 2026 (line-bot) → hatchery 2027. Bot side ships first because it has paying users sooner.
- Owner: Patipond + line-bot team.
- Link: line-bot Epic K stories.

### 2026-05-15 · PR review workflow

- Decision: 3-engineer team. The other 2 engineers write code; Patipond reviews PRs with AI assistance (e.g., Claude `/code-review` skill) and merges to `main`. Security stories (S1-S9) get an extra pass — Patipond runs `/security-review` before merge.
- Alternatives considered: pair-review for security only (rejected — adds latency), contractor-led review (rejected — cost, conflict-of-interest with feature work), trust-based after CI (rejected — too loose for pre-launch).
- Rationale: matches actual team size and operating tempo. AI review is the second pair of eyes that scales.
- Owner: Patipond.
- Link: this commit.

### 2026-05-15 · Remaining §19 entries — defer until first paying tenant

- Decision: the following stay TBD with their rationale leans intact until first paying tenant; revisit then or when a feature/perf concern forces the question:
  - RLS helper schema move (`public` → `private`) — small win, no urgency
  - JWT custom claims for RLS — performance optimization, no current bottleneck
  - `cacheComponents: true` / PPR adoption — defer until a slow page exists
  - `next-safe-action` adoption — defer until ≥5 actions need shared middleware
  - Playwright E2E framework — defer until billing-flow regression risk surfaces
- Rationale: none are launch-blockers. Each has a clear trigger condition. Premature adoption costs migration time without measured benefit.
- Owner: Patipond.
- Link: this commit.

### 2026-05-15 · Adopt code-design.md as merge-gate reference

- Decision: Add `docs/bmad/code-design.md` (this file) + `docs/bmad/security.md` (threat catalog). `architecture.md` remains the rules; this is the how-to.
- Alternatives considered: inline everything in story Dev Notes (rejected — scales badly across 33+ stories), split into per-topic files (rejected — cognitive cost of navigation), one combined security+code file (rejected — different audience, different update cadence).
- Rationale: two files. Code-design = patterns for daily work. Security = threat reference + pre-launch hardening.
- Owner: Patipond.
- Link: this commit.

### 2026-05-16 · S6 — Role-string violations eliminated

- Decision: refactored the 2 remaining role-string comparisons to `can()`: `settings/actions.ts:50` (`role === 'owner'` → `can(role, 'settings:write')`) and `settings/team/actions.ts:38` (`scope.role !== 'owner'` → `!can(scope.role, 'team:invite')`). No new `Action` added — existing matrix actions express both intents. Post-refactor scan: 0 role-string comparisons outside `lib/rbac.ts`. `tests/rbac/can.test.ts` already provided the full table-driven matrix; no change needed there. Unblocks S9's role-string ESLint ban.
- Owner: Patipond (story S6).
- Link: this commit.

### 2026-05-16 · S1 — Next.js i18n middleware-bypass CVE: verified already patched

- Decision: GHSA-36qx-fr4f-26g5 (Next.js i18n middleware bypass, vulnerable `>=16.0.0 <16.2.5`) is already remediated — `pnpm-lock.yaml` resolves `next@16.2.6`, `next-intl@4.12.0`, direct `postcss@8.5.14`. No `pnpm up` required. `pnpm audit --audit-level=high` exits 0.
- Residual: one **moderate** advisory remains — GHSA-qx2v-qp2m-jg93 (PostCSS `<8.5.10` XSS) via `next@16.2.6`'s **bundled** `postcss@8.4.31` (transitive, not our direct dep; our direct postcss is 8.5.14). Not high-severity, so it does not block `--audit-level=high`. Patched upstream when Next bumps its bundled postcss; tracked by S5 Dependabot. No app-code exposure (PostCSS runs build-time only, no untrusted CSS input).
- Tooling note: the globally-installed `pnpm` (8.15.0) has a broken `audit` (`reference.startsWith is not a function`); run audits via `corepack pnpm` which honours the pinned `pnpm@10.0.0`. CI uses corepack so it is unaffected.
- Owner: Patipond (story S1).
- Link: this commit.

<!-- Add new entries above this line, newest first. -->

---

## 20. Further reading

Curated, authoritative sources for each topic. Update when a section here references new material.

### Next.js 16 + React 19
- [Next.js 16 docs — App Router](https://nextjs.org/docs/app) — primary reference
- [Next.js Data Security](https://nextjs.org/docs/app/guides/data-security) — CSRF, closure encryption, allowed origins
- [Next.js Forms guide](https://nextjs.org/docs/app/guides/forms) — `useActionState` canonical pattern
- [Next.js Caching & Revalidating](https://nextjs.org/docs/app/getting-started/caching-and-revalidating) — `revalidateTag`/`updateTag`, `cacheComponents`
- [Next.js CSP guide](https://nextjs.org/docs/app/guides/content-security-policy) — nonce + `strict-dynamic`
- [React Compiler 1.0 release](https://react.dev/blog/2025/10/07/react-compiler-1)
- [Server & Client Components composition](https://nextjs.org/docs/app/getting-started/server-and-client-components)

### TanStack Query 5
- [TanStack Query — Advanced SSR (App Router hydration)](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- [TanStack Query — Suspense](https://tanstack.com/query/latest/docs/framework/react/guides/suspense)
- [TanStack Query — Important Defaults (staleTime)](https://tanstack.com/query/v5/docs/framework/react/guides/important-defaults)
- [TkDodo — Effective Query Keys (factory pattern)](https://tkdodo.eu/blog/effective-react-query-keys)
- [TkDodo — Automatic Query Invalidation](https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations)
- [TkDodo — Practical React Query](https://tkdodo.eu/blog/practical-react-query)

### Supabase + RLS
- [Supabase RLS Performance and Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) — the `SELECT` wrap, index policy
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Custom Claims + RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Supabase Testing Overview (pgTAP)](https://supabase.com/docs/guides/local-development/testing/overview)
- [Supabase Postgres Audit blog](https://supabase.com/blog/postgres-audit)
- [Supabase Server-Side Auth (Next.js) — getUser vs getSession](https://supabase.com/docs/guides/auth/server-side/nextjs)

### Security
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) — entry point for any vulnerability class
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [Stripe Webhook Signatures](https://docs.stripe.com/webhooks/signatures)
- [LINE Webhook signature verification](https://developers.line.biz/en/docs/messaging-api/receiving-messages/#verifying-signatures)
- [Vercel WAF Rate Limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting) + [SDK](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting-sdk)
- [PDPC Thailand — official PDPA](https://www.pdpc.or.th/en/pdpa)
- See [`security.md`](./security.md) for the full threat catalog

### Forms + validation
- [react-hook-form docs](https://react-hook-form.com/)
- [Zod 4 docs](https://zod.dev/)
- [@hookform/resolvers — zod adapter](https://github.com/react-hook-form/resolvers)
- [next-safe-action](https://next-safe-action.dev/) — typed action middleware

### Tooling
- [Vitest docs](https://vitest.dev/)
- [Testing Library — React](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/) — when E2E is adopted

---

## Document maintenance

- This file is **append-friendly**. Adding a recipe or anti-pattern is cheap and welcome.
- Changing a rule requires a §19 entry **and** an update to `architecture.md` if the rule is declarative.
- Deprecated sections are not deleted — they get a `> DEPRECATED YYYY-MM-DD — see §X` header and stay for one release cycle.
- When `architecture.md` and this file disagree, fix this file. `architecture.md` is the source of truth for rules.
- When `security.md` and this file disagree on a security topic, `security.md` wins on details; this file's §13 is the merge-gate fast-scan.
