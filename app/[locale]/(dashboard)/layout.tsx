import { Shell } from '@/components/layout/shell';
import { TrialBanner } from '@/components/layout/trial-banner';
import { BillingGate } from './billing-gate';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <BillingGate locale={locale}>
      <div
        style={{
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-app)',
        }}
      >
        <TrialBanner />
        <div
          style={{
            flex: '1 1 0%',
            minHeight: 0,
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          <Shell>{children}</Shell>
        </div>
      </div>
    </BillingGate>
  );
}
