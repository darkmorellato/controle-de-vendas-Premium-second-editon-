import { useReducer, useCallback } from 'react';

const initialState = {
  paymentList: [],
  editingPaymentId: null,
  currentPaymentMethod: '',
  currentPaymentType: '',
  currentPaymentAmount: '',
  currentInstallments: '',
};

/**
 * @param {typeof initialState} state
 * @param {{ type: string }} action
 */
function paymentReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };

    case 'SET_PAYMENT_LIST':
      return { ...state, paymentList: action.paymentList };

    case 'ADD_PAYMENT':
      return { ...state, paymentList: [...state.paymentList, action.payment] };

    case 'UPDATE_PAYMENT':
      return {
        ...state,
        paymentList: state.paymentList.map((p) =>
          p.id === action.payment.id ? action.payment : p,
        ),
        editingPaymentId: null,
      };

    case 'REMOVE_PAYMENT':
      return { ...state, paymentList: state.paymentList.filter((p) => p.id !== action.id) };

    case 'START_EDIT_PAYMENT': {
      const p = action.payment;
      return {
        ...state,
        editingPaymentId:      p.id,
        currentPaymentMethod:  p.method,
        currentPaymentType:    p.type || '',
        currentPaymentAmount:  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(p.amount),
        currentInstallments:   p.installments || '',
      };
    }

    case 'CLEAR_PAYMENT_FORM':
      return {
        ...state,
        editingPaymentId: null,
        currentPaymentMethod: '',
        currentPaymentType: '',
        currentPaymentAmount: '',
        currentInstallments: '',
      };

    case 'LOAD_EDIT':
      return { ...state, paymentList: action.payments || [] };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

/**
 * Gerencia a lista de pagamentos e o formulário de novo pagamento.
 * Isolado dos campos de cliente e item para evitar re-renders desnecessários.
 */
export function usePaymentForm() {
  const [state, dispatch] = useReducer(paymentReducer, initialState);

  // Setters de campos do formulário
  const setCurrentPaymentMethod  = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'currentPaymentMethod',  value: v }), []);
  const setCurrentPaymentType    = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'currentPaymentType',    value: v }), []);
  const setCurrentPaymentAmount  = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'currentPaymentAmount',  value: v }), []);
  const setCurrentInstallments   = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'currentInstallments',   value: v }), []);
  const setEditingPaymentId      = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'editingPaymentId',      value: v }), []);

  // Operações sobre a lista de pagamentos
  const setPaymentList   = useCallback((list) => dispatch({ type: 'SET_PAYMENT_LIST', paymentList: typeof list === 'function' ? list(state.paymentList) : list }), [state.paymentList]);
  const addPayment       = useCallback((payment) => dispatch({ type: 'ADD_PAYMENT',    payment }), []);
  const updatePayment    = useCallback((payment) => dispatch({ type: 'UPDATE_PAYMENT', payment }), []);
  const removePayment    = useCallback((id)      => dispatch({ type: 'REMOVE_PAYMENT', id }), []);

  /** Inicia edição de um pagamento existente — popula os campos do form */
  const handleEditPayment = useCallback((payment) => {
    dispatch({ type: 'START_EDIT_PAYMENT', payment });
  }, []);

  /** Limpa os campos do formulário de pagamento sem apagar a lista */
  const clearPaymentForm = useCallback(() => dispatch({ type: 'CLEAR_PAYMENT_FORM' }), []);

  /** Carrega pagamentos de uma venda existente para edição */
  const loadFromSale = useCallback((sale) => dispatch({ type: 'LOAD_EDIT', payments: sale.payments }), []);

  /** Limpa tudo */
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    ...state,
    setCurrentPaymentMethod, setCurrentPaymentType, setCurrentPaymentAmount,
    setCurrentInstallments, setEditingPaymentId,
    setPaymentList, addPayment, updatePayment, removePayment,
    handleEditPayment, clearPaymentForm, loadFromSale, reset,
  };
}
