import { useTranslations } from 'next-intl';
import { V3Chip } from './v3-chip';

export function StubPage({ title }: { title: string }) {
  const t = useTranslations('stub');
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <h1
          className="m-0 text-[28px] font-extrabold"
          style={{ letterSpacing: '-0.01em' }}
        >
          {title}
        </h1>
        <V3Chip tone="amber" size="sm">
          {t('coming_soon')}
        </V3Chip>
      </div>
      <p
        className="text-[15px] mt-1 mb-7"
        style={{ color: 'var(--color-ink-3)' }}
      >
        {t('page_under_construction')}
      </p>

      <div
        className="aw3-card p-9 flex items-center justify-center"
        style={{
          minHeight: 320,
          border: '1.5px dashed var(--color-line-2)',
          background: 'var(--color-soft)',
        }}
      >
        <div className="text-center">
          <div className="text-5xl mb-3">🐚</div>
          <div className="text-sm font-semibold" style={{ color: 'var(--color-ink-4)' }}>
            Phase 2 will land this page
          </div>
        </div>
      </div>
    </div>
  );
}
