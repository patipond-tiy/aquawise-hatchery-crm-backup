'use client';

import type { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

type V3CardProps = {
  children: ReactNode;
  pad?: number;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  accent?: string;
};

export function V3Card({
  children,
  pad = 24,
  style,
  className,
  onClick,
  hover,
  accent,
}: V3CardProps) {
  const interactive = !!onClick || !!hover;
  return (
    <div
      onClick={onClick}
      className={cn('aw3-card', interactive && 'aw3-row', className)}
      style={{
        padding: pad,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {accent && (
        <div
          style={{
            height: 4,
            borderRadius: 'var(--radius-sm)',
            background: accent,
            marginBottom: 16,
          }}
        />
      )}
      {children}
    </div>
  );
}
