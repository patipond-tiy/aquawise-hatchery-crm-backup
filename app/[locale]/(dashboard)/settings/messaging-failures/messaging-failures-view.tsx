'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { V3Card } from '@/components/aw/v3-card';
import type { DeadEvent } from '@/lib/api/server-reads';
import {
  retryDeadEvent,
  editAndRetryEvent,
  resolveDeadEvent,
  retryDeadEventsBulk,
} from './actions';

function fmtThaiDate(iso: string): string {
  // ICT display — formatted as Thai date.
  return new Date(iso).toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function MessagingFailuresView({
  initialEvents,
}: {
  initialEvents: DeadEvent[];
}) {
  const t = useTranslations();
  const router = useRouter();
  const [events, setEvents] = useState<DeadEvent[]>(initialEvents);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<DeadEvent | null>(null);
  const [editText, setEditText] = useState('');
  const [pending, startTransition] = useTransition();

  const remove = (id: string) =>
    setEvents((prev) => prev.filter((e) => e.id !== id));

  const onRetry = (id: string) =>
    startTransition(async () => {
      const r = await retryDeadEvent(id);
      if (r.ok) {
        toast.success(t('settings.messagingFailures.retry_success'));
        remove(id);
      } else {
        toast.error(t('settings.messagingFailures.error'));
      }
    });

  const onResolve = (id: string) =>
    startTransition(async () => {
      const r = await resolveDeadEvent(id);
      if (r.ok) {
        toast.success(t('settings.messagingFailures.resolve_success'));
        remove(id);
      } else {
        toast.error(t('settings.messagingFailures.error'));
      }
    });

  const onEditSave = () =>
    startTransition(async () => {
      if (!editing) return;
      const r = await editAndRetryEvent(editing.id, editText);
      if (r.ok) {
        toast.success(t('settings.messagingFailures.retry_success'));
        remove(editing.id);
        setEditing(null);
      } else {
        toast.error(
          r.error === 'invalid_json'
            ? t('settings.messagingFailures.invalid_json')
            : t('settings.messagingFailures.error')
        );
      }
    });

  const onBulkRetry = () =>
    startTransition(async () => {
      const ids = [...selected];
      const r = await retryDeadEventsBulk(ids);
      if (r.ok) {
        toast.success(t('settings.messagingFailures.retry_success'));
        setEvents((prev) => prev.filter((e) => !selected.has(e.id)));
        setSelected(new Set());
      } else {
        toast.error(t('settings.messagingFailures.error'));
      }
    });

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>
        {t('settings.messagingFailures.title')}
      </h1>
      <div
        style={{
          color: 'var(--color-ink-3)',
          fontSize: 14,
          marginTop: 4,
          marginBottom: 20,
        }}
      >
        {t('settings.messagingFailures.subtitle')}
      </div>

      {selected.size > 0 && (
        <button
          type="button"
          className="aw3-btn aw3-btn-soft"
          disabled={pending}
          onClick={() => {
            if (
              window.confirm(
                t('settings.messagingFailures.confirm_bulk_retry', {
                  count: selected.size,
                })
              )
            )
              onBulkRetry();
          }}
          style={{ marginBottom: 16 }}
        >
          {t('settings.messagingFailures.actions.retry_selected', {
            count: selected.size,
          })}
        </button>
      )}

      {events.length === 0 ? (
        <V3Card pad={28} style={{ border: '1px solid var(--color-line)' }}>
          <div style={{ color: 'var(--color-ink-3)', fontSize: 14 }}>
            {t('settings.messagingFailures.empty')}
          </div>
        </V3Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map((e) => (
            <V3Card
              key={e.id}
              pad={20}
              style={{ border: '1px solid var(--color-line)' }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  aria-label={t('settings.messagingFailures.columns.customer')}
                  checked={selected.has(e.id)}
                  onChange={() => toggle(e.id)}
                  style={{ marginTop: 4 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {e.customerName ??
                      t('settings.messagingFailures.unknown_customer')}{' '}
                    <span
                      style={{
                        color: 'var(--color-ink-4)',
                        fontWeight: 500,
                        fontSize: 13,
                      }}
                    >
                      · {e.template}
                    </span>
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 12,
                      color: 'var(--color-ink-3)',
                      marginTop: 6,
                      wordBreak: 'break-all',
                    }}
                  >
                    {e.payloadPreview}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--color-bad)',
                      marginTop: 6,
                    }}
                  >
                    {e.lastError ?? '—'}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--color-ink-4)',
                      marginTop: 6,
                    }}
                  >
                    {t('settings.messagingFailures.columns.attempts')}:{' '}
                    {e.attempts} ·{' '}
                    {t('settings.messagingFailures.columns.failed_at')}:{' '}
                    {fmtThaiDate(e.firstFailedAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="aw3-btn aw3-btn-soft"
                    disabled={pending}
                    onClick={() => onRetry(e.id)}
                  >
                    {t('settings.messagingFailures.actions.retry')}
                  </button>
                  <button
                    type="button"
                    className="aw3-btn aw3-btn-ghost"
                    disabled={pending}
                    onClick={() => {
                      setEditing(e);
                      setEditText(JSON.stringify(e.payload ?? {}, null, 2));
                    }}
                  >
                    {t('settings.messagingFailures.actions.edit_retry')}
                  </button>
                  <button
                    type="button"
                    className="aw3-btn aw3-btn-ghost"
                    disabled={pending}
                    onClick={() => onResolve(e.id)}
                  >
                    {t('settings.messagingFailures.actions.resolve')}
                  </button>
                </div>
              </div>
            </V3Card>
          ))}
        </div>
      )}

      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: 24,
          }}
        >
          <V3Card pad={24} style={{ maxWidth: 560, width: '100%', background: '#fff' }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>
              {t('settings.messagingFailures.actions.edit_retry')}
            </h3>
            <textarea
              value={editText}
              onChange={(ev) => setEditText(ev.target.value)}
              spellCheck={false}
              className="mono"
              style={{
                width: '100%',
                minHeight: 200,
                marginTop: 14,
                padding: 12,
                fontSize: 12,
                border: '1px solid var(--color-line)',
                borderRadius: 'var(--radius-sm)',
              }}
            />
            <div
              style={{
                display: 'flex',
                gap: 10,
                justifyContent: 'flex-end',
                marginTop: 16,
              }}
            >
              <button
                type="button"
                className="aw3-btn aw3-btn-ghost"
                onClick={() => setEditing(null)}
              >
                {t('settings.messagingFailures.actions.cancel')}
              </button>
              <button
                type="button"
                className="aw3-btn aw3-btn-soft"
                disabled={pending}
                onClick={onEditSave}
              >
                {t('settings.messagingFailures.actions.save_retry')}
              </button>
            </div>
          </V3Card>
        </div>
      )}

      <button
        type="button"
        className="aw3-btn aw3-btn-ghost"
        onClick={() => router.push('/th/settings')}
        style={{ marginTop: 20 }}
      >
        {t('settings.messagingFailures.back')}
      </button>
    </div>
  );
}
