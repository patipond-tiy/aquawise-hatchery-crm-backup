import type { ReactNode } from 'react';

type Tone =
  | 'lav'
  | 'peach'
  | 'mint'
  | 'sky'
  | 'rose'
  | 'amber'
  | 'soft'
  | 'good'
  | 'bad'
  | 'warn'
  | 'solid';

const TONES: Record<Tone, { bg: string; fg: string }> = {
  lav: { bg: 'var(--color-lav)', fg: 'var(--color-lav-fg)' },
  peach: { bg: 'var(--color-peach)', fg: 'var(--color-peach-fg)' },
  mint: { bg: 'var(--color-mint)', fg: 'var(--color-mint-fg)' },
  sky: { bg: 'var(--color-sky)', fg: 'var(--color-sky-fg)' },
  rose: { bg: 'var(--color-rose)', fg: 'var(--color-rose-fg)' },
  amber: { bg: 'var(--color-amber)', fg: 'var(--color-amber-fg)' },
  soft: { bg: 'var(--color-soft)', fg: 'var(--color-ink-2)' },
  good: { bg: 'var(--color-good-tint)', fg: 'var(--color-good)' },
  bad: { bg: 'var(--color-bad-tint)', fg: 'var(--color-bad)' },
  warn: { bg: 'var(--color-warn-tint)', fg: 'var(--color-warn)' },
  solid: { bg: 'var(--color-ink)', fg: '#fff' },
};

type V3ChipProps = {
  children: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  size?: 'xs' | 'sm';
};

export function V3Chip({ children, tone = 'lav', icon, size = 'sm' }: V3ChipProps) {
  const t = TONES[tone];
  const s = size === 'xs' ? { fs: 11, py: 4, px: 9 } : { fs: 12, py: 5, px: 11 };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: `${s.py}px ${s.px}px`,
        background: t.bg,
        color: t.fg,
        fontFamily: 'inherit',
        fontSize: s.fs,
        fontWeight: 600,
        borderRadius: 'var(--radius-pill)',
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}
    >
      {icon && <span style={{ fontSize: s.fs - 1, opacity: 0.8 }}>{icon}</span>}
      {children}
    </span>
  );
}
