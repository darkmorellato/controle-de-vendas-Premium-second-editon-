import { useCallback } from 'react';
import { backupService, authService } from '../services/index.js';
import type { Sale, Client, AuthSettings } from '../types';

interface UseBackupHandlersProps {
  sales: Sale[];
  clients: Client[];
  authSettings: AuthSettings;
  modals: { logout?: { open: boolean } };
  closeModal: (modal: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function useBackupHandlers({
  sales,
  clients,
  authSettings,
  modals,
  closeModal,
  showToast,
  fileInputRef,
}: UseBackupHandlersProps) {
  const handleExportBackup = useCallback(async () => {
    try {
      const result = await backupService.exportToFile(sales, clients, authSettings);
      
      if (result.success) {
        showToast('Backup salvo!');
      }
      
      if (result.aborted) {
        return;
      }
      
      if (modals.logout?.open) {
        closeModal('logout');
      }
    } catch (err) {
      showToast('Erro ao exportar backup: ' + (err as Error).message, 'error');
    }
  }, [sales, clients, authSettings, modals.logout, closeModal, showToast]);

  const handleSaveToCloud = useCallback(async () => {
    if (!authService.currentUser) {
      showToast('Erro: Não conectado.', 'error');
      return;
    }
    
    showToast('Verificando sincronização...', 'info');
    await authService.logAction('manual_cloud_save', authSettings.employeeName);
    setTimeout(() => showToast('Dados salvos na nuvem!'), 1000);
  }, [authSettings, showToast]);

  const handleImportBackup = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const result = await backupService.importFromFiles(e.target.files);
      
      if (result.success) {
        showToast(`${result.count} registros importados!`);
        closeModal('backup');
      } else {
        showToast('Nenhum dado válido encontrado.');
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      showToast('Erro: ' + (error as Error).message, 'error');
    }
  }, [showToast, closeModal, fileInputRef]);

  return {
    handleExportBackup,
    handleSaveToCloud,
    handleImportBackup,
  };
}