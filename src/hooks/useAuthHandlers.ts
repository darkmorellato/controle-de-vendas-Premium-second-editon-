import { useCallback } from 'react';
import { authService } from '../services/index.js';
import type { Sale, PendingAuthAction } from '../types';

interface UseAuthHandlersProps {
  managerPassword: string;
  pendingAuthAction: PendingAuthAction;
  pendingEditItem: Sale | null;
  closeModal: (modal: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  performSave: () => void;
  performDelete: () => void;
  performClientUpdate: () => Promise<void>;
  startEdit: (sale: Sale) => void;
  setManagerPassword: (password: string) => void;
  setPendingAuthAction: (action: PendingAuthAction) => void;
  setPendingEditItem: (item: Sale | null) => void;
}

export function useAuthHandlers({
  managerPassword,
  pendingAuthAction,
  pendingEditItem,
  closeModal,
  showToast,
  performSave,
  performDelete,
  performClientUpdate,
  startEdit,
  setManagerPassword,
  setPendingAuthAction,
  setPendingEditItem,
}: UseAuthHandlersProps) {
  const handleManagerAuth = useCallback(async () => {
    const isValid = await authService.verifyManagerPassword(managerPassword);
    
    if (isValid) {
      try {
        if (pendingAuthAction === 'save') {
          performSave();
        } else if (pendingAuthAction === 'edit' && pendingEditItem) {
          startEdit(pendingEditItem);
        } else if (pendingAuthAction === 'delete') {
          performDelete();
        } else if (pendingAuthAction === 'update_client') {
          await performClientUpdate();
        }
        
        closeModal('managerAuth');
        setManagerPassword('');
        setPendingAuthAction(null);
        setPendingEditItem(null);
      } catch (error) {
        showToast('Erro: ' + (error as Error).message, 'error');
      }
    } else {
      showToast('Senha incorreta', 'error');
    }
  }, [
    managerPassword,
    pendingAuthAction,
    pendingEditItem,
    closeModal,
    showToast,
    performSave,
    performDelete,
    performClientUpdate,
    startEdit,
    setManagerPassword,
    setPendingAuthAction,
    setPendingEditItem,
  ]);

  return { handleManagerAuth };
}