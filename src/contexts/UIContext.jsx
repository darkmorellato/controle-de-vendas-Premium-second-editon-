import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useModals } from '../hooks/useModals.js';

const UIContext = createContext(null);

/**
 * Centraliza estado de UI: toasts, view atual, modais, status online, dropdown de ajuda.
 * Remove necessidade de useState espalhados em App.jsx para controle de UI.
 */
export function UIProvider({ children }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [toasts, setToasts] = useState([]);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false);

  const toastTimeouts = useRef(new Map());
  const { modals, openModal, closeModal, isOpen, getModalData, dispatch } = useModals();

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    const timeoutId = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      toastTimeouts.current.delete(id);
    }, 4000);
    toastTimeouts.current.set(id, timeoutId);
  }, []);

  const removeToast = useCallback((id) => {
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

  // Registra listeners de online/offline
  // (useEffect omitido intencionalmente aqui — App.jsx mantém o listener
  //  para poder repassar callbacks do contexto. Alternativa: passar handleOnline/handleOffline.)
  // Os callbacks são expostos para App.jsx os registrar no useEffect.

  return (
    <UIContext.Provider
      value={{
        currentView, setCurrentView,
        isOnline, setIsOnline,
        toasts, showToast, removeToast,
        modals, openModal, closeModal, isOpen, getModalData, dispatch,
        isHelpDropdownOpen, setIsHelpDropdownOpen,
        isNotificationsDropdownOpen, setIsNotificationsDropdownOpen,
        handleOnline, handleOffline,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

/**
 * Hook para consumir estado de UI.
 */
export function useUIContext() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUIContext deve ser usado dentro de UIProvider');
  return ctx;
}
