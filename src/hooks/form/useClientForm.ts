import { useReducer, useCallback } from 'react';

const initialState = {
  clientName: '',
  clientCpf: '',
  clientPhone: '',
  clientEmail: '',
  clientDob: '',
  clientAddress: '',
  clientNumber: '',
  clientCity: '',
  clientZip: '',
  clientState: '',
  clientNeighborhood: '',
};

/**
 * @param {typeof initialState} state
 * @param {{ type: string, field?: string, value?: string, data?: Partial<typeof initialState> }} action
 */
function clientReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'FILL':
      return {
        ...state,
        clientName:         action.data.name         ?? state.clientName,
        clientCpf:          action.data.cpf          ?? state.clientCpf,
        clientPhone:        action.data.phone        ?? state.clientPhone,
        clientEmail:        action.data.email        ?? state.clientEmail,
        clientDob:          action.data.dob          ?? state.clientDob,
        clientAddress:      action.data.address      ?? state.clientAddress,
        clientNumber:       action.data.number       ?? state.clientNumber,
        clientNeighborhood: action.data.neighborhood ?? state.clientNeighborhood,
        clientCity:         action.data.city         ?? state.clientCity,
        clientZip:          action.data.zip          ?? state.clientZip,
        clientState:        action.data.state        ?? state.clientState,
      };
    case 'LOAD_EDIT':
      return {
        clientName:         action.sale.clientName         || '',
        clientCpf:          action.sale.clientCpf          || '',
        clientPhone:        action.sale.clientPhone        || '',
        clientEmail:        action.sale.clientEmail        || '',
        clientDob:          action.sale.clientDob          || '',
        clientAddress:      action.sale.clientAddress      || '',
        clientNumber:       action.sale.clientNumber       || '',
        clientNeighborhood: action.sale.clientNeighborhood || '',
        clientCity:         action.sale.clientCity         || '',
        clientZip:          action.sale.clientZip          || '',
        clientState:        action.sale.clientState        || '',
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

/**
 * Gerencia os 11 campos de dados do cliente no formulário de venda.
 * Usa useReducer para agrupar state relacionado e evitar re-renders
 * causados por mudanças em outras partes do formulário (itens, pagamentos).
 */
export function useClientForm() {
  const [state, dispatch] = useReducer(clientReducer, initialState);

  // Setters individuais — mesma API que o useState anterior, sem quebrar App.jsx
  const setClientName         = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'clientName',         value: v }), []);
  const setClientCpf          = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'clientCpf',          value: v }), []);
  const setClientPhone        = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'clientPhone',        value: v }), []);
  const setClientEmail        = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'clientEmail',        value: v }), []);
  const setClientDob          = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'clientDob',          value: v }), []);
  const setClientAddress      = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'clientAddress',      value: v }), []);
  const setClientNumber       = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'clientNumber',       value: v }), []);
  const setClientCity         = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'clientCity',         value: v }), []);
  const setClientZip          = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'clientZip',          value: v }), []);
  const setClientState        = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'clientState',        value: v }), []);
  const setClientNeighborhood = useCallback((v) => dispatch({ type: 'SET_FIELD', field: 'clientNeighborhood', value: v }), []);

  /** Preenche todos os campos a partir de um objeto Client do Firestore */
  const fillClientData = useCallback((client) => dispatch({ type: 'FILL', data: client }), []);

  /** Carrega dados de uma venda existente para edição */
  const loadFromSale = useCallback((sale) => dispatch({ type: 'LOAD_EDIT', sale }), []);

  /** Limpa todos os campos */
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    ...state,
    setClientName, setClientCpf, setClientPhone, setClientEmail, setClientDob,
    setClientAddress, setClientNumber, setClientCity, setClientZip,
    setClientState, setClientNeighborhood,
    fillClientData, loadFromSale, reset,
  };
}
