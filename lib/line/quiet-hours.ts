/**
 * H4 — quiet-hours time math. Times are stored as TIME (no tz) in the DB and
 * always interpreted as ICT (UTC+7). Pure functions, unit-tested.
 */

const ICT_OFFSET_MS = 7 * 3600 * 1000;

/** Current wall-clock "HH:MM" in ICT for a given instant (default: now). */
export function nowInICT(at: Date = new Date()): string {
  const d = new Date(at.getTime() + ICT_OFFSET_MS);
  return d.toISOString().substring(11, 16);
}

/** Normalise a Postgres TIME ('21:00:00' / '21:00') to "HH:MM". */
function hhmm(t: string): string {
  return t.substring(0, 5);
}

/**
 * Is `now` (HH:MM, ICT) inside the quiet window [start, end)? Handles the
 * overnight wrap (e.g. 21:00–07:00 spans midnight).
 */
export function isInQuietHours(
  now: string,
  start: string,
  end: string
): boolean {
  const n = now.substring(0, 5);
  const s = hhmm(start);
  const e = hhmm(end);
  if (s === e) return false; // zero-width window → never quiet
  if (s > e) {
    // overnight window
    return n >= s || n < e;
  }
  return n >= s && n < e;
}

/**
 * The next window-open instant (UTC) for a quiet window that ends at `end`
 * (ICT). Used to set `line_outbound_events.scheduled_for` when an event is
 * deferred.
 */
export function nextWindowOpenUTC(end: string, at: Date = new Date()): Date {
  const [h, m] = hhmm(end).split(':').map(Number);
  // Build "today at <end> ICT" expressed in UTC.
  const ictNow = new Date(at.getTime() + ICT_OFFSET_MS);
  const openIct = new Date(
    Date.UTC(
      ictNow.getUTCFullYear(),
      ictNow.getUTCMonth(),
      ictNow.getUTCDate(),
      h,
      m,
      0,
      0
    )
  );
  let openUtc = new Date(openIct.getTime() - ICT_OFFSET_MS);
  if (openUtc.getTime() <= at.getTime()) {
    openUtc = new Date(openUtc.getTime() + 24 * 3600 * 1000);
  }
  return openUtc;
}
