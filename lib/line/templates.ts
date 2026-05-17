/**
 * G3p — LINE Flex template registry (CRM side).
 *
 * The CRM only constructs and enqueues `line_outbound_events`; the bot worker
 * (separate repo, `aquawise-line-bot`) renders the actual Flex JSON. This file
 * is the single source of truth for the template enum + per-template payload
 * shape, validated before insert so a malformed payload never reaches the
 * queue.
 */

export const LINE_TEMPLATES = [
  'restock_reminder',
  'harvest_window',
  'new_batch_announcement',
  'quote',
  'pcr_certificate',
  'disease_alert',
  'custom_note',
  // chat_nudge is scaffolded but MUST NOT be enqueued in H1 — it needs a
  // thread_id from the LIFF inbox which is deferred to G3 (H3).
  'chat_nudge',
] as const;

export type LineTemplate = (typeof LINE_TEMPLATES)[number];

/** Templates a rep may pick from the one-off send modal (G2). */
export const MANUAL_TEMPLATES: LineTemplate[] = [
  'restock_reminder',
  'new_batch_announcement',
  'custom_note',
];

/** Templates that are enqueued by automated paths (cron G4 / alerts E4). */
export const AUTOMATED_TEMPLATES: LineTemplate[] = [
  'restock_reminder',
  'harvest_window',
  'disease_alert',
];

export function isLineTemplate(v: unknown): v is LineTemplate {
  return typeof v === 'string' && (LINE_TEMPLATES as readonly string[]).includes(v);
}

export type LinePayload = Record<string, unknown> & {
  nursery_id: string;
  customer_id: string;
};

/**
 * Validate a payload for a given template. Returns an error string when the
 * payload is malformed, or null when valid. Kept intentionally lightweight —
 * the bot worker does the rich rendering; here we only guard the queue.
 */
export function validatePayload(
  template: LineTemplate,
  payload: unknown
): string | null {
  if (template === 'chat_nudge') {
    return 'chat_nudge is not enqueueable in H1 (LIFF inbox deferred to G3)';
  }
  if (!payload || typeof payload !== 'object') {
    return 'payload must be an object';
  }
  const p = payload as Record<string, unknown>;
  if (typeof p.nursery_id !== 'string' || !p.nursery_id) {
    return 'payload.nursery_id is required';
  }
  if (typeof p.customer_id !== 'string' || !p.customer_id) {
    return 'payload.customer_id is required';
  }

  switch (template) {
    case 'restock_reminder':
      if (typeof p.cycle_id !== 'string' || !p.cycle_id) {
        return 'restock_reminder requires cycle_id (idempotency key)';
      }
      return null;
    case 'harvest_window':
      if (typeof p.cycle_id !== 'string' || !p.cycle_id) {
        return 'harvest_window requires cycle_id (idempotency key)';
      }
      if (typeof p.harvest_date !== 'string') {
        return 'harvest_window requires harvest_date';
      }
      return null;
    case 'new_batch_announcement':
      if (typeof p.batch_id !== 'string' || !p.batch_id) {
        return 'new_batch_announcement requires batch_id';
      }
      return null;
    case 'quote':
      if (typeof p.quote_id !== 'string' || !p.quote_id) {
        return 'quote requires quote_id';
      }
      return null;
    case 'pcr_certificate':
      if (typeof p.batch_id !== 'string' || !p.batch_id) {
        return 'pcr_certificate requires batch_id';
      }
      return null;
    case 'disease_alert':
      if (typeof p.alert_id !== 'string' || !p.alert_id) {
        return 'disease_alert requires alert_id (idempotency key)';
      }
      return null;
    case 'custom_note': {
      const note = p.note;
      if (typeof note !== 'string' || note.trim().length === 0) {
        return 'custom_note requires a non-empty note';
      }
      if (note.length > 300) {
        return 'custom_note must be 300 characters or fewer';
      }
      return null;
    }
    default:
      return `unknown template: ${template}`;
  }
}
