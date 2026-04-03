import { useCallback } from 'react';
import { salesService, clientService } from '../services/index.js';
import type { Sale, Client, AuthSettings } from '../types';

interface SaleFormData {
  date: string;
  clientName: string;
  clientCpf: string;
  clientPhone: string;
  clientEmail: string;
  clientDob: string;
  clientAddress: string;
  clientNumber: string;
  clientCity: string;
  clientZip: string;
  clientState: string;
  clientNeighborhood: string;
  category: string;
  items: Sale['items'];
  finalTotal: number;
  totalDiscount: number;
  paymentList: Sale['payments'];
  totalPaid: number;
  changeAmount: number;
  originalEmployeeName: string;
  clientSource: string;
  paymentObservation: string;
  editingId: string | null;
}

interface UseSaleHandlersProps {
  form: SaleFormData;
  authSettings: AuthSettings;
  openModal: (modal: string, data?: unknown) => void;
  closeModal: (modal: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  resetForm: () => void;
  handleSaveClient: () => Promise<string | null>;
}

export function useSaleHandlers({
  form,
  authSettings,
  openModal,
  closeModal,
  showToast,
  resetForm,
  handleSaveClient,
}: UseSaleHandlersProps) {
  const performSave = useCallback(async () => {
    const clientId = form.clientName ? await handleSaveClient() : null;
    
    const saleId = form.editingId || salesService.generateId();
    const saleData: Sale = {
      id: saleId,
      date: form.date,
      timestamp: new Date().toISOString(),
      ...(clientId && { clientId }),
      clientName: form.clientName,
      clientCpf: form.clientCpf,
      clientPhone: form.clientPhone,
      clientEmail: form.clientEmail,
      clientDob: form.clientDob,
      clientAddress: form.clientAddress,
      clientNumber: form.clientNumber,
      clientCity: form.clientCity,
      clientZip: form.clientZip,
      clientState: form.clientState,
      clientNeighborhood: form.clientNeighborhood,
      category: form.category,
      items: form.items,
      amount: Math.round((form.finalTotal + Number.EPSILON) * 100) / 100,
      discount: Math.round((form.totalDiscount + Number.EPSILON) * 100) / 100,
      employeeName: form.originalEmployeeName || authSettings.employeeName,
      store: 'Miplace Premium',
      payments: form.paymentList,
      amountPaid: form.totalPaid,
      change: form.changeAmount,
      clientSource: form.clientSource,
      paymentObservation: form.paymentObservation,
    };
    
    salesService.save(saleData)
      .then(() => {
        showToast(form.editingId ? 'Atualizado!' : 'Venda registrada!');
        if (!form.editingId) {
          openModal('receipt', { saleData });
        }
        resetForm();
      })
      .catch((err) => showToast('Erro: ' + (err?.message || 'desconhecido'), 'error'));
  }, [form, authSettings, showToast, openModal, resetForm, handleSaveClient]);

  const performDelete = useCallback(() => {
    if (form.editingId) {
      salesService.delete(form.editingId)
        .then(() => {
          showToast('Excluído!', 'error');
          resetForm();
        })
        .catch((err) => showToast('Erro: ' + (err?.message || 'desconhecido'), 'error'));
    }
  }, [form.editingId, showToast, resetForm]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.items.length === 0) {
      showToast('Adicione itens!', 'error');
      return;
    }
    
    const isRefundOrExchangeCredit = form.finalTotal < 0;
    
    if (!isRefundOrExchangeCredit && form.finalTotal - form.totalPaid > 0.02) {
      showToast('Valor pago insuficiente.', 'error');
      return;
    }
    
    if (!isRefundOrExchangeCredit && form.changeAmount > 0.02) {
      openModal('confirmChange');
      return;
    }
    
    openModal('confirmSale');
  }, [form, showToast, openModal]);

  const confirmSave = useCallback(() => {
    closeModal('confirmSale');
    performSave();
  }, [closeModal, performSave]);

  const confirmChange = useCallback(() => {
    closeModal('confirmChange');
    openModal('confirmSale');
  }, [closeModal, openModal]);

  return {
    performSave,
    performDelete,
    handleSubmit,
    confirmSave,
    confirmChange,
  };
}