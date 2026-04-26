'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Alert } from '@/lib/types';
import { closeAlert as closeAlertApi } from '@/lib/api';
import { useModal } from '@/lib/store/modal';
import { ModalShell, Field } from './modal-shell';

const REASONS = [
  'แก้ไขแล้ว',
  'ติดต่อฟาร์มทุกแห่งแล้ว',
  'เป็นการแจ้งเตือนผิด',
  'เลื่อนไปเฝ้าระวัง',
];

export function CloseAlertModal({ alert }: { alert?: Alert }) {
  const close = useModal((s) => s.close);
  const qc = useQueryClient();
  const [reason, setReason] = useState(REASONS[0]);

  const mutation = useMutation({
    mutationFn: () => (alert ? closeAlertApi(alert.id) : Promise.resolve()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('ปิดเคสแล้ว');
      close();
    },
  });

  return (
    <ModalShell
      title="ปิดเคสแจ้งเตือน"
      subtitle={alert?.title}
      footer={
        <>
          <button className="aw3-btn aw3-btn-ghost" type="button" onClick={close}>
            ยกเลิก
          </button>
          <button
            className="aw3-btn aw3-btn-hero"
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            ปิดเคส
          </button>
        </>
      }
    >
      <Field label="เหตุผล">
        <select
          className="aw3-input"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>
      <Field label="บันทึก (ไม่บังคับ)">
        <textarea
          className="aw3-input"
          rows={3}
          placeholder="เช่น ส่ง PCR ใหม่แล้วพบสะอาด"
        />
      </Field>
    </ModalShell>
  );
}
