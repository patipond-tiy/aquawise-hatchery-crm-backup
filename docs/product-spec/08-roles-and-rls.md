# 08 — Roles, Permissions, and RLS

The product-spec uses **two different lenses** that we keep separate on
purpose:

- **Personas** (in `01-personas.md`) describe *who uses the product and
  why*. They're behavioral archetypes — Owner, Manager, Rep, Lab Officer,
  Auditor, Farmer.
- **Auth roles** (this file) describe *what the database lets a logged-in
  user do*. They're enforced by Postgres RLS and the `hatchery_members.role`
  enum.

A persona is not a role and a role is not a persona. One persona can map
to multiple roles over time (a Manager who later only does PCR work
becomes a `lab_tech`); one role can serve multiple personas (a Manager
and a Rep can both hold `counter_staff`).

This file is the contract for the auth model and the RLS strategy.

---

## Implementation roles

These are the values stored in `hatchery_members.role`. They come from
`docs/business-guide/aquawise-hatchery-functional-requirements (2).md`
(FR-TEAM-002).

| Role | Capabilities | Constraints |
|---|---|---|
| `owner` | Full CRUD on customers, batches, quotes, alerts, certs. Invite/remove team. View billing. Configure scorecard. Configure notification thresholds. Export data. | One per hatchery created at signup; can promote `counter_staff` to `owner`. |
| `counter_staff` | Create + view customers; add batches (without PCR); send quotes / certs / alerts via LINE; view quote history; schedule callbacks; reply to chat. | Cannot delete batches. Cannot invite team or change roles. Cannot view billing. Cannot configure thresholds. |
| `lab_tech` | Create + update PCR test results on batches. Generate certificates. View batch disease status. | Cannot create batches (counter_staff does). Cannot send alerts or quotes. Cannot view customer commercial fields (LTV). |
| `auditor` *(planned)* | Read-only on all batches, PCR records, alerts. | Cannot read commercial fields (LTV, prices, quote amounts). For ASC certification flow. Not implemented in Phase H1. |

The `auditor` role is reserved in the schema enum from day one so we
don't have to migrate later, even though no UI grants it in Phase H1.

---

## Persona → role mapping

| Persona (`01-personas.md`) | Default role | Alt role | Notes |
|---|---|---|---|
| P1 Owner — "คุณสุเทพ" | `owner` | — | One per hatchery |
| P2 Manager — "คุณนิภา" | `counter_staff` | `owner` | Often co-admin in family-run hatcheries |
| P3 Customer Rep — "คุณรัตนา" | `counter_staff` | — | Most common role |
| P4 PCR / Lab Officer — "คุณพรชัย" | `lab_tech` | — | Narrow surface |
| P5 Auditor — "คุณมานพ" | `auditor` *(planned)* | — | Phase H3 |
| P6 Farmer — "พี่ชาติ" | *no CRM role* | — | Lives in @aquawise LINE OA + LIFF; never logs into the CRM. Identity is `line_users.line_user_id`, bound to `customers.line_id`. |
| Association President — "P'Pong" | `owner` of his own hatchery | — | Brand-influence persona, not an auth concept |

---

## RLS strategy

Postgres Row-Level Security enforces tenancy. Every row carries either a
`hatchery_id` directly or a foreign-key chain that resolves to one.

### Per-table policies (Phase H1)

