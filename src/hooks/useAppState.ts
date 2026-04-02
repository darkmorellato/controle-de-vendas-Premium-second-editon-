import { useState, useRef, useMemo, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { ROUTINE_TASKS } from '../constants.js';
import type { Sale, Client, RoutineState, AlertData, SelectedClientHistory, PendingAuthAction } from '../types';

interface UseAppStateProps {
  sales: Sale[];
  clients: Client[];
  isLoggedIn?: boolean;
  employeeName?: string;
}

interface UseAppStateReturn {
  routineState: RoutineState;
  setRoutineState: (state: RoutineState) => void;
  reminders: string[];
  setReminders: (reminders: string[]) => void;
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
  alertModalOpen: boolean;
  setAlertModalOpen: (open: boolean) => void;
  alertData: AlertData;
  setAlertData: (data: AlertData) => void;
  lastAlertTime: number;
  setLastAlertTime: (time: number) => void;
  currentReceipt: Sale | null;
  setCurrentReceipt: (sale: Sale | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  sortedSaleDates: string[];
  jumpedToLatestRef: React.MutableRefObject<boolean>;
  filteredClients: Client[];
}

export function useAppState({ sales, clients, isLoggedIn = false, employeeName = '' }: UseAppStateProps): UseAppStateReturn {
  const [routineState, setRoutineState] = useState<RoutineState>({});
  const [reminders, setReminders] = useState<string[]>([]);
  const [managerPassword, setManagerPassword] = useState('');
  const [pendingAuthAction, setPendingAuthAction] = useState<PendingAuthAction>(null);
  const [pendingEditItem, setPendingEditItem] = useState<Sale | null>(null);
  const [dateLockPassword, setDateLockPassword] = useState('');
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<Client | null>(null);
  const [selectedClientHistory, setSelectedClientHistory] = useState<SelectedClientHistory | null>(null);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertData, setAlertData] = useState<AlertData>({ message: '', phase: '' });
  const [lastAlertTime, setLastAlertTime] = useState(0);
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

  // Rotina diária (Firestore)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const unsub = onSnapshot(
      doc(db, 'rotina_state', today),
      (d) => { if (d.exists()) setRoutineState(d.data() as RoutineState); else setRoutineState({}); },
      (err) => console.error('Erro rotina:', err),
    );
    return () => unsub();
  }, []);

  // Alertas de rotina periódicos
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const checkAlerts = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      if (Date.now() - lastAlertTime < 15 * 60 * 1000) return;
      
      const phases = [
        { name: 'Início - Manhã', start: 570, end: 780, key: 'morning' },
        { name: 'Meio - Tarde', start: 810, end: 990, key: 'afternoon' },
        { name: 'Fim - Fechamento', start: 1020, end: 1110, key: 'evening' },
      ];
      
      for (const p of phases) {
        if (currentMinutes >= p.start && currentMinutes <= p.end) {
          const tasks = ROUTINE_TASKS[p.key as keyof typeof ROUTINE_TASKS] || [];
          if (!tasks.every((_: string, i: number) => routineState[`${p.key}-${i}`])) {
            setAlertData({
              phase: p.name,
              message: `(${employeeName}) Não esqueça de completar suas tarefas diárias\n${p.name}\nExiste Pendências!`,
            });
            setAlertModalOpen(true);
            setLastAlertTime(Date.now());
            try { new Audio('/speech_1771176567518.mp3').play().catch(() => {}); } catch {}
            break;
          }
        }
      }
    };
    
    const interval = setInterval(checkAlerts, 60_000);
    checkAlerts();
    
    return () => clearInterval(interval);
  }, [isLoggedIn, routineState, lastAlertTime, employeeName]);

  return {
    routineState,
    setRoutineState,
    reminders,
    setReminders,
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
    alertModalOpen,
    setAlertModalOpen,
    alertData,
    setAlertData,
    lastAlertTime,
    setLastAlertTime,
    currentReceipt,
    setCurrentReceipt,
    fileInputRef,
    sortedSaleDates,
    jumpedToLatestRef,
    filteredClients,
  };
}