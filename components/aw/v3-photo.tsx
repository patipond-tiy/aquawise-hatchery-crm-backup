type Tone = 'lav' | 'peach' | 'mint' | 'sky' | 'rose' | 'amber';

type V3PhotoProps = {
  tone?: Tone;
  height?: number;
  label?: string;
};

const TONES: Record<Tone, [string, string]> = {
  lav: ['#1A66C7', '#A8C0E6'],
  peach: ['#FF8E5A', '#FFC8A8'],
  mint: ['#3F9B6C', '#A6E0BD'],
  sky: ['#3578CC', '#A6C9F2'],
  rose: ['#D04B7B', '#F5B5C8'],
  amber: ['#C29A1F', '#F0D78A'],
};

export function V3Photo({ tone = 'lav', height = 140, label }: V3PhotoProps) {
  const [a, b] = TONES[tone];
  return (
    <div
      style={{
        height,
        borderRadius: 'var(--radius)',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${a}, ${b})`,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 140"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0 }}
      >
        <circle cx="40" cy="100" r="50" fill="rgba(255,255,255,0.15)" />
        <circle cx="160" cy="40" r="36" fill="rgba(255,255,255,0.12)" />
        <path
          d="M0 110 Q 50 80, 100 100 T 200 95 V140 H0 Z"
          fill="rgba(255,255,255,0.18)"
        />
      </svg>
      {label && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 12,
            background: 'rgba(255,255,255,0.92)',
            color: 'var(--color-ink)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-pill)',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
