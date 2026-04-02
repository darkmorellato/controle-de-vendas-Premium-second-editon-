import { useState } from 'react';
import type { Sale } from '../types/index.ts';
import type { PendingAuthAction } from '../types/index.ts';

export function useSalesDataHandlers() {
  const [currentReceipt, setCurrentReceipt] = useState<Sale | null>(null);
  const [pendingEditItem, setPendingEditItem] = useState<Sale | null>(null);
  const [pendingAuthAction, setPendingAuthAction] = useState<PendingAuthAction>(null);
  const [managerPassword, setManagerPassword] = useState('');
  const [dateLockPassword, setDateLockPassword] = useState('');

  return {
    currentReceipt,
    setCurrentReceipt,
    pendingEditItem,
    setPendingEditItem,
    pendingAuthAction,
    setPendingAuthAction,
    managerPassword,
    setManagerPassword,
    dateLockPassword,
    setDateLockPassword,
  };
}