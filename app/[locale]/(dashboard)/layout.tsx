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
      <TrialBanner />
      <Shell>{children}</Shell>
    </BillingGate>
  );
}
