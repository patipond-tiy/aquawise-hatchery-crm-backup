const YEAR_MS = 365.25 * 24 * 3600 * 1000;

/**
 * Whole years between an ISO timestamp and a reference instant. Pure: the
 * `now` reference is passed in (callers capture it once, not via Date.now()
 * during render — react-hooks/purity). Returns null for missing/invalid
 * input so identity surfaces show "—" rather than a fabricated number.
 */
export function yearsSince(
  createdAt: string | null | undefined,
  now: number
): number | null {
  if (!createdAt) return null;
  const started = new Date(createdAt).getTime();
  if (Number.isNaN(started)) return null;
  return Math.max(0, Math.floor((now - started) / YEAR_MS));
}
