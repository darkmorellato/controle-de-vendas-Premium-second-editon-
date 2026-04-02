import { useCallback } from 'react';
import { salesService } from '../services/salesService.js';
import { clientService } from '../services/clientService.js';
import type { Sale, Client } from '../types/index.ts';

interface UseSalesSubmissionHandlersProps {
  form: any;
  authSettings: { employeeName: string };
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  openModal: (modal: string) => void;
  closeModal: (modal: string) => void;
  handleSaveClient: () => string | null;
  resetForm: () => void;
  setCurrentReceipt: (sale: Sale | null) => void;
}

export function useSalesSubmissionHandlers({
  form,
  authSettings,
  showToast,
  openModal,
  closeModal,
  handleSaveClient,
  resetForm,
  setCurrentReceipt,
}: UseSalesSubmissionHandlersProps) {

  const performSave = useCallback(async () => {
    const clientId = form.clientName ? handleSaveClient() : null;

    const saleId = form.editingId || salesService.generateId();
    
    let contractPdfUrl = null;
    if (form.contractPdf) {
      try {
        contractPdfUrl = await salesService.uploadContract(saleId, form.contractPdf);
      } catch (err: any) {
        showToast('Erro ao fazer upload do contrato: ' + err.message, 'error');
        return;
      }
    }

    const saleData = {
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
      ...(contractPdfUrl && { contractPdfUrl }),
    };

    salesService.save(saleData)
      .then(() => {
        showToast(form.editingId ? 'Atualizado!' : 'Venda registrada!');
        if (!form.editingId) { setCurrentReceipt(saleData); openModal('receipt'); }
        resetForm();
      })
      .catch((err: any) => showToast('Erro: ' + err.message, 'error'));
  }, [form, authSettings.employeeName, showToast, openModal, handleSaveClient, resetForm, setCurrentReceipt]);

  const performDelete = useCallback(() => {
    if (form.editingId) {
      salesService.delete(form.editingId)
        .then(() => { showToast('Excluído!', 'error'); resetForm(); })
        .catch((err: any) => showToast('Erro: ' + err.message, 'error'));
    }
  }, [form.editingId, showToast, resetForm]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (form.items.length === 0) { showToast('Adicione itens!', 'error'); return; }
    const isRefundOrExchangeCredit = form.finalTotal < 0;
    
    const crediarioCategories = ['Crediario Payjoy', 'Crediario Crefaz', 'Crediario Paymobi'];
    const isCrediario = crediarioCategories.includes(form.category);
    
    if (isCrediario && !form.contractPdf) {
      showToast('Contrato PDF é obrigatório para vendas crediaristas!', 'error');
      return;
    }
    
    if (!isRefundOrExchangeCredit && form.remainingToPay > 0.02) {
      showToast('Valor pago insuficiente.', 'error'); return;
    }
    if (!isRefundOrExchangeCredit && form.changeAmount > 0.02) { openModal('confirmChange'); return; }
    openModal('confirmSale');
  }, [form, showToast, openModal]);

  return {
    performSave,
    performDelete,
    handleSubmit,
  };
}