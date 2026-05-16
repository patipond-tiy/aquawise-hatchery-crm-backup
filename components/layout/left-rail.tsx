'use client';

import { useTranslations } from 'next-intl';
import { usePathname, Link } from '@/i18n/navigation';
import { V3Mark } from '@/components/aw/v3-mark';
import { Icon } from '@/components/aw/icon';
import { LogoutButton } from '@/components/layout/logout-button';
import { useSidebar } from '@/lib/store/sidebar';

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
  const collapsed = useSidebar((s) => s.collapsed);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        title={collapsed ? t(`nav.${item.labelKey}`) : undefined}
        className="flex items-center rounded-[var(--radius)] min-h-[50px] transition-colors duration-150"
        style={{
          background: active ? 'var(--color-hero-soft)' : 'transparent',
          color: active ? 'var(--color-hero)' : 'var(--color-ink)',
          fontWeight: active ? 700 : 600,
          fontSize: 16,
          gap: collapsed ? 0 : 14,
          padding: collapsed ? '14px 0' : '14px 16px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          textAlign: 'left',
        }}
      >
        <Icon name={item.icon} size={22} />
        {!collapsed && (
          <span className="whitespace-nowrap">{t(`nav.${item.labelKey}`)}</span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className="border-r"
      style={{
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: collapsed ? '24px 10px' : '24px 14px',
        borderColor: 'var(--color-line)',
        transition: 'padding 0.18s ease',
      }}
    >
      {/* Logo header — toggle lives in the TopBar so the title has full width */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: collapsed ? '0 0 24px' : '0 10px 24px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <V3Mark size={32} />
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="font-extrabold tracking-tight"
              style={{
                fontSize: 17,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {t('app.title')}
            </div>
            <div
              className="mt-[-2px] font-medium"
              style={{
                fontSize: 10.5,
                color: 'var(--color-ink-4)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              ฟ้าใส แฮทเชอรี่
            </div>
          </div>
        )}
      </div>

      {/* Top groups */}
      <div style={{ flexShrink: 0 }}>
        <NavGroup label={t('nav.groups.overview')} hideLabel={collapsed}>
          {OVERVIEW.map((n) => (
            <NavLink key={n.id} item={n} />
          ))}
        </NavGroup>

        <NavGroup label={t('nav.groups.daily')} hideLabel={collapsed}>
          {DAILY.map((n) => (
            <NavLink key={n.id} item={n} />
          ))}
        </NavGroup>
      </div>

      {/* Spacer pushes the settings group to the bottom */}
      <div style={{ flex: '1 1 0%', minHeight: 0 }} />

      {/* Settings group — pinned to the bottom */}
      <div style={{ flexShrink: 0 }}>
        <NavGroup label={t('nav.groups.settings')} hideLabel={collapsed}>
          {SETTINGS.map((n) => (
            <NavLink key={n.id} item={n} />
          ))}
          <LogoutButton collapsed={collapsed} label={t('nav.logout')} />
        </NavGroup>
      </div>
    </aside>
  );
}

function NavGroup({
  label,
  hideLabel,
  children,
}: {
  label: string;
  hideLabel: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[18px]">
      {!hideLabel && (
        <div className="eyebrow px-3.5 mb-1.5">{label}</div>
      )}
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}
