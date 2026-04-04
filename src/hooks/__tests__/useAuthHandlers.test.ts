import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('../../services/index.js', () => ({
  authService: {
    verifyManagerPassword: vi.fn(async (pw: string) => pw === 'manager123'),
    get currentUser() {
      return { uid: 'test-user' };
    },
    logAction: vi.fn(async () => {}),
  },
  backupService: {
    exportToFile: vi.fn(async () => ({ success: true })),
    importFromFiles: vi.fn(async () => ({ success: true, count: 5 })),
  },
}));

import { authService, backupService } from '../../services/index.js';
import { useAuthHandlers } from '../useAuthHandlers.ts';
import { useBackupHandlers } from '../useBackupHandlers.ts';

describe('useAuthHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleManagerAuth', () => {
    it('performs save action when password is correct', async () => {
      const props = {
        managerPassword: 'manager123',
        pendingAuthAction: 'save' as const,
        pendingEditItem: null,
        closeModal: vi.fn(),
        showToast: vi.fn(),
        performSave: vi.fn(),
        performDelete: vi.fn(),
        performClientUpdate: vi.fn(async () => {}),
        startEdit: vi.fn(),
        setManagerPassword: vi.fn(),
        setPendingAuthAction: vi.fn(),
        setPendingEditItem: vi.fn(),
      };
      const { result } = renderHook(() => useAuthHandlers(props));

      await result.current.handleManagerAuth();

      expect(props.performSave).toHaveBeenCalled();
      expect(props.closeModal).toHaveBeenCalledWith('managerAuth');
      expect(props.setManagerPassword).toHaveBeenCalledWith('');
    });

    it('performs edit action when password is correct', async () => {
      const pendingItem = { id: 'sale-1', date: '2025-01-01', items: [], amount: 500 };
      const props = {
        managerPassword: 'manager123',
        pendingAuthAction: 'edit' as const,
        pendingEditItem: pendingItem,
        closeModal: vi.fn(),
        showToast: vi.fn(),
        performSave: vi.fn(),
        performDelete: vi.fn(),
        performClientUpdate: vi.fn(async () => {}),
        startEdit: vi.fn(),
        setManagerPassword: vi.fn(),
        setPendingAuthAction: vi.fn(),
        setPendingEditItem: vi.fn(),
      };
      const { result } = renderHook(() => useAuthHandlers(props));

      await result.current.handleManagerAuth();

      expect(props.startEdit).toHaveBeenCalledWith(pendingItem);
    });

    it('performs delete action when password is correct', async () => {
      const props = {
        managerPassword: 'manager123',
        pendingAuthAction: 'delete' as const,
        pendingEditItem: null,
        closeModal: vi.fn(),
        showToast: vi.fn(),
        performSave: vi.fn(),
        performDelete: vi.fn(),
        performClientUpdate: vi.fn(async () => {}),
        startEdit: vi.fn(),
        setManagerPassword: vi.fn(),
        setPendingAuthAction: vi.fn(),
        setPendingEditItem: vi.fn(),
      };
      const { result } = renderHook(() => useAuthHandlers(props));

      await result.current.handleManagerAuth();

      expect(props.performDelete).toHaveBeenCalled();
    });

    it('performs client update action when password is correct', async () => {
      const props = {
        managerPassword: 'manager123',
        pendingAuthAction: 'update_client' as const,
        pendingEditItem: null,
        closeModal: vi.fn(),
        showToast: vi.fn(),
        performSave: vi.fn(),
        performDelete: vi.fn(),
        performClientUpdate: vi.fn(async () => {}),
        startEdit: vi.fn(),
        setManagerPassword: vi.fn(),
        setPendingAuthAction: vi.fn(),
        setPendingEditItem: vi.fn(),
      };
      const { result } = renderHook(() => useAuthHandlers(props));

      await result.current.handleManagerAuth();

      expect(props.performClientUpdate).toHaveBeenCalled();
    });

    it('shows error when password is incorrect', async () => {
      const props = {
        managerPassword: 'wrong',
        pendingAuthAction: 'save' as const,
        pendingEditItem: null,
        closeModal: vi.fn(),
        showToast: vi.fn(),
        performSave: vi.fn(),
        performDelete: vi.fn(),
        performClientUpdate: vi.fn(async () => {}),
        startEdit: vi.fn(),
        setManagerPassword: vi.fn(),
        setPendingAuthAction: vi.fn(),
        setPendingEditItem: vi.fn(),
      };
      const { result } = renderHook(() => useAuthHandlers(props));

      await result.current.handleManagerAuth();

      expect(props.showToast).toHaveBeenCalledWith('Senha incorreta', 'error');
      expect(props.performSave).not.toHaveBeenCalled();
    });
  });
});

