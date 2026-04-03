import { useCallback } from 'react';
import { parseCurrency, formatCurrency, generateLocalId } from '../utils.js';
import type { Payment, PaymentMethod, PaymentType } from '../types';

interface UsePaymentHandlersProps {
  form: {
    currentPaymentMethod: PaymentMethod | '';
    currentPaymentType: PaymentType | '';
    currentPaymentAmount: string;
    currentInstallments: string;
    editingPaymentId: number | null;
    paymentList: Payment[];
    setCurrentPaymentMethod: (method: PaymentMethod | '') => void;
    setCurrentPaymentType: (type: PaymentType | '') => void;
    setCurrentPaymentAmount: (amount: string) => void;
    setCurrentInstallments: (installments: string) => void;
    setEditingPaymentId: (id: number | null) => void;
    setPaymentList: (payments: Payment[] | ((prev: Payment[]) => Payment[])) => void;
  };
  category: string;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function usePaymentHandlers({
  form,
  category,
  showToast,
}: UsePaymentHandlersProps) {
  const handleAddPayment = useCallback(() => {
    if (!form.currentPaymentMethod) {
      showToast('Selecione a Forma de pagamento', 'error');
      return;
    }
    
    if (!form.currentPaymentAmount || parseCurrency(form.currentPaymentAmount) <= 0) {
      showToast('Preencha um valor válido', 'error');
      return;
    }
    
    let amountToAdd = parseCurrency(form.currentPaymentAmount);
    
    const refundMethods = ['Devolução Dinheiro', 'Devolução Pix', 'Devolução Estorno Cartão'];
    if (refundMethods.includes(form.currentPaymentMethod)) {
      amountToAdd = -Math.abs(amountToAdd);
    }
    
    if (form.editingPaymentId) {
      form.setPaymentList((prev) => prev.map((p) =>
        p.id === form.editingPaymentId
          ? {
              ...p,
              method: form.currentPaymentMethod,
              type: form.currentPaymentType || 'Integral',
              amount: amountToAdd,
              installments: form.currentPaymentMethod === 'Credito Parcelado' ? (form.currentInstallments || undefined) : undefined,
            }
          : p
      ));
      form.setEditingPaymentId(null);
      showToast('Pagamento atualizado!');
    } else {
      const newPayment: Payment = {
        id: generateLocalId(),
        method: form.currentPaymentMethod,
        type: form.currentPaymentType || 'Integral',
        amount: amountToAdd,
        installments: form.currentPaymentMethod === 'Credito Parcelado' ? (form.currentInstallments || undefined) : undefined,
      };
      form.setPaymentList((prev) => [...prev, newPayment]);
    }
    
    form.setCurrentPaymentMethod('');
    form.setCurrentPaymentType('');
    form.setCurrentPaymentAmount('');
    form.setCurrentInstallments('');
  }, [form, showToast]);

  const handleEditPayment = useCallback((payment: Payment) => {
    form.setEditingPaymentId(payment.id);
    form.setCurrentPaymentMethod(payment.method as PaymentMethod);
    form.setCurrentPaymentType(payment.type as PaymentType);
    form.setCurrentPaymentAmount(formatCurrency(Math.abs(payment.amount)));
    form.setCurrentInstallments(payment.installments || '');
  }, [form]);

  const handleRemovePayment = useCallback((id: number) => {
    form.setPaymentList((prev) => prev.filter((p) => p.id !== id));
  }, [form]);

  const handleCurrentPaymentAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    const floatVal = parseFloat(val) / 100 || 0;
    form.setCurrentPaymentAmount(formatCurrency(floatVal));
  }, [form]);

  return {
    handleAddPayment,
    handleEditPayment,
    handleRemovePayment,
    handleCurrentPaymentAmountChange,
  };
}