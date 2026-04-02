import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useModals } from '../hooks/useModals';
import type { CurrentView, ToastMessage, ModalState } from '../types';

interface UIContextType {
  currentView: CurrentView;
  setCurrentView: (view: CurrentView) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
  modals: Record<string, ModalState>;
  openModal: (modal: string, data?: unknown) => void;
  closeModal: (modal: string) => void;
  isOpen: (modal: string) => boolean;
  getModalData: (modal: string) => unknown;
  dispatch: (action: { type: string; modal?: string; data?: unknown }) => void;
  isHelpDropdownOpen: boolean;
  setIsHelpDropdownOpen: (open: boolean) => void;
  isNotificationsDropdownOpen: boolean;
  setIsNotificationsDropdownOpen: (open: boolean) => void;
  handleOnline: () => void;
  handleOffline: () => void;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState<CurrentView>('dashboard');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState<boolean>(false);
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState<boolean>(false);

  const toastTimeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const { modals, openModal, closeModal, isOpen, getModalData, dispatch } = useModals<ModalState>();

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    const timeoutId = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      toastTimeouts.current.delete(id);
    }, 4000);
    toastTimeouts.current.set(id, timeoutId);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const tid = toastTimeouts.current.get(id);
    if (tid) { clearTimeout(tid); toastTimeouts.current.delete(id); }
  }, []);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    showToast('Conexão restaurada! Sincronizando...');
  }, [showToast]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    showToast('Sem internet. Dados salvos localmente.', 'error');
  }, [showToast]);

  const value: UIContextType = {
    currentView, setCurrentView,
    isOnline, setIsOnline,
    toasts, showToast, removeToast,
    modals, openModal, closeModal, isOpen, getModalData, dispatch,
    isHelpDropdownOpen, setIsHelpDropdownOpen,
    isNotificationsDropdownOpen, setIsNotificationsDropdownOpen,
    handleOnline, handleOffline,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext(): UIContextType {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUIContext deve ser usado dentro de UIProvider');
  return ctx;
}

export type { CurrentView, ToastMessage, ModalState };