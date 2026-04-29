-- Add package interest field collected during customer onboarding modal.
-- Nullable: existing rows retain null; field is informational only.
alter table public.customers
  add column if not exists package_interest text;