describe('useBackupHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleExportBackup', () => {
    it('exports backup and shows success toast', async () => {
      const props = {
        sales: [{ id: 's1', amount: 500 }],
        clients: [{ id: 'c1', name: 'João' }],
        authSettings: { employeeName: 'joao', currency: 'R$' },
        modals: {},
        closeModal: vi.fn(),
        showToast: vi.fn(),
        fileInputRef: { current: null },
      };
      const { result } = renderHook(() => useBackupHandlers(props));

      await result.current.handleExportBackup();

      expect(props.showToast).toHaveBeenCalledWith('Backup salvo!');
    });

    it('handles export error gracefully', async () => {
      vi.mocked(backupService.exportToFile).mockRejectedValueOnce(new Error('Disk full'));
      const props = {
        sales: [],
        clients: [],
        authSettings: { employeeName: 'joao', currency: 'R$' },
        modals: {},
        closeModal: vi.fn(),
        showToast: vi.fn(),
        fileInputRef: { current: null },
      };
      const { result } = renderHook(() => useBackupHandlers(props));

      await result.current.handleExportBackup();

      expect(props.showToast).toHaveBeenCalledWith('Erro ao exportar backup: Disk full', 'error');
    });

    it('closes logout modal after export', async () => {
      const props = {
        sales: [],
        clients: [],
        authSettings: { employeeName: 'joao', currency: 'R$' },
        modals: { logout: { open: true } },
        closeModal: vi.fn(),
        showToast: vi.fn(),
        fileInputRef: { current: null },
      };
      const { result } = renderHook(() => useBackupHandlers(props));

      await result.current.handleExportBackup();

      expect(props.closeModal).toHaveBeenCalledWith('logout');
    });
  });

  describe('handleSaveToCloud', () => {
    it('logs manual cloud save action', async () => {
      const props = {
        sales: [],
        clients: [],
        authSettings: { employeeName: 'joao', currency: 'R$' },
        modals: {},
        closeModal: vi.fn(),
        showToast: vi.fn(),
        fileInputRef: { current: null },
      };
      const { result } = renderHook(() => useBackupHandlers(props));

      await result.current.handleSaveToCloud();

      expect(authService.logAction).toHaveBeenCalledWith('manual_cloud_save', 'joao');
      expect(props.showToast).toHaveBeenCalledWith('Verificando sincronização...', 'info');
    });

    it('shows error when not connected', async () => {
      vi.spyOn(authService, 'currentUser', 'get').mockReturnValue(null as any);
      const props = {
        sales: [],
        clients: [],
        authSettings: { employeeName: 'joao', currency: 'R$' },
        modals: {},
        closeModal: vi.fn(),
        showToast: vi.fn(),
        fileInputRef: { current: null },
      };
      const { result } = renderHook(() => useBackupHandlers(props));

      await result.current.handleSaveToCloud();

      expect(props.showToast).toHaveBeenCalledWith('Erro: Não conectado.', 'error');
    });
  });

  describe('handleImportBackup', () => {
    it('imports backup and shows count', async () => {
      const props = {
        sales: [],
        clients: [],
        authSettings: { employeeName: 'joao', currency: 'R$' },
        modals: {},
        closeModal: vi.fn(),
        showToast: vi.fn(),
        fileInputRef: { current: { value: 'old' } as any },
      };
      const { result } = renderHook(() => useBackupHandlers(props));

      const mockEvent = { target: { files: [new Blob(['{}'])] } };
      await result.current.handleImportBackup(mockEvent as any);

      expect(props.showToast).toHaveBeenCalledWith('5 registros importados!');
      expect(props.closeModal).toHaveBeenCalledWith('backup');
    });

    it('shows message when no valid data found', async () => {
      vi.mocked(backupService.importFromFiles).mockResolvedValueOnce({ success: false, count: 0 });
      const props = {
        sales: [],
        clients: [],
        authSettings: { employeeName: 'joao', currency: 'R$' },
        modals: {},
        closeModal: vi.fn(),
        showToast: vi.fn(),
        fileInputRef: { current: { value: 'old' } as any },
      };
      const { result } = renderHook(() => useBackupHandlers(props));

      const mockEvent = { target: { files: [new Blob(['invalid'])] } };
      await result.current.handleImportBackup(mockEvent as any);

      expect(props.showToast).toHaveBeenCalledWith('Nenhum dado válido encontrado.');
    });
  });
});
