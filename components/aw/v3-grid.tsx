import type { ReactNode, CSSProperties } from 'react';

type V3GridProps = {
  cols?: number;
  gap?: number;
  children: ReactNode;
  style?: CSSProperties;
};

export function V3Grid({ cols = 12, gap = 20, children, style }: V3GridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type V3ColProps = {
  span?: number;
  children: ReactNode;
  style?: CSSProperties;
};

export function V3Col({ span = 12, children, style }: V3ColProps) {
  return (
    <div
      style={{ gridColumn: `span ${span}`, minWidth: 0, ...style }}
    >
      {children}
    </div>
  );
}
