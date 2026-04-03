import { useState, useRef, useMemo } from 'react';
import type { Sale, Client, SelectedClientHistory, PendingAuthAction } from '../../types';

interface UseAppStateProps {
  sales: Sale[];
  clients: Client[];
  isLoggedIn?: boolean;
  employeeName?: string;
}

interface UseAppStateReturn {
  managerPassword: string;
  setManagerPassword: (password: string) => void;
  pendingAuthAction: PendingAuthAction;
  setPendingAuthAction: (action: PendingAuthAction) => void;
  pendingEditItem: Sale | null;
  setPendingEditItem: (item: Sale | null) => void;
  dateLockPassword: string;
  setDateLockPassword: (password: string) => void;
  selectedClientForEdit: Client | null;
  setSelectedClientForEdit: (client: Client | null) => void;
  selectedClientHistory: SelectedClientHistory | null;
  setSelectedClientHistory: (history: SelectedClientHistory | null) => void;
  clientSearchTerm: string;
  setClientSearchTerm: (term: string) => void;
  currentReceipt: Sale | null;
  setCurrentReceipt: (sale: Sale | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  sortedSaleDates: string[];
  jumpedToLatestRef: React.MutableRefObject<boolean>;
  filteredClients: Client[];
}

export function useAppState({ sales, clients }: UseAppStateProps): UseAppStateReturn {
  const [managerPassword, setManagerPassword] = useState('');
  const [pendingAuthAction, setPendingAuthAction] = useState<PendingAuthAction>(null);
  const [pendingEditItem, setPendingEditItem] = useState<Sale | null>(null);
  const [dateLockPassword, setDateLockPassword] = useState('');
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<Client | null>(null);
  const [selectedClientHistory, setSelectedClientHistory] = useState<SelectedClientHistory | null>(null);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [currentReceipt, setCurrentReceipt] = useState<Sale | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jumpedToLatestRef = useRef(false);

  const sortedSaleDates = useMemo(
    () => [...new Set(sales.map((s) => s.date))].filter(Boolean).sort(),
    [sales],
  );

  const filteredClients = useMemo(() => {
    if (!clientSearchTerm) return clients;
    const term = clientSearchTerm.toLowerCase();
    return clients.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(term) ||
        (c.cpf && c.cpf.includes(clientSearchTerm)),
    );
  }, [clients, clientSearchTerm]);

  return {
    managerPassword,
    setManagerPassword,
    pendingAuthAction,
    setPendingAuthAction,
    pendingEditItem,
    setPendingEditItem,
    dateLockPassword,
    setDateLockPassword,
    selectedClientForEdit,
    setSelectedClientForEdit,
    selectedClientHistory,
    setSelectedClientHistory,
    clientSearchTerm,
    setClientSearchTerm,
    currentReceipt,
    setCurrentReceipt,
    fileInputRef,
    sortedSaleDates,
    jumpedToLatestRef,
    filteredClients,
  };
}