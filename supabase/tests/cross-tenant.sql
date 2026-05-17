-- Story S8 — cross-tenant RLS isolation gate (pgTAP).
--
-- Proves that a user belonging to nursery B cannot read ANY row that
-- belongs to nursery A, for every tenant-scoped table in architecture.md
-- §5 (directly nursery_id-scoped + FK-chained via batches/customers/alerts).
--
-- Design: the test runs as the migration/superuser role, which BYPASSes
-- RLS, so we seed exactly one nursery-A row per table. We then drop to the
-- `authenticated` role and set the request JWT to owner_B's uid (this is
-- what Supabase's auth.uid() reads). Every RLS policy resolves the caller's
-- tenants via public.current_user_nursery_ids() → nursery_members; owner_B
-- has no membership in nursery A, so a correct policy yields count = 0.
--
-- A deliberately-broken policy (e.g. `using (true)`) makes one of these
-- is(...) assertions fail, failing `supabase test db` and the CI gate
-- (story S8 AC#6). Transaction-wrapped (BEGIN/ROLLBACK) so it never
-- pollutes other test files or the local DB.

begin;

create extension if not exists pgtap with schema extensions;

select plan(19);

-- ---- fixtures (seeded as superuser; RLS bypassed) -----------------------
\set na '11111111-1111-1111-1111-111111111111'
\set nb '22222222-2222-2222-2222-222222222222'
\set ua 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
\set ub 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
\set ca 'cccccccc-cccc-cccc-cccc-cccccccccccc'

-- auth users (minimal — only id is needed by auth.uid())
insert into auth.users (id, email)
  values (:'ua', 'owner_a@test.local'), (:'ub', 'owner_b@test.local')
  on conflict (id) do nothing;

-- two nurseries + their owners
insert into public.nurseries (id, name) values
  (:'na', 'Nursery A (cross-tenant test)'),
  (:'nb', 'Nursery B (cross-tenant test)');
insert into public.nursery_members (nursery_id, user_id, role) values
  (:'na', :'ua', 'owner'),
  (:'nb', :'ub', 'owner');

-- one nursery-A row per tenant-scoped table
insert into public.customers (id, nursery_id, name, farm)
  values (:'ca', :'na', 'ลูกค้า A', 'ฟาร์ม A');
insert into public.scorecard_settings (nursery_id) values (:'na')
  on conflict (nursery_id) do nothing;
insert into public.notification_settings (nursery_id) values (:'na')
  on conflict (nursery_id) do nothing;
insert into public.nursery_brand (nursery_id, display_name_th, display_name_en)
  values (:'na', 'แบรนด์ A', 'Brand A')
  on conflict (nursery_id) do nothing;
insert into public.batches (id, nursery_id, source, date)
  values ('B-TEST-A', :'na', 'hatchery-a', current_date);
insert into public.pcr_results (batch_id, disease, status)
  values ('B-TEST-A', 'WSSV', 'clean');
insert into public.batch_buyers (batch_id, customer_id)
  values ('B-TEST-A', :'ca');
insert into public.alerts (nursery_id, sev, title)
  values (:'na', 'high', 'แจ้งเตือน A');
insert into public.customer_callbacks
    (nursery_id, customer_id, scheduled_for, channel, created_by)
  values (:'na', :'ca', now() + interval '1 day', 'line', :'ua');
insert into public.quotes (nursery_id, customer_id, items)
  values (:'na', :'ca', '[]'::jsonb);
insert into public.prices (nursery_id, size_label, unit_price)
  values (:'na', 'PL12', 0.25);
insert into public.line_outbound_events
    (nursery_id, customer_id, line_user_id, template, payload)
  values (:'na', :'ca', 'U_test_a', 'quote', '{}'::jsonb);
insert into public.team_invites
    (nursery_id, email, role, token, created_by)
  values (:'na', 'invitee_a@test.local', 'counter_staff', 'tok_a', :'ua');
insert into public.audit_log (nursery_id, action, user_id)
  values (:'na', 'test.seed', :'ua');
-- A6: LINE identity is keyed by user (not nursery); owner_A's identity row
-- must be invisible to owner_B (RLS: user_id = auth.uid(), no write policy).
insert into public.line_identities (user_id, line_sub, email_at_link, display_name)
  values (:'ua', 'Uline_test_a', 'owner_a@test.local', 'Owner A');

-- ---- authenticate as owner_B (no membership in nursery A) ---------------
set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', :'ub', 'role', 'authenticated')::text,
  true
);

-- ---- assertions: owner_B sees ZERO nursery-A rows, every table ----------
select is((select count(*) from public.nurseries where id = :'na')::int,
  0, 'owner_B cannot read nursery A row');
select is((select count(*) from public.nursery_members where nursery_id = :'na')::int,
  0, 'owner_B cannot read nursery A members');
select is((select count(*) from public.customers where nursery_id = :'na')::int,
  0, 'owner_B cannot read nursery A customers');
select is((select count(*) from public.scorecard_settings where nursery_id = :'na')::int,
  0, 'owner_B cannot read nursery A scorecard_settings');
select is((select count(*) from public.notification_settings where nursery_id = :'na')::int,
  0, 'owner_B cannot read nursery A notification_settings');
select is((select count(*) from public.nursery_brand where nursery_id = :'na')::int,
  0, 'owner_B cannot read nursery A nursery_brand');
select is((select count(*) from public.batches where nursery_id = :'na')::int,
  0, 'owner_B cannot read nursery A batches');
select is((select count(*) from public.pcr_results where batch_id = 'B-TEST-A')::int,
  0, 'owner_B cannot read nursery A pcr_results (FK via batches)');
select is((select count(*) from public.batch_buyers where batch_id = 'B-TEST-A')::int,
  0, 'owner_B cannot read nursery A batch_buyers (FK via batches)');
select is((select count(*) from public.alerts where nursery_id = :'na')::int,
  0, 'owner_B cannot read nursery A alerts');
select is((select count(*) from public.customer_callbacks where nursery_id = :'na')::int,
  0, 'owner_B cannot read nursery A customer_callbacks');
select is((select count(*) from public.quotes where nursery_id = :'na')::int,
  0, 'owner_B cannot read nursery A quotes');
select is((select count(*) from public.prices where nursery_id = :'na')::int,
  0, 'owner_B cannot read nursery A prices');
select is((select count(*) from public.line_outbound_events where nursery_id = :'na')::int,
  0, 'owner_B cannot read nursery A line_outbound_events');
select is((select count(*) from public.team_invites where nursery_id = :'na')::int,
  0, 'owner_B cannot read nursery A team_invites');
select is((select count(*) from public.audit_log where nursery_id = :'na')::int,
  0, 'owner_B cannot read nursery A audit_log');
select is((select count(*) from public.line_identities where user_id = :'ua')::int,
  0, 'owner_B cannot read owner_A line_identities (A6, user-keyed)');

-- sanity: owner_B authenticated as a real user, and a positive control —
-- owner_B CAN see its own nursery (proves the policy is not just deny-all
-- and the JWT identity wiring works).
insert into public.scorecard_settings (nursery_id) values (:'nb')
  on conflict (nursery_id) do nothing;
select is((select count(*) from public.nurseries where id = :'nb')::int,
  1, 'owner_B CAN read its own nursery B (positive control)');
select isnt(
  current_setting('request.jwt.claims', true), null,
  'JWT identity is set for the authenticated role');

select * from finish();

rollback;
