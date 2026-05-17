import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Regression guard for the mock→prod identity fix: the top-bar and right-rail
// must render the REAL authenticated user supplied by getCurrentUser(), never
// a hardcoded "สุเทพ" literal. We seed the query cache with a distinctive
// name and assert it renders (and that the old literal does NOT).

const DISTINCTIVE_NAME = 'ทดสอบ ชื่อจริงเฉพาะ';
const OLD_LITERAL = 'สุเทพ';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, vars?: Record<string, string>) =>
    vars?.name ? `สวัสดี ${vars.name}` : key,
}));

vi.mock('@/lib/store/sidebar', () => ({
  useSidebar: (sel: (s: { collapsed: boolean; toggle: () => void }) => unknown) =>
    sel({ collapsed: false, toggle: () => {} }),
}));

vi.mock('@/lib/api', () => ({
  getCurrentUser: vi.fn(async () => ({
    id: 'u1',
    displayName: DISTINCTIVE_NAME,
    email: 'real@example.com',
    role: 'owner' as const,
  })),
  getNursery: vi.fn(async () => ({
    name: 'โรงอนุบาลของจริง',
    nameEn: 'Real Nursery',
    location: 'จังหวัดทดสอบ',
    locationEn: 'Test',
    restockThresholds: { now: 0, week: 14, month: 45 },
    createdAt: '2019-01-01T00:00:00.000Z',
  })),
  listCustomers: vi.fn(async () => []),
  listBatches: vi.fn(async () => []),
  listTeam: vi.fn(async () => [
    { name: 'สมาชิกจริง หนึ่ง', role: 'หัวหน้า', perm: 'owner' as const },
  ]),
}));

import { TopBar } from '@/components/layout/top-bar';
import { RightRail } from '@/components/layout/right-rail';

function withClient(node: ReactNode) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>{node}</QueryClientProvider>
  );
}

describe('identity surfaces render the real user, not a literal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('TopBar shows the real getCurrentUser displayName', async () => {
    withClient(<TopBar />);
    expect(await screen.findByText(DISTINCTIVE_NAME)).toBeInTheDocument();
    expect(screen.queryByText(OLD_LITERAL)).not.toBeInTheDocument();
    expect(screen.queryByText(`คุณ${OLD_LITERAL}`)).not.toBeInTheDocument();
  });

  it('RightRail greets the real user and lists the real team', async () => {
    withClient(<RightRail />);
    expect(
      await screen.findByText(`สวัสดี ${DISTINCTIVE_NAME}`)
    ).toBeInTheDocument();
    expect(await screen.findByText('สมาชิกจริง หนึ่ง')).toBeInTheDocument();
    expect(screen.queryByText(`สวัสดี ${OLD_LITERAL}`)).not.toBeInTheDocument();
  });
});
