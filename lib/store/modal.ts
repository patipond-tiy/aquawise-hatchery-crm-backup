'use client';

import { create } from 'zustand';
import type { Customer, Batch, Alert } from '@/lib/types';

export type ModalKind =
  | 'addCustomer'
  | 'addBatch'
  | 'sendLine'
  | 'quote'
  | 'cert'
  | 'invite'
  | 'closeAlert'
  | 'schedule';

export type ModalProps = {
  customer?: Customer;
  batch?: Batch;
  alert?: Alert;
};

type ModalState = {
  kind: ModalKind | null;
  props: ModalProps;
  open: (kind: ModalKind, props?: ModalProps) => void;
  close: () => void;
};

export const useModal = create<ModalState>((set) => ({
  kind: null,
  props: {},
  open: (kind, props = {}) => set({ kind, props }),
  close: () => set({ kind: null, props: {} }),
}));
