import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('../../utils.js', () => ({
  parseCurrency: vi.fn((val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat(String(val).replace(/\./g, '').replace(',', '.')) || 0;
  }),
  formatCurrency: vi.fn((val) => Number(val).toFixed(2).replace('.', ',')),
  generateLocalId: vi.fn(() => 12345),
}));

import { parseCurrency, formatCurrency } from '../../utils.js';
import { useItemHandlers } from '../useItemHandlers.ts';

const createForm = (overrides = {}) => ({
  category: 'Venda',
  newItemQty: 1,
  newItemType: '',
  newItemDesc: '',
  newItemRam: '',
  newItemColor: '',
  newItemImei: '',
  newItemFinanced: 'Não' as const,
  newItemPrice: '',
  newItemDiscount: '',
  newItemDiscountPercent: '',
  editingItemId: null as number | null,
  exchangeAction: '',
  items: [] as any[],
  setItems: vi.fn(),
  setNewItemQty: vi.fn(),
  setNewItemType: vi.fn(),
  setNewItemDesc: vi.fn(),
  setNewItemRam: vi.fn(),
  setNewItemColor: vi.fn(),
  setNewItemImei: vi.fn(),
  setNewItemFinanced: vi.fn(),
  setNewItemPrice: vi.fn(),
  setNewItemDiscount: vi.fn(),
  setNewItemDiscountPercent: vi.fn(),
  setEditingItemId: vi.fn(),
  ...overrides,
});

const defaultProps = (overrides = {}) => ({
  form: createForm(),
  sales: [],
  editingId: null,
  showToast: vi.fn(),
  ...overrides,
});

