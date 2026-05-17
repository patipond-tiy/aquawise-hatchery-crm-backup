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
import { BroadcastConfirmModal } from './broadcast-confirm-modal';
import { PublishWarningModal } from './publish-warning-modal';

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
  else if (kind === 'publishWarning') body = <PublishWarningModal batch={props.batch} />;
  else if (kind === 'broadcastConfirm' && props.broadcast)
    body = (
      <BroadcastConfirmModal
        filterId={props.broadcast.filterId}
        farmCount={props.broadcast.farmCount}
      />
    );

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(13,12,24,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'aw3-fade 0.12s ease-out',
      }}
    >
      <div
        className="aw3-scroll"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-modal)',
          maxWidth: 560,
          width: '100%',
          maxHeight: '88vh',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          animation: 'aw3-slip 0.16s ease-out',
          willChange: 'transform, opacity',
        }}
      >
        {body}
      </div>
    </div>
  );
}
