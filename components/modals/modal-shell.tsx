'use client';

import type { ReactNode } from 'react';
import { useModal } from '@/lib/store/modal';

type ModalShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function ModalShell({
  title,
  subtitle,
  children,
  footer,
}: ModalShellProps) {
  const close = useModal((s) => s.close);
  return (
    <div>
      <div
        style={{
          padding: '24px 28px 16px',
          borderBottom: '1px solid var(--color-line)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--color-ink-3)',
                  marginTop: 4,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="ปิด"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--color-soft)',
              border: 0,
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
              color: 'var(--color-ink-3)',
            }}
          >
            ×
          </button>
        </div>
      </div>
      <div style={{ padding: '20px 28px' }}>{children}</div>
      {footer && (
        <div
          style={{
            padding: '14px 28px 20px',
            borderTop: '1px solid var(--color-line)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, hint, children }: FieldProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--color-ink-3)',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <div
          style={{
            fontSize: 11.5,
            color: 'var(--color-ink-4)',
            marginTop: 4,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

type ToggleProps = {
  on: boolean;
  onChange: (next: boolean) => void;
  size?: 'sm' | 'md';
};

export function Toggle({ on, onChange, size = 'md' }: ToggleProps) {
  const dim =
    size === 'sm'
      ? { w: 44, h: 26, k: 20 }
      : { w: 48, h: 28, k: 22 };
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      aria-pressed={on}
      style={{
        width: dim.w,
        height: dim.h,
        borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--color-hero)' : 'var(--color-line-2)',
        border: 0,
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: on ? dim.w - dim.k - 3 : 3,
          width: dim.k,
          height: dim.k,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.15s',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  );
}
