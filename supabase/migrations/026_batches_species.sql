-- WS4 Epic K — K6: add batches.species. Conforms to
-- K-INTEGRATION-CONTRACT.md §5/§8 (gap row 2). Required by line-bot K13
-- repurchase-threshold logic (vannamei vs monodon harvest windows differ).
--
-- Migration band 026 (025 = K1/K3). Strictly additive. DEFAULT 'vannamei'
-- back-fills the existing seed/prod set (dominant Thai species). RLS on
-- batches (002_rls.sql) covers the new column — no policy change.

alter table public.batches
  add column if not exists species text not null default 'vannamei';

alter table public.batches
  add constraint batches_species_chk
  check (species in ('vannamei','monodon'));
