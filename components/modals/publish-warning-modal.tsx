'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { Batch } from '@/lib/types';
import {
  publishBatchWarning,
  type WarningSeverity,
} from '@/app/[locale]/(dashboard)/batches/actions';
import { useModal } from '@/lib/store/modal';
import { ModalShell, Field } from './modal-shell';

const SEVERITIES: WarningSeverity[] = ['info', 'warning', 'critical'];

export function PublishWarningModal({ batch }: { batch?: Batch }) {
  const close = useModal((s) => s.close);
  const t = useTranslations('batches.warning');
  const [severity, setSeverity] = useState<WarningSeverity>('warning');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [action, setAction] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async () => {
    if (!batch || !title.trim() || !body.trim() || !action.trim()) return;
    setPending(true);
    try {
      const { delivered } = await publishBatchWarning(
        batch.id,
        severity,
        title,
        body,
        action
      );
      toast.success(
        delivered
          ? t('toast.published', { code: batch.id })
          : t('toast.queued', { code: batch.id })
      );
      close();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'ส่งการแจ้งเตือนไม่สำเร็จ'
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <ModalShell
      title={t('modal.title', { code: batch?.id ?? '' })}
      footer={
        <>
          <button
            className="aw3-btn aw3-btn-ghost"
            type="button"
            onClick={close}
          >
            ยกเลิก
          </button>
          <button
            className="aw3-btn aw3-btn-hero"
            type="button"
            onClick={submit}
            disabled={
              !title.trim() || !body.trim() || !action.trim() || pending
            }
          >
            {pending ? 'กำลังส่ง…' : t('button')}
          </button>
        </>
      }
    >
      <Field label={t('field.severity')}>
        <div style={{ display: 'flex', gap: 8 }}>
          {SEVERITIES.map((s) => (
            <button
              key={s}
              type="button"
              className={
                severity === s ? 'aw3-btn aw3-btn-hero' : 'aw3-btn aw3-btn-ghost'
              }
              onClick={() => setSeverity(s)}
            >
              {t(`severity.${s}`)}
            </button>
          ))}
        </div>
      </Field>
      <Field label={t('field.title')}>
        <input
          className="aw3-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
        />
      </Field>
      <Field label={t('field.body')}>
        <textarea
          className="aw3-input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={500}
        />
      </Field>
      <Field label={t('field.action')}>
        <textarea
          className="aw3-input"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          rows={2}
          maxLength={300}
        />
      </Field>
    </ModalShell>
  );
}
