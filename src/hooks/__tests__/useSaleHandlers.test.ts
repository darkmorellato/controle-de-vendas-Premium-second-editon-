import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('../../services/index.js', () => ({
  salesService: {
    save: vi.fn(async () => {}),
    delete: vi.fn(async () => {}),
    generateId: vi.fn(() => 'new-sale-id'),
  },
  clientService: {},
  authService: {},
}));

import { salesService } from '../../services/index.js';
import { useSaleHandlers } from '../useSaleHandlers.ts';

const createForm = (overrides = {}) => ({
  date: '2025-03-01',
  clientName: 'João',
  clientCpf: '123.456.789-00',
  clientPhone: '(11) 99999-0000',
  clientEmail: 'joao@test.com',
  clientDob: '1990-01-01',
  clientAddress: 'Rua Teste',
  clientNumber: '123',
  clientCity: 'São Paulo',
  clientZip: '01001-000',
  clientState: 'SP',
  clientNeighborhood: 'Centro',
  category: 'Venda',
  items: [{ id: 1, type: 'SAMSUNG', quantity: 1, unitPrice: 1000, description: 'Galaxy A54' }],
  finalTotal: 1000,
  totalDiscount: 0,
  paymentList: [{ id: 1, method: 'Pix', type: 'Integral', amount: 1000 }],
  totalPaid: 1000,
  changeAmount: 0,
  originalEmployeeName: 'joao',
  clientSource: 'Loja',
  paymentObservation: '',
  editingId: null,
  ...overrides,
});

const defaultProps = (overrides = {}) => ({
  form: createForm(),
  authSettings: { employeeName: 'joao', currency: 'R$' },
  openModal: vi.fn(),
  closeModal: vi.fn(),
  showToast: vi.fn(),
  resetForm: vi.fn(),
  handleSaveClient: vi.fn(async () => 'client-123'),
  ...overrides,
});

describe('useSaleHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('performSave', () => {
    it('saves a new sale and shows receipt', async () => {
      const props = defaultProps();
      const { result } = renderHook(() => useSaleHandlers(props));

      await result.current.performSave();

      expect(salesService.generateId).toHaveBeenCalled();
      expect(salesService.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'new-sale-id',
          amount: 1000,
          clientName: 'João',
          employeeName: 'joao',
        })
      );
      expect(props.showToast).toHaveBeenCalledWith('Venda registrada!');
      expect(props.openModal).toHaveBeenCalledWith('receipt', expect.anything());
      expect(props.resetForm).toHaveBeenCalled();
    });

    it('updates existing sale when editingId is set', async () => {
      const props = defaultProps({
        form: createForm({ editingId: 'existing-sale' }),
      });
      const { result } = renderHook(() => useSaleHandlers(props));

      await result.current.performSave();

      expect(salesService.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'existing-sale' })
      );
      expect(props.showToast).toHaveBeenCalledWith('Atualizado!');
      expect(props.openModal).not.toHaveBeenCalled();
    });

    it('shows error toast when save fails', async () => {
      vi.mocked(salesService.save).mockRejectedValueOnce(new Error('Network error'));
      const props = defaultProps();
      const { result } = renderHook(() => useSaleHandlers(props));

      await result.current.performSave();
      await new Promise((r) => setTimeout(r, 0));

      expect(props.showToast).toHaveBeenCalledWith('Erro: Network error', 'error');
    });

    it('skips client save when clientName is empty', async () => {
      const handleSaveClient = vi.fn(async () => 'client-123');
      const props = defaultProps({
        form: createForm({ clientName: '' }),
        handleSaveClient,
      });
      const { result } = renderHook(() => useSaleHandlers(props));

      await result.current.performSave();

      expect(handleSaveClient).not.toHaveBeenCalled();
    });
  });

  describe('performDelete', () => {
    it('deletes sale when editingId is set', async () => {
      const props = defaultProps({ form: createForm({ editingId: 'sale-1' }) });
      const { result } = renderHook(() => useSaleHandlers(props));

      await result.current.performDelete();

      expect(salesService.delete).toHaveBeenCalledWith('sale-1');
      expect(props.showToast).toHaveBeenCalledWith('Excluído!', 'error');
      expect(props.resetForm).toHaveBeenCalled();
    });

    it('does nothing when not editing', async () => {
      const props = defaultProps({ form: createForm({ editingId: null }) });
      const { result } = renderHook(() => useSaleHandlers(props));

      await result.current.performDelete();

      expect(salesService.delete).not.toHaveBeenCalled();
    });
  });

  describe('handleSubmit', () => {
    it('shows error when no items added', () => {
      const props = defaultProps({ form: createForm({ items: [] }) });
      const { result } = renderHook(() => useSaleHandlers(props));

      result.current.handleSubmit({ preventDefault: vi.fn() } as any);

      expect(props.showToast).toHaveBeenCalledWith('Adicione itens!', 'error');
    });

    it('shows error when payment is insufficient', () => {
      const props = defaultProps({
        form: createForm({ finalTotal: 1000, totalPaid: 500, changeAmount: 0 }),
      });
      const { result } = renderHook(() => useSaleHandlers(props));

      result.current.handleSubmit({ preventDefault: vi.fn() } as any);

      expect(props.showToast).toHaveBeenCalledWith('Valor pago insuficiente.', 'error');
    });

    it('opens confirmChange modal when change is due', () => {
      const props = defaultProps({
        form: createForm({ finalTotal: 1000, totalPaid: 1100, changeAmount: 100 }),
      });
      const { result } = renderHook(() => useSaleHandlers(props));

      result.current.handleSubmit({ preventDefault: vi.fn() } as any);

      expect(props.openModal).toHaveBeenCalledWith('confirmChange');
    });

    it('opens confirmSale modal when payment is sufficient', () => {
      const props = defaultProps({
        form: createForm({ finalTotal: 1000, totalPaid: 1000, changeAmount: 0 }),
      });
      const { result } = renderHook(() => useSaleHandlers(props));

      result.current.handleSubmit({ preventDefault: vi.fn() } as any);

      expect(props.openModal).toHaveBeenCalledWith('confirmSale');
    });

    it('allows refund sales with negative total', () => {
      const props = defaultProps({
        form: createForm({ finalTotal: -500, totalPaid: 0, changeAmount: 0 }),
      });
      const { result } = renderHook(() => useSaleHandlers(props));

      result.current.handleSubmit({ preventDefault: vi.fn() } as any);

      expect(props.openModal).toHaveBeenCalledWith('confirmSale');
    });
  });

  describe('confirmSave', () => {
    it('closes confirmSale modal and performs save', async () => {
      const props = defaultProps();
      const { result } = renderHook(() => useSaleHandlers(props));

      result.current.confirmSave();

      expect(props.closeModal).toHaveBeenCalledWith('confirmSale');
    });
  });

  describe('confirmChange', () => {
    it('closes confirmChange and opens confirmSale', () => {
      const props = defaultProps();
      const { result } = renderHook(() => useSaleHandlers(props));

      result.current.confirmChange();

      expect(props.closeModal).toHaveBeenCalledWith('confirmChange');
      expect(props.openModal).toHaveBeenCalledWith('confirmSale');
    });
  });
});
