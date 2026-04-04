import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('../../utils.js', () => ({
  parseCurrency: vi.fn((val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat(String(val).replace(/\./g, '').replace(',', '.')) || 0;
  }),
  formatCurrency: vi.fn((val) => Number(val).toFixed(2).replace('.', ',')),
  generateLocalId: vi.fn(() => 99999),
}));

import { parseCurrency, formatCurrency } from '../../utils.js';
import { usePaymentHandlers } from '../usePaymentHandlers.ts';

const createForm = (overrides = {}) => ({
  currentPaymentMethod: '',
  currentPaymentType: '',
  currentPaymentAmount: '',
  currentInstallments: '',
  editingPaymentId: null as number | null,
  paymentList: [] as any[],
  setCurrentPaymentMethod: vi.fn(),
  setCurrentPaymentType: vi.fn(),
  setCurrentPaymentAmount: vi.fn(),
  setCurrentInstallments: vi.fn(),
  setEditingPaymentId: vi.fn(),
  setPaymentList: vi.fn(),
  ...overrides,
});

const defaultProps = (overrides = {}) => ({
  form: createForm(),
  category: 'Venda',
  showToast: vi.fn(),
  ...overrides,
});

describe('usePaymentHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleAddPayment', () => {
    it('shows error when payment method is not selected', () => {
      const props = defaultProps();
      const { result } = renderHook(() => usePaymentHandlers(props));

      result.current.handleAddPayment();

      expect(props.showToast).toHaveBeenCalledWith('Selecione a Forma de pagamento', 'error');
    });

    it('shows error when amount is empty', () => {
      const props = defaultProps({
        form: createForm({ currentPaymentMethod: 'Pix' }),
      });
      const { result } = renderHook(() => usePaymentHandlers(props));

      result.current.handleAddPayment();

      expect(props.showToast).toHaveBeenCalledWith('Preencha um valor válido', 'error');
    });

    it('adds new payment to list', () => {
      vi.mocked(parseCurrency).mockReturnValue(500);
      const props = defaultProps({
        form: createForm({
          currentPaymentMethod: 'Pix',
          currentPaymentAmount: '500,00',
        }),
      });
      const { result } = renderHook(() => usePaymentHandlers(props));

      result.current.handleAddPayment();

      expect(props.form.setPaymentList).toHaveBeenCalledWith(expect.any(Function));
      const setFn = (props.form.setPaymentList as any).mock.calls[0][0];
      const newList = setFn([]);
      expect(newList).toHaveLength(1);
      expect(newList[0].method).toBe('Pix');
      expect(newList[0].amount).toBe(500);
    });

    it('negates amount for refund methods', () => {
      vi.mocked(parseCurrency).mockReturnValue(300);
      const props = defaultProps({
        form: createForm({
          currentPaymentMethod: 'Devolução Pix',
          currentPaymentAmount: '300,00',
        }),
      });
      const { result } = renderHook(() => usePaymentHandlers(props));

      result.current.handleAddPayment();

      const setFn = (props.form.setPaymentList as any).mock.calls[0][0];
      const newList = setFn([]);
      expect(newList[0].amount).toBe(-300);
    });

    it('edits existing payment when editingPaymentId is set', () => {
      vi.mocked(parseCurrency).mockReturnValue(750);
      const existingPayment = { id: 10, method: 'Pix', amount: 500 };
      const props = defaultProps({
        form: createForm({
          currentPaymentMethod: 'Dinheiro',
          currentPaymentAmount: '750,00',
          editingPaymentId: 10,
          paymentList: [existingPayment],
        }),
      });
      const { result } = renderHook(() => usePaymentHandlers(props));

      result.current.handleAddPayment();

      expect(props.form.setEditingPaymentId).toHaveBeenCalledWith(null);
      expect(props.form.setPaymentList).toHaveBeenCalledWith(expect.any(Function));
    });

    it('resets form fields after adding payment', () => {
      const props = defaultProps({
        form: createForm({
          currentPaymentMethod: 'Pix',
          currentPaymentAmount: '500,00',
        }),
      });
      const { result } = renderHook(() => usePaymentHandlers(props));

      result.current.handleAddPayment();

      expect(props.form.setCurrentPaymentMethod).toHaveBeenCalledWith('');
      expect(props.form.setCurrentPaymentAmount).toHaveBeenCalledWith('');
    });
  });

  describe('handleEditPayment', () => {
    it('populates form with payment data', () => {
      vi.mocked(formatCurrency).mockReturnValue('500,00');
      const props = defaultProps();
      const { result } = renderHook(() => usePaymentHandlers(props));

      result.current.handleEditPayment({
        id: 10,
        method: 'Credito Parcelado',
        type: 'Integral',
        amount: 500,
        installments: '3',
      });

      expect(props.form.setEditingPaymentId).toHaveBeenCalledWith(10);
      expect(props.form.setCurrentPaymentMethod).toHaveBeenCalledWith('Credito Parcelado');
      expect(props.form.setCurrentPaymentAmount).toHaveBeenCalledWith('500,00');
      expect(props.form.setCurrentInstallments).toHaveBeenCalledWith('3');
    });
  });

  describe('handleRemovePayment', () => {
    it('removes payment from list', () => {
      const props = defaultProps({
        form: createForm({
          paymentList: [
            { id: 1, method: 'Pix', amount: 500 },
            { id: 2, method: 'Dinheiro', amount: 300 },
          ],
        }),
      });
      const { result } = renderHook(() => usePaymentHandlers(props));

      result.current.handleRemovePayment(1);

      expect(props.form.setPaymentList).toHaveBeenCalledWith(expect.any(Function));
      const setFn = (props.form.setPaymentList as any).mock.calls[0][0];
      const filtered = setFn(props.form.paymentList);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(2);
    });
  });
});
