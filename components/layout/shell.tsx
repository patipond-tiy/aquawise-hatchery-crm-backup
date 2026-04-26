import type { ReactNode } from 'react';
import { LeftRail } from './left-rail';
import { TopBar } from './top-bar';
import { RightRail } from './right-rail';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen p-5"
      style={{ background: 'var(--color-canvas)' }}
    >
      <div
        className="grid overflow-hidden"
        style={{
          background: 'var(--color-app)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 4px 24px rgba(20,19,31,0.06)',
          gridTemplateColumns: '270px 1fr 320px',
          minHeight: 'calc(100vh - 40px)',
        }}
      >
        <LeftRail />
        <div className="flex flex-col min-h-0">
          <TopBar />
          <main className="aw3-rise flex-1 px-7 pt-5 pb-10">{children}</main>
        </div>
        <RightRail />
      </div>
    </div>
  );
}