describe('useItemHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleAddItem', () => {
    it('shows error when category is not selected', () => {
      const props = defaultProps({ form: createForm({ category: '' }) });
      const { result } = renderHook(() => useItemHandlers(props));

      result.current.handleAddItem();

      expect(props.showToast).toHaveBeenCalledWith('Selecione a Categoria primeiro', 'error');
    });

    it('shows error when item type is not selected', () => {
      const props = defaultProps({ form: createForm({ category: 'Venda', newItemType: '' }) });
      const { result } = renderHook(() => useItemHandlers(props));

      result.current.handleAddItem();

      expect(props.showToast).toHaveBeenCalledWith('Selecione o Tipo do item', 'error');
    });

    it('shows error when description or price is empty', () => {
      const props = defaultProps({
        form: createForm({
          category: 'Venda',
          newItemType: 'SAMSUNG',
          newItemDesc: '',
          newItemPrice: '',
        }),
      });
      const { result } = renderHook(() => useItemHandlers(props));

      result.current.handleAddItem();

      expect(props.showToast).toHaveBeenCalledWith('Preencha Descrição e Preço', 'error');
    });

    it('shows error when IMEI is already in current sale', () => {
      const props = defaultProps({
        form: createForm({
          category: 'Venda',
          newItemType: 'SAMSUNG',
          newItemDesc: 'Galaxy A54',
          newItemPrice: '1.000,00',
          newItemImei: '123456789012345',
          items: [{ id: 1, imei: '123456789012345' }],
          editingItemId: null,
        }),
      });
      const { result } = renderHook(() => useItemHandlers(props));

      result.current.handleAddItem();

      expect(props.showToast).toHaveBeenCalledWith('⚠️ IMEI já adicionado nesta venda!', 'error');
    });

    it('shows error when IMEI is registered in another sale', () => {
      const props = defaultProps({
        form: createForm({
          category: 'Venda',
          newItemType: 'SAMSUNG',
          newItemDesc: 'Galaxy A54',
          newItemPrice: '1.000,00',
          newItemImei: '123456789012345',
        }),
        sales: [{ id: 's1', items: [{ imei: '123456789012345' }] }],
        editingId: null,
      });
      const { result } = renderHook(() => useItemHandlers(props));

      result.current.handleAddItem();

      expect(props.showToast).toHaveBeenCalledWith('⚠️ IMEI já registrado em outra venda!', 'error');
    });

    it('adds new item to form', () => {
      vi.mocked(parseCurrency).mockReturnValue(1000);
      const props = defaultProps({
        form: createForm({
          category: 'Venda',
          newItemType: 'SAMSUNG',
          newItemDesc: 'Galaxy A54',
          newItemPrice: '1.000,00',
          items: [],
        }),
      });
      const { result } = renderHook(() => useItemHandlers(props));

      result.current.handleAddItem();

      expect(props.form.setItems).toHaveBeenCalledWith(expect.any(Function));
      const setItemsFn = (props.form.setItems as any).mock.calls[0][0];
      const newItems = setItemsFn([]);
      expect(newItems).toHaveLength(1);
      expect(newItems[0].type).toBe('SAMSUNG');
      expect(newItems[0].description).toBe('Galaxy A54');
      expect(newItems[0].unitPrice).toBe(1000);
    });

    it('negates price for Devolucao category', () => {
      vi.mocked(parseCurrency).mockReturnValue(500);
      const props = defaultProps({
        form: createForm({
          category: 'Devolução',
          newItemType: 'SAMSUNG',
          newItemDesc: 'Galaxy A54',
          newItemPrice: '500,00',
        }),
      });
      const { result } = renderHook(() => useItemHandlers(props));

      result.current.handleAddItem();

      const setItemsFn = (props.form.setItems as any).mock.calls[0][0];
      const newItems = setItemsFn([]);
      expect(newItems[0].unitPrice).toBe(-500);
    });

    it('edits existing item when editingItemId is set', () => {
      vi.mocked(parseCurrency).mockReturnValue(1200);
      const existingItem = { id: 5, type: 'IPHONE', description: 'iPhone 14', unitPrice: 1000 };
      const props = defaultProps({
        form: createForm({
          category: 'Venda',
          newItemType: 'SAMSUNG',
          newItemDesc: 'Galaxy S24',
          newItemPrice: '1.200,00',
          editingItemId: 5,
          items: [existingItem],
        }),
      });
      const { result } = renderHook(() => useItemHandlers(props));

      result.current.handleAddItem();

      expect(props.form.setItems).toHaveBeenCalledWith(expect.any(Function));
      expect(props.form.setEditingItemId).toHaveBeenCalledWith(null);
      expect(props.form.setNewItemQty).toHaveBeenCalledWith(1);
    });

    it('resets form fields after adding item', () => {
      const props = defaultProps({
        form: createForm({
          category: 'Venda',
          newItemType: 'SAMSUNG',
          newItemDesc: 'Galaxy A54',
          newItemPrice: '1.000,00',
        }),
      });
      const { result } = renderHook(() => useItemHandlers(props));

      result.current.handleAddItem();

      expect(props.form.setNewItemQty).toHaveBeenCalledWith(1);
      expect(props.form.setNewItemType).toHaveBeenCalledWith('');
      expect(props.form.setNewItemDesc).toHaveBeenCalledWith('');
      expect(props.form.setNewItemPrice).toHaveBeenCalledWith('');
    });
  });

  describe('handleEditItem', () => {
    it('populates form with item data', () => {
      vi.mocked(formatCurrency).mockReturnValue('1.000,00');
      const props = defaultProps();
      const { result } = renderHook(() => useItemHandlers(props));

      result.current.handleEditItem({
        id: 5,
        quantity: 2,
        type: 'SAMSUNG',
        description: 'Galaxy A54',
        ram_storage: '128GB',
        color: 'Preto',
        imei: '123456789012345',
        financed: 'Não',
        unitPrice: 1000,
        discount: 50,
      });

      expect(props.form.setEditingItemId).toHaveBeenCalledWith(5);
      expect(props.form.setNewItemQty).toHaveBeenCalledWith(2);
      expect(props.form.setNewItemType).toHaveBeenCalledWith('SAMSUNG');
      expect(props.form.setNewItemDesc).toHaveBeenCalledWith('Galaxy A54');
      expect(props.form.setNewItemColor).toHaveBeenCalledWith('Preto');
    });
  });
});
