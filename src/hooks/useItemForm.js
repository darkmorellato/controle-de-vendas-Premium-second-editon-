import { useReducer, useCallback } from 'react';

const initialState = {
  items: [],
  editingItemId: null,
  exchangeAction: 'out',
  // Campos do formulário de novo item
  newItemQty: 1,
  newItemType: '',
  newItemDesc: '',
  newItemRam: '',
  newItemColor: '',
  newItemImei: '',
  newItemFinanced: 'Não',
  newItemPrice: '',
  newItemDiscount: '',
  newItemDiscountPercent: '',
};

/**
 * @param {typeof initialState} state
 * @param {{ type: string }} action
 */
function itemReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };

    case 'SET_ITEMS':
      return { ...state, items: action.items };

    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.item] };

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.item.id ? action.item : i)),
        editingItemId: null,
      };

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };

    case 'START_EDIT_ITEM': {
      const item = action.item;
      const absPrice = Math.abs(item.unitPrice);
      const absDisc  = Math.abs(item.discount || 0);
      return {
        ...state,
        editingItemId:          item.id,
        newItemQty:             item.quantity,
        newItemType:            item.type,
        newItemDesc:            item.description,
        newItemRam:             item.ram_storage || '',
        newItemColor:           item.color || '',
        newItemImei:            item.imei || '',
        newItemFinanced:        item.financed || 'Não',
        newItemPrice:           new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(absPrice),
        newItemDiscount:        new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(absDisc),
        newItemDiscountPercent: absPrice > 0
          ? ((absDisc / (absPrice * item.quantity)) * 100).toFixed(2).replace('.', ',')
          : '',
      };
    }

    case 'CLEAR_ITEM_FORM':
      return {
        ...state,
        editingItemId: null,
        newItemQty: 1, newItemType: '', newItemDesc: '', newItemRam: '',
        newItemColor: '', newItemImei: '', newItemFinanced: 'Não',
        newItemPrice: '', newItemDiscount: '', newItemDiscountPercent: '',
      };

    case 'LOAD_EDIT':
      return { ...state, items: action.items || [] };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

/**
 * Gerencia a lista de itens e o formulário de novo item.
 * Usar useReducer aqui evita re-renders de campos de cliente e pagamento
 * a cada keystroke nos campos de item.
 */
export function useItemForm() {
  const [state, dispatch] = useReducer(itemReducer, initialState);

  // Setters de campos individuais
  const setNewItemQty             = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'newItemQty',             value: v }), []);
  const setNewItemType            = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'newItemType',            value: v }), []);
  const setNewItemDesc            = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'newItemDesc',            value: v }), []);
  const setNewItemRam             = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'newItemRam',             value: v }), []);
  const setNewItemColor           = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'newItemColor',           value: v }), []);
  const setNewItemImei            = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'newItemImei',            value: v }), []);
  const setNewItemFinanced        = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'newItemFinanced',        value: v }), []);
  const setNewItemPrice           = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'newItemPrice',           value: v }), []);
  const setNewItemDiscount        = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'newItemDiscount',        value: v }), []);
  const setNewItemDiscountPercent = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'newItemDiscountPercent', value: v }), []);
  const setEditingItemId          = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'editingItemId',          value: v }), []);
  const setExchangeAction         = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'exchangeAction',         value: v }), []);

  // Operações sobre a lista de itens
  const setItems    = useCallback((items) => dispatch({ type: 'SET_ITEMS', items: typeof items === 'function' ? items(state.items) : items }), [state.items]);
  const addItem     = useCallback((item)  => dispatch({ type: 'ADD_ITEM',  item }), []);
  const updateItem  = useCallback((item)  => dispatch({ type: 'UPDATE_ITEM', item }), []);
  const removeItem  = useCallback((id)    => dispatch({ type: 'REMOVE_ITEM', id }), []);

  /** Inicia edição de um item existente — popula os campos do form */
  const handleEditItem = useCallback((item) => {
    dispatch({ type: 'START_EDIT_ITEM', item });
    setTimeout(() => {
      const el = document.getElementById('item-form-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  /** Limpa os campos do formulário de item sem apagar a lista */
  const clearItemForm = useCallback(() => dispatch({ type: 'CLEAR_ITEM_FORM' }), []);

  /** Carrega itens de uma venda existente para edição */
  const loadFromSale = useCallback((sale) => dispatch({ type: 'LOAD_EDIT', items: sale.items }), []);

  /** Limpa tudo */
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    ...state,
    setNewItemQty, setNewItemType, setNewItemDesc, setNewItemRam, setNewItemColor,
    setNewItemImei, setNewItemFinanced, setNewItemPrice, setNewItemDiscount,
    setNewItemDiscountPercent, setEditingItemId, setExchangeAction,
    setItems, addItem, updateItem, removeItem,
    handleEditItem, clearItemForm, loadFromSale, reset,
  };
}
