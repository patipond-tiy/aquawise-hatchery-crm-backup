// Epic K K2 — shared batch resolution + serialization. Used by the read
// endpoint. Contract §5: status ladder (404 unknown / 404 unpublished — no
// draft leak / 410 expired / 409 claimed_by_other) and the BatchReadResponse
// wire shape (vendored @aquawise/core contract-types — the FROZEN wire field
// names are `hatchery_*`; the line-bot consumes exactly these).

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import type { BatchReadResponse } from '@/lib/aquawise-core/contract-types';
import { getSignedPcrCertUrl } from '@/lib/supabase/storage';

export type BatchResolution =
  | { kind: 'ok'; body: BatchReadResponse }
  | { kind: 'not_found' }
  | { kind: 'expired'; expiredAt: string }
  | { kind: 'claimed_by_other' };

type Db = SupabaseClient<Database>;

interface NurseryContactSnapshot {
  line_oa_id?: string | null;
  contact_phone_public?: string | null;
  nursery_name_th?: string | null;
}

function iso(v: string | null): string | null {
  return v ? new Date(v).toISOString() : null;
}

/**
 * Resolve a batch by code for the read/claim consumer.
 * @param requesterLineUserId — when provided (claim pre-check / read with a
 *   bound user) drives the 409 `claimed_by_other` rule: the code is already
 *   claimed by a DIFFERENT line_user_id. Read API passes undefined → only the
 *   `claimed_by_other` boolean is surfaced, never a 409 (contract §5: 409 is a
 *   claim-time outcome; the read response carries the boolean flag).
 */
export async function resolveBatchForRead(
  supabase: Db,
  code: string
): Promise<BatchResolution> {
  const { data: batch } = await supabase
    .from('batches')
    .select(
      'id, nursery_id, batch_code, species, source, pcr, valid_until, published_at, first_claimed_at, nursery_contact_snapshot'
    )
    .eq('batch_code', code)
    .maybeSingle();

  // Unknown OR unpublished → identical 404 (no draft-state leak, contract §5).
  if (!batch || batch.published_at === null) {
    return { kind: 'not_found' };
  }

  if (batch.valid_until && new Date(batch.valid_until) <= new Date()) {
    return {
      kind: 'expired',
      expiredAt: new Date(batch.valid_until).toISOString(),
    };
  }

  // pcr_results rows (per-disease). Shape into a map keyed by disease.
  const { data: pcrRows } = await supabase
    .from('pcr_results')
    .select('disease, status, lab, tested_on')
    .eq('batch_id', batch.id);

  const pcr: Record<string, unknown> = {};
  for (const r of pcrRows ?? []) {
    pcr[r.disease] = {
      status: r.status,
      lab: r.lab,
      tested_on: r.tested_on,
    };
  }

  // claimed_by_other flag: any claim row exists for this batch.
  const { count: claimCount } = await supabase
    .from('batch_claims')
    .select('*', { count: 'exact', head: true })
    .eq('batch_id', batch.id);

  const snap = (batch.nursery_contact_snapshot ??
    null) as NurseryContactSnapshot | null;

  // Frozen contact snapshot (set at first publish). Fall back to live nursery
  // row only if the snapshot is absent (legacy/unpublished-then-published).
  let contact: { line_oa_id: string; phone: string } | null = null;
  let nurseryName = snap?.nursery_name_th ?? '';
  if (snap && (snap.line_oa_id || snap.contact_phone_public)) {
    contact = {
      line_oa_id: snap.line_oa_id ?? '',
      phone: snap.contact_phone_public ?? '',
    };
  }
  if (!nurseryName) {
    const { data: n } = await supabase
      .from('nurseries')
      .select('name, line_oa_id, contact_phone_public')
      .eq('id', batch.nursery_id)
      .maybeSingle();
    nurseryName = n?.name ?? '';
    if (!contact && n && (n.line_oa_id || n.contact_phone_public)) {
      contact = {
        line_oa_id: n.line_oa_id ?? '',
        phone: n.contact_phone_public ?? '',
      };
    }
  }

  const certUrl = await getSignedPcrCertUrl(batch.id);

  const body: BatchReadResponse & { pcr_certificate_url: string | null } = {
    batch_code: batch.batch_code,
    hatchery_id: batch.nursery_id,
    hatchery_name: nurseryName,
    hatchery_contact: contact,
    species: batch.species,
    pl_grade: batch.source,
    pcr: { ...pcr, summary: batch.pcr },
    pcr_certificate_url: certUrl,
    valid_until: iso(batch.valid_until) ?? '',
    first_claimed_at: iso(batch.first_claimed_at),
    claimed_by_other: (claimCount ?? 0) > 0,
  };

  return { kind: 'ok', body };
}
