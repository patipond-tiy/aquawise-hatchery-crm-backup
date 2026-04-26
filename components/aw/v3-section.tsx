import type { ReactNode, CSSProperties } from 'react';

type V3SectionProps = {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
};

export function V3Section({ title, action, children, style }: V3SectionProps) {
  return (
    <section style={{ marginBottom: 28, ...style }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
