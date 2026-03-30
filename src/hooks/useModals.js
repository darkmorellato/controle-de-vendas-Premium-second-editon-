import { useReducer, useCallback } from 'react';

const modalReducer = (state, action) => {
    switch (action.type) {
        case 'OPEN':
            return { ...state, [action.modal]: { open: true, data: action.data || null } };
        case 'CLOSE':
            return { ...state, [action.modal]: { open: false, data: null } };
        case 'CLOSE_ALL':
            return Object.fromEntries(Object.keys(state).map(k => [k, { open: false, data: null }]));
        default:
            return state;
    }
};

const initialModals = {
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

export function useModals() {
    const [modals, dispatch] = useReducer(modalReducer, initialModals);

    const openModal = useCallback((modal, data) => {
        dispatch({ type: 'OPEN', modal, data });
    }, []);

    const closeModal = useCallback((modal) => {
        dispatch({ type: 'CLOSE', modal });
    }, []);

    const isOpen = useCallback((modal) => {
        return modals[modal]?.open || false;
    }, [modals]);

    const getModalData = useCallback((modal) => {
        return modals[modal]?.data || null;
    }, [modals]);

    return { modals, openModal, closeModal, isOpen, getModalData, dispatch };
}
