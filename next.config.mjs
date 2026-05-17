import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Story S4 AC#5 — HSTS in production only (no HTTPS in local dev). The
  // per-request CSP + nonce live in proxy.ts (§17); HSTS is a static header
  // so it belongs here. 2 years + includeSubDomains + preload.
  async headers() {
    if (process.env.NODE_ENV !== 'production') return [];
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
