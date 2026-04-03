// Core hooks
export { useApp }           from './core/useApp.ts';
export { useAuth }          from './core/useAuth.ts';
export { useSaleForm }      from './core/useSaleForm.ts';

// Form sub-hooks
export { useSaleMetadata }  from './form/useSaleMetadata.ts';
export { useClientForm }    from './form/useClientForm.ts';
export { useItemForm }      from './form/useItemForm.ts';
export { usePaymentForm }   from './form/usePaymentForm.ts';

// Operations (unified, no duplication)
export { useClientOperations } from './operations/useClientOperations.ts';
export { useRoutineAlerts }    from './operations/useRoutineAlerts.ts';

// Data hooks
export { useSalesQuery }    from './data/useSalesQuery.ts';
export { useClientsQuery }  from './data/useClientsQuery.ts';
export { useSalesMutations, useClientMutations } from './data/useMutations.ts';

// UI hooks
export { useFilters }       from './ui/useFilters.ts';
export { useNotifications } from './ui/useNotifications.ts';
export { useModals }        from './ui/useModals.ts';
export { useHeaderCalculations } from './ui/useHeaderCalculations.ts';
export { useAppState }      from './ui/useAppState.ts';

// Handler hooks (still at root level)
export { useItemHandlers }     from './useItemHandlers.js';
export { usePaymentHandlers }  from './usePaymentHandlers.js';
export { useSaleHandlers }     from './useSaleHandlers.js';
export { useAuthHandlers }     from './useAuthHandlers.js';
export { usePrintHandlers }    from './usePrintHandlers.js';
export { useBackupHandlers }   from './useBackupHandlers.js';
export { useRoutineHandlers }  from './useRoutineHandlers.js';

// Utility hooks
export {
  useLocalStorage, useDebounce, useOnlineStatus, useInterval,
  useClipboard, useDeviceType, useFormState, useNotification,
  useTheme, useFilter, usePagination, useKeyPress, useKeyCombo,
} from './utils/utilityHooks.ts';
