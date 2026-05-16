import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Plus_Jakarta_Sans, Noto_Sans_Thai, JetBrains_Mono } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { Providers } from '@/components/providers';
import { ComingSoon } from '@/components/coming-soon';
import '../globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const noto = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-noto-thai',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AquaWise Nursery',
  description:
    'Nursery management for Southeast Asian shrimp & fish farms — track customers, batches, and disease alerts.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${jakarta.variable} ${noto.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body
        style={{
          fontFamily:
            locale === 'th'
              ? "var(--font-noto-thai), var(--font-jakarta), system-ui, sans-serif"
              : "var(--font-jakarta), var(--font-noto-thai), system-ui, sans-serif",
        }}
      >
        <NextIntlClientProvider>
          {locale === 'en' ? (
            <ComingSoon />
          ) : (
            <Providers>{children}</Providers>
          )}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
