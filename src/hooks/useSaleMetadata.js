import { useReducer, useCallback } from 'react';

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const makeInitial = () => ({
  date: getToday(),
  isDateLocked: true,
  editingId: null,
  originalEmployeeName: null,
  category: '',
  clientSource: '',
  paymentObservation: '',
});

/**
 * @param {ReturnType<typeof makeInitial>} state
 * @param {{ type: string }} action
 */
function metaReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'LOAD_EDIT':
      return {
        ...state,
        editingId:            action.sale.id,
        originalEmployeeName: action.sale.employeeName || null,
        date:                 action.sale.date,
        category:             action.sale.category,
        clientSource:         action.sale.clientSource         || '',
        paymentObservation:   action.sale.paymentObservation   || '',
        isDateLocked:         true,
      };
    case 'RESET':
      return makeInitial();
    default:
      return state;
  }
}

/**
 * Gerencia os metadados da venda: data, categoria, id de edição e campos de observação.
 * Separado de cliente/item/pagamento para que mudanças na data ou categoria
 * não causem re-renders nos outros sub-hooks.
 */
export function useSaleMetadata() {
  const [state, dispatch] = useReducer(metaReducer, undefined, makeInitial);

  const setDate                = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'date',                value: v }), []);
  const setIsDateLocked        = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'isDateLocked',        value: v }), []);
  const setEditingId           = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'editingId',           value: v }), []);
  const setOriginalEmployeeName= useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'originalEmployeeName',value: v }), []);
  const setCategory            = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'category',            value: v }), []);
  const setClientSource        = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'clientSource',        value: v }), []);
  const setPaymentObservation  = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'paymentObservation',  value: v }), []);

  /** Carrega metadados de uma venda existente para edição */
  const loadFromSale = useCallback((sale) => dispatch({ type: 'LOAD_EDIT', sale }), []);

  /** Reseta para os valores iniciais (preserva data como hoje) */
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    ...state,
    setDate, setIsDateLocked, setEditingId, setOriginalEmployeeName,
    setCategory, setClientSource, setPaymentObservation,
    loadFromSale, reset,
  };
}
