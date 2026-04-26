'use client';

type Direction = 'right' | 'left' | 'up' | 'down';
type Tone = 'soft' | 'soft-2' | 'hero';

type V3RoundBtnProps = {
  onClick?: () => void;
  dir?: Direction;
  size?: number;
  tone?: Tone;
};

const ROTATIONS: Record<Direction, number> = {
  right: 0,
  left: 180,
  up: 270,
  down: 90,
};

export function V3RoundBtn({
  onClick,
  dir = 'right',
  size = 40,
  tone = 'soft',
}: V3RoundBtnProps) {
  const r = ROTATIONS[dir];
  const bg =
    tone === 'hero'
      ? 'var(--color-hero)'
      : tone === 'soft'
        ? 'var(--color-soft)'
        : 'var(--color-soft-2)';
  const fg = tone === 'hero' ? '#fff' : 'var(--color-ink)';

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: fg,
        border: 0,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
      }}
    >
      <svg
        width={14}
        height={14}
        viewBox="0 0 16 16"
        style={{ transform: `rotate(${r}deg)` }}
      >
        <path
          d="M3 8h10M9 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
