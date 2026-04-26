'use client';

import type { ReactNode } from 'react';
import { LeftRail } from './left-rail';
import { TopBar } from './top-bar';
import { RightRail } from './right-rail';
import { useSidebar } from '@/lib/store/sidebar';

const SIDEBAR_OPEN = 270;
const SIDEBAR_CLOSED = 72;

export function Shell({ children }: { children: ReactNode }) {
  const collapsed = useSidebar((s) => s.collapsed);
  const leftWidth = collapsed ? SIDEBAR_CLOSED : SIDEBAR_OPEN;

  return (
    <div
      style={{
        flex: '1 1 0%',
        display: 'grid',
        gridTemplateColumns: `${leftWidth}px 1fr 320px`,
        gridTemplateRows: '1fr',
        background: 'var(--color-app)',
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
        transition: 'grid-template-columns 0.18s ease',
      }}
    >
      <LeftRail />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <TopBar />
        <main
          className="aw3-rise aw3-scroll"
          style={{
            flex: '1 1 0%',
            minHeight: 0,
            overflowY: 'auto',
            padding: '20px 28px 40px',
          }}
        >
          {children}
        </main>
      </div>
      <RightRail />
    </div>
  );
}
