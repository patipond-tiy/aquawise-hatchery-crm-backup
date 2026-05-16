<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# tests/settings

## Purpose
Tests for the settings profile-update server action.

## Key Files

| File | Description |
|------|-------------|
| `profile.test.ts` | `updateProfile` (`app/[locale]/(dashboard)/settings/actions.ts`): rejects an invalid logo MIME type; accepts a profile update with no logo; includes `logo_url` in the brand upsert when the logo upload succeeds |

## For AI Agents

### Working In This Directory
- Logo upload targets the `nursery-logos` storage bucket (migration `012_storage_logos.sql`, helper `lib/supabase/storage.ts`). MIME validation happens before upload — keep the reject-path covered.
- This tests the **server action** (`'use server'`), not a client form — exercise it via the mock facade.

### Testing Requirements
- Must pass under `pnpm test`. Mock Supabase storage; no live uploads.

### Common Patterns
- Happy path + invalid-MIME reject + logo-success-includes-url are the three guarded behaviors.

## Dependencies

### Internal
- `app/[locale]/(dashboard)/settings/actions`, `@/lib/supabase/storage` (mocked)

### External
- `vitest`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
