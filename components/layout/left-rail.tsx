'use client';

import { useTranslations } from 'next-intl';
import { usePathname, Link } from '@/i18n/navigation';
import { V3Mark } from '@/components/aw/v3-mark';
import { Icon } from '@/components/aw/icon';

type NavItem = {
  id: string;
  href: '/' | '/customers' | '/batches' | '/restock' | '/alerts' | '/scorecard' | '/settings';
  labelKey:
    | 'dashboard'
    | 'customers'
    | 'batches'
    | 'restock'
    | 'alerts'
    | 'scorecard'
    | 'settings'
    | 'logout';
  icon:
    | 'home'
    | 'users'
    | 'box'
    | 'cycle'
    | 'alert'
    | 'badge'
    | 'gear'
    | 'out';
};

const OVERVIEW: NavItem[] = [
  { id: 'dashboard', href: '/', labelKey: 'dashboard', icon: 'home' },
  { id: 'customers', href: '/customers', labelKey: 'customers', icon: 'users' },
  { id: 'batches', href: '/batches', labelKey: 'batches', icon: 'box' },
  { id: 'restock', href: '/restock', labelKey: 'restock', icon: 'cycle' },
];

const DAILY: NavItem[] = [
  { id: 'alerts', href: '/alerts', labelKey: 'alerts', icon: 'alert' },
  { id: 'scorecard', href: '/scorecard', labelKey: 'scorecard', icon: 'badge' },
];

const SETTINGS: NavItem[] = [
  { id: 'settings', href: '/settings', labelKey: 'settings', icon: 'gear' },
];

export function LeftRail() {
  const t = useTranslations();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        className="flex items-center gap-3.5 px-4 py-3.5 rounded-[var(--radius)] min-h-[50px] text-left transition-colors duration-150"
        style={{
          background: active ? 'var(--color-hero-soft)' : 'transparent',
          color: active ? 'var(--color-hero)' : 'var(--color-ink)',
          fontWeight: active ? 700 : 600,
          fontSize: 16,
        }}
      >
        <Icon name={item.icon} size={22} />
        <span className="whitespace-nowrap">{t(`nav.${item.labelKey}`)}</span>
      </Link>
    );
  };

  return (
    <aside
      className="flex flex-col h-full p-6 px-3.5 border-r"
      style={{ borderColor: 'var(--color-line)' }}
    >
      <div className="flex items-center gap-2.5 px-2.5 pb-6">
        <V3Mark size={32} />
        <div>
          <div className="text-lg font-extrabold tracking-tight">
            {t('app.title')}
          </div>
          <div className="text-[10.5px] mt-[-2px] font-medium" style={{ color: 'var(--color-ink-4)' }}>
            ฟ้าใส แฮทเชอรี่
          </div>
        </div>
      </div>

      <NavGroup label={t('nav.groups.overview')}>
        {OVERVIEW.map((n) => (
          <NavLink key={n.id} item={n} />
        ))}
      </NavGroup>

      <NavGroup label={t('nav.groups.daily')}>
        {DAILY.map((n) => (
          <NavLink key={n.id} item={n} />
        ))}
      </NavGroup>

      <div className="flex-1" />

      <NavGroup label={t('nav.groups.settings')}>
        {SETTINGS.map((n) => (
          <NavLink key={n.id} item={n} />
        ))}
        <button
          type="button"
          className="flex items-center gap-3.5 px-4 py-3.5 rounded-[var(--radius)] min-h-[50px] text-left bg-transparent border-0 cursor-pointer font-semibold text-base"
          style={{ color: 'var(--color-ink)' }}
        >
          <Icon name="out" size={22} />
          <span className="whitespace-nowrap">{t('nav.logout')}</span>
        </button>
      </NavGroup>
    </aside>
  );
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-[18px]">
      <div className="eyebrow px-3.5 mb-1.5">{label}</div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}
