import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSaleForm } from '../core/useSaleForm.ts';

describe('useSaleForm', () => {
  it('deve inicializar com estado padrão', () => {
    const { result } = renderHook(() => useSaleForm());
    
    expect(result.current.date).toBeDefined();
    expect(result.current.clientName).toBe('');
    expect(result.current.clientCpf).toBe('');
    expect(result.current.category).toBe('');
    expect(result.current.items).toEqual([]);
    expect(result.current.paymentList).toEqual([]);
  });

  it('deve calcular total corretamente sem itens', () => {
    const { result } = renderHook(() => useSaleForm());
    expect(result.current.totalAmount).toBe(0);
    expect(result.current.totalDiscount).toBe(0);
    expect(result.current.finalTotal).toBe(0);
    expect(result.current.totalPaid).toBe(0);
    expect(result.current.remainingToPay).toBe(0);
  });

  it('deve adicionar item e calcular total', () => {
    const { result } = renderHook(() => useSaleForm());
    
    act(() => {
      result.current.setItems([
        { id: '1', type: 'IPHONE', description: 'iPhone 15', quantity: 2, unitPrice: 4000, discount: 0 }
      ]);
    });
    
    expect(result.current.totalAmount).toBe(8000);
    expect(result.current.finalTotal).toBe(8000);
  });

  it('deve calcular desconto corretamente', () => {
    const { result } = renderHook(() => useSaleForm());
    
    act(() => {
      result.current.setItems([
        { id: '1', type: 'IPHONE', description: 'iPhone 15', quantity: 1, unitPrice: 4000, discount: 500 }
      ]);
    });
    
    expect(result.current.totalAmount).toBe(4000);
    expect(result.current.totalDiscount).toBe(500);
    expect(result.current.finalTotal).toBe(3500);
  });

  it('deve adicionar pagamento e calcular restante', () => {
    const { result } = renderHook(() => useSaleForm());
    
    act(() => {
      result.current.setItems([
        { id: '1', type: 'IPHONE', description: 'iPhone 15', quantity: 1, unitPrice: 4000, discount: 0 }
      ]);
      result.current.setPaymentList([
        { id: 'p1', method: 'Dinheiro', type: 'avista', amount: 2000 }
      ]);
    });
    
    expect(result.current.totalPaid).toBe(2000);
    expect(result.current.remainingToPay).toBe(2000);
  });

  it('deve calcular troco quando pago maior que total', () => {
    const { result } = renderHook(() => useSaleForm());
    
    act(() => {
      result.current.setItems([
        { id: '1', type: 'IPHONE', description: 'iPhone 15', quantity: 1, unitPrice: 4000, discount: 0 }
      ]);
      result.current.setPaymentList([
        { id: 'p1', method: 'Dinheiro', type: 'avista', amount: 5000 }
      ]);
    });
    
    expect(result.current.totalPaid).toBe(5000);
    expect(result.current.changeAmount).toBe(1000);
  });

  it('deve resetar formulário', () => {
    const { result } = renderHook(() => useSaleForm());
    
    act(() => {
      result.current.setClientName('João');
      result.current.setClientCpf('12345678901');
      result.current.setItems([
        { id: '1', type: 'IPHONE', description: 'iPhone 15', quantity: 1, unitPrice: 4000, discount: 0 }
      ]);
      result.current.setPaymentList([
        { id: 'p1', method: 'Dinheiro', type: 'avista', amount: 4000 }
      ]);
      result.current.resetForm();
    });
    
    expect(result.current.clientName).toBe('');
    expect(result.current.clientCpf).toBe('');
    expect(result.current.items).toEqual([]);
    expect(result.current.paymentList).toEqual([]);
  });

  it('deve alterar categoria', () => {
    const { result } = renderHook(() => useSaleForm());
    
    act(() => {
      result.current.setCategory('Devolução');
    });
    
    expect(result.current.category).toBe('Devolução');
  });

  it('deve alterar data', () => {
    const { result } = renderHook(() => useSaleForm());
    
    act(() => {
      result.current.setDate('2026-04-01');
    });
    
    expect(result.current.date).toBe('2026-04-01');
  });

  it('deve lidar com múltiplos pagamentos', () => {
    const { result } = renderHook(() => useSaleForm());
    
    act(() => {
      result.current.setItems([
        { id: '1', type: 'IPHONE', description: 'iPhone 15', quantity: 1, unitPrice: 4000, discount: 0 }
      ]);
      result.current.setPaymentList([
        { id: 'p1', method: 'Dinheiro', type: 'avista', amount: 1500 },
        { id: 'p2', method: 'Pix', type: 'avista', amount: 1500 },
        { id: 'p3', method: 'Cartão Débito', type: 'avista', amount: 1000 }
      ]);
    });
    
    expect(result.current.totalPaid).toBe(4000);
    expect(result.current.remainingToPay).toBe(0);
  });
});
