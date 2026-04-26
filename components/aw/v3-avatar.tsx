type V3AvatarProps = {
  name: string;
  size?: number;
  tone?: 'lav' | 'peach' | 'mint' | 'sky' | 'rose' | 'amber';
  ring?: number;
  className?: string;
};

const PALETTES: Record<NonNullable<V3AvatarProps['tone']>, [string, string]> = {
  lav: ['#A8C0E6', '#004AAD'],
  peach: ['#FFC8A8', '#C2542B'],
  mint: ['#A6E0BD', '#2B7A50'],
  sky: ['#A6C9F2', '#1F5BB8'],
  rose: ['#F5B5C8', '#B83767'],
  amber: ['#F0D78A', '#8C6900'],
};

const TONE_KEYS = Object.keys(PALETTES) as Array<keyof typeof PALETTES>;

export function V3Avatar({ name, size = 36, tone, ring, className }: V3AvatarProps) {
  const t = tone ?? TONE_KEYS[(name || '').charCodeAt(0) % TONE_KEYS.length];
  const [bg, fg] = PALETTES[t];
  const initial = (name || '?').trim()[0]?.toUpperCase() ?? '?';

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: fg,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: Math.round(size * 0.42),
        boxShadow: ring
          ? `0 0 0 3px #fff, 0 0 0 ${3 + ring}px var(--color-hero)`
          : 'none',
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}
