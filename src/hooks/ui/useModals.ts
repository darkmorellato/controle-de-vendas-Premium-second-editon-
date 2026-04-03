import { useReducer, useCallback } from 'react';

interface ModalState {
  open: boolean;
  data: unknown;
}

interface ModalAction {
  type: 'OPEN' | 'CLOSE' | 'CLOSE_ALL';
  modal?: string;
  data?: unknown;
}

const modalReducer = (state: Record<string, ModalState>, action: ModalAction): Record<string, ModalState> => {
  switch (action.type) {
    case 'OPEN':
      return { ...state, [action.modal!]: { open: true, data: action.data || null } };
    case 'CLOSE':
      return { ...state, [action.modal!]: { open: false, data: null } };
    case 'CLOSE_ALL':
      return Object.fromEntries(Object.keys(state).map(k => [k, { open: false, data: null }]));
    default:
      return state;
  }
};

const initialModals: Record<string, ModalState> = {
  clientSearch: { open: false, data: null },
  clientHistory: { open: false, data: null },
  clientData: { open: false, data: null },
  managerAuth: { open: false, data: null },
  receipt: { open: false, data: null },
  dateLock: { open: false, data: null },
  backup: { open: false, data: null },
  logout: { open: false, data: null },
  confirmSale: { open: false, data: null },
  confirmChange: { open: false, data: null },
  confirmClientUpdate: { open: false, data: null },
  birthdayAlert: { open: false, data: null },
  commission: { open: false, data: null },
  notifications: { open: false, data: null },
  alert: { open: false, data: null },
};

export function useModals<T extends ModalState = ModalState>() {
  const [modals, dispatch] = useReducer(modalReducer, initialModals);

  const openModal = useCallback((modal: string, data?: unknown) => {
    dispatch({ type: 'OPEN', modal, data });
  }, []);

  const closeModal = useCallback((modal: string) => {
    dispatch({ type: 'CLOSE', modal });
  }, []);

  const isOpen = useCallback((modal: string): boolean => {
    return modals[modal]?.open || false;
  }, [modals]);

  const getModalData = useCallback((modal: string): unknown => {
    return modals[modal]?.data || null;
  }, [modals]);

  const dispatchAction = useCallback((action: ModalAction) => {
    dispatch(action);
  }, []);

  return { modals, openModal, closeModal, isOpen, getModalData, dispatch: dispatchAction };
}

export type { ModalState, ModalAction };