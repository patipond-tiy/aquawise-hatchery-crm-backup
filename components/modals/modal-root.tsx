'use client';

import { useModal } from '@/lib/store/modal';
import { AddCustomerModal } from './add-customer-modal';
import { AddBatchModal } from './add-batch-modal';
import { SendLineModal } from './send-line-modal';
import { QuoteModal } from './quote-modal';
import { CertModal } from './cert-modal';
import { InviteTeamModal } from './invite-team-modal';
import { CloseAlertModal } from './close-alert-modal';
import { ScheduleModal } from './schedule-modal';

export function ModalRoot() {
  const { kind, props, close } = useModal();
  if (!kind) return null;

  let body: React.ReactNode = null;
  if (kind === 'addCustomer') body = <AddCustomerModal />;
  else if (kind === 'addBatch') body = <AddBatchModal />;
  else if (kind === 'sendLine') body = <SendLineModal customer={props.customer} />;
  else if (kind === 'quote') body = <QuoteModal customer={props.customer} />;
  else if (kind === 'cert') body = <CertModal batch={props.batch} />;
  else if (kind === 'invite') body = <InviteTeamModal />;
  else if (kind === 'closeAlert') body = <CloseAlertModal alert={props.alert} />;
  else if (kind === 'schedule') body = <ScheduleModal customer={props.customer} />;

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(13,12,24,0.55)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'aw3-fade 0.12s ease-out',
      }}
    >
      <style>{`
        @keyframes aw3-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes aw3-slip { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 20px 60px rgba(13,12,24,0.25)',
          maxWidth: 560,
          width: '100%',
          maxHeight: '88vh',
          overflow: 'auto',
          animation: 'aw3-slip 0.16s ease-out',
        }}
      >
        {body}
      </div>
    </div>
  );
}