| Table | Read | Insert | Update | Delete |
|---|---|---|---|---|
| `hatcheries` | own row | — (created server-side at signup) | `owner` only | — |
| `hatchery_members` | own hatchery's members | `owner` only (via invite acceptance) | `owner` only | `owner` only |
| `team_invites` | `owner` only | `owner` only | `owner` only (revoke) | `owner` only |
| `hatchery_brand` | own hatchery + **public** for `/h/{slug}` page | `owner` | `owner` | — |
| `customers` | own hatchery (all roles) | `owner` + `counter_staff` | `owner` + `counter_staff` | `owner` only |
| `customer_bind_tokens` | service role only (LIFF reads) | `owner` + `counter_staff` | service role | service role |
| `batches` | own hatchery (all roles) | `owner` + `counter_staff` | `owner` + `counter_staff` (basic fields) + `lab_tech` (PCR fields) | `owner` only |
| `batch_pcr_tests` | own hatchery (all roles) | `lab_tech` + `owner` | `lab_tech` + `owner` | `owner` only |
| `batch_distributions` | own hatchery (all roles) | `owner` + `counter_staff` | `owner` + `counter_staff` | `owner` only |
| `quotes` | own hatchery (all roles) | `owner` + `counter_staff` | `owner` + `counter_staff` | `owner` only |
| `prices` | own hatchery (all roles) | `owner` only | `owner` only | `owner` only |
| `alerts` | own hatchery (all roles) | `owner` + `counter_staff` + system trigger | `owner` + `counter_staff` (close/note) | `owner` only |
| `notification_settings` | own hatchery (all roles) | `owner` | `owner` | `owner` |
| `scorecard_settings` | own hatchery (all roles) | `owner` | `owner` | `owner` |
| `customer_callbacks` | own hatchery (all roles) | `owner` + `counter_staff` | `owner` + `counter_staff` | `owner` only |
| `line_outbound_events` | own hatchery (all roles) | server actions only | service role (worker) | — |
| `line_message_logs` | own hatchery (all roles) | service role only | — | — |
| `subscriptions` | `owner` only | service role only (Stripe webhook) | service role only | — |
| `data_exports` | own hatchery (all roles) | server actions only | — | `owner` only |

### Field-level (Phase H3, for `auditor`)

When the `auditor` role ships, RLS policies must add column-level
restrictions: deny `customers.ltv`, `prices.*`, `quotes.items->price`,
`batch_distributions.unit_price` to `auditor`. The cleanest way is to
add row-level policies + use Postgres `SECURITY INVOKER` views that hide
the columns and grant `auditor` SELECT on the views, not the base tables.

---

## Special-case principals

### Service role (bot worker, Stripe webhook, cron)

- Bypasses RLS.
- Used by: the LINE bot worker (Cloud Run service) reading
  `line_outbound_events`, the Stripe webhook handler reconciling
  `subscriptions`, and the daily cron enqueueing restock/harvest events.
- **Constraint:** the bot worker MUST select `hatchery_brand` keyed by
  `event.hatchery_id` when rendering Flex. A bug here causes farmer to
  see the wrong hatchery's logo. Add an integration test (P0).

### Anonymous / public (no auth)

- Used only by the public scorecard route `/{locale}/h/{slug}`.
- RLS policy: `hatchery_brand` row is public-readable WHERE
  `scorecard_settings.public = true`.
- Aggregates (avg D30, batch count, PCR stats) are computed server-side
  and cached; `customers`, `batches`, `prices` remain private.

### LIFF (farmer authenticated by LINE Login)

- Authenticates via LINE Login token; server exchanges for
  `line_user_id`.
- Maps to `customers` via `line_id`. Farmer reads only their *own*
  threads, messages, certificates, and notification preferences.
- Implemented as service-role server actions that filter by
  `line_user_id` — RLS doesn't have a notion of "farmer" because it's
  not a hatchery user. Treat this as a "trusted gateway" pattern.

---

## Verification

The single highest-value test in this codebase is the **cross-tenant
read block**. It must run on every deploy:

```sql
-- as user A (hatchery_a member)
SELECT count(*) FROM customers WHERE hatchery_id = '{hatchery_b}';
-- expected: 0

SELECT count(*) FROM batches WHERE hatchery_id = '{hatchery_b}';
-- expected: 0

-- ...repeat for every table with hatchery_id
```

The exact harness is up to test-engineer (Vitest + Supabase test
project). Failure of any row returning > 0 is a P0 stop-the-line bug.

---

## Cross-references

- Personas: `01-personas.md`
- FR doc: `docs/business-guide/aquawise-hatchery-functional-requirements (2).md`
  (FR-WS-003, FR-TEAM-001..003)
- LINE bind / `line_users` flow: `05-line-integration.md` Flow 4
- Public scorecard policy: `04-flows.md` Flow 9 (added in this revision)
- RLS audit P0 task: `06-production-gap.md` P0.3
