type IconName =
  | 'home'
  | 'users'
  | 'box'
  | 'cycle'
  | 'alert'
  | 'badge'
  | 'gear'
  | 'out'
  | 'search'
  | 'mail'
  | 'profile'
  | 'arrow-right';

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
};

export function Icon({ name, size = 22, color = 'currentColor', className }: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 20 20',
    fill: 'none' as const,
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  };

  switch (name) {
    case 'home':
      return (
        <svg {...props}>
          <path d="M3 9l7-6 7 6v8a1 1 0 01-1 1h-3v-5H7v5H4a1 1 0 01-1-1V9z" />
        </svg>
      );
    case 'users':
      return (
        <svg {...props}>
          <circle cx="7" cy="7" r="3" />
          <path d="M2 17c0-3 2-5 5-5s5 2 5 5" />
          <circle cx="14" cy="6" r="2.5" />
          <path d="M13 12c2 0 5 1.5 5 5" />
        </svg>
      );
    case 'box':
      return (
        <svg {...props}>
          <path d="M3 6l7-3 7 3v8l-7 3-7-3V6z" />
          <path d="M3 6l7 3 7-3M10 9v9" />
        </svg>
      );
    case 'cycle':
      return (
        <svg {...props}>
          <path d="M3 10a7 7 0 0112-5l2 2" />
          <path d="M17 4v3h-3" />
          <path d="M17 10a7 7 0 01-12 5l-2-2" />
          <path d="M3 16v-3h3" />
        </svg>
      );
    case 'alert':
      return (
        <svg {...props}>
          <path d="M10 3l8 14H2L10 3z" />
          <path d="M10 8v4M10 14h.01" />
        </svg>
      );
    case 'badge':
      return (
        <svg {...props}>
          <path d="M10 2l2.4 4.6 5.1.7-3.7 3.6.9 5.1L10 13.6l-4.6 2.4.9-5.1L2.5 7.3l5.1-.7L10 2z" />
        </svg>
      );
    case 'gear':
      return (
        <svg {...props}>
          <circle cx="10" cy="10" r="3" />
          <path d="M10 1v3M10 16v3M19 10h-3M4 10H1M16.4 3.6l-2.1 2.1M5.7 14.3l-2.1 2.1M16.4 16.4l-2.1-2.1M5.7 5.7L3.6 3.6" />
        </svg>
      );
    case 'out':
      return (
        <svg {...props}>
          <path d="M8 3H4a1 1 0 00-1 1v12a1 1 0 001 1h4M13 14l4-4-4-4M17 10H7" />
        </svg>
      );
    case 'search':
      return (
        <svg {...props}>
          <circle cx="9" cy="9" r="6" />
          <path d="M14 14l4 4" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...props}>
          <path d="M3 6l7 5 7-5M3 6v9a1 1 0 001 1h12a1 1 0 001-1V6M3 6l7-3 7 3" />
        </svg>
      );
    case 'profile':
      return (
        <svg {...props}>
          <path d="M10 11a3 3 0 100-6 3 3 0 000 6zM4 17c0-3 2.5-5 6-5s6 2 6 5" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...props} viewBox="0 0 16 16">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      );
    default:
      return null;
  }
}
