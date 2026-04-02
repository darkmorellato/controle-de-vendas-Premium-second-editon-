import { useSalesContext } from '../contexts/SalesContext.jsx';
import { useClientContext } from '../contexts/ClientContext.jsx';
import { useUIContext } from '../contexts/UIContext.tsx';
import { useAuth } from './useAuth.js';
import { useSaleForm } from './useSaleForm.js';
import { useFilters } from './useFilters.js';
import { useNotifications } from './useNotifications.js';
import { useAppState } from './useAppState.ts';
import { useRoutineHandlers } from './useRoutineHandlers.js';
import { useClientHandlers } from './useClientHandlers.js';
import { useItemHandlers } from './useItemHandlers.js';
import { usePaymentHandlers } from './usePaymentHandlers.js';
import { useSaleHandlers } from './useSaleHandlers.js';
import { useAuthHandlers } from './useAuthHandlers.js';
import { usePrintHandlers } from './usePrintHandlers.js';
import { useBackupHandlers } from './useBackupHandlers.js';

export function useApp() {
  const { sales, loading: salesLoading } = useSalesContext();
  const { clients, loading: clientsLoading } = useClientContext();
  const ui = useUIContext();
  const auth = useAuth();
  const form = useSaleForm();
  const filters = useFilters(sales, clients);
  const notifications = useNotifications(auth.isLoggedIn, sales, clients);
  const appState = useAppState({ 
    sales, 
    clients, 
    isLoggedIn: auth.isLoggedIn, 
    employeeName: auth.settings.employeeName 
  });

  const { toggleRoutine } = useRoutineHandlers({
    routineState: appState.routineState,
    setRoutineState: appState.setRoutineState,
  });

  const clientHandlers = useClientHandlers({
    form: {
      clientName: form.clientName,
      clientCpf: form.clientCpf,
      clientPhone: form.clientPhone,
      clientEmail: form.clientEmail,
      clientDob: form.clientDob,
      clientAddress: form.clientAddress,
      clientNumber: form.clientNumber,
      clientCity: form.clientCity,
      clientZip: form.clientZip,
      clientState: form.clientState,
      clientNeighborhood: form.clientNeighborhood,
      fillClientData: form.fillClientData,
      setClientCpf: form.setClientCpf,
      setClientAddress: form.setClientAddress,
      setClientCity: form.setClientCity,
      setClientState: form.setClientState,
      setClientNeighborhood: form.setClientNeighborhood,
      setClientZip: form.setClientZip,
    },
    clients,
    sales,
    employeeName: auth.settings.employeeName,
    selectedClientForEdit: appState.selectedClientForEdit,
    setSelectedClientForEdit: appState.setSelectedClientForEdit,
    openModal: ui.openModal,
    closeModal: ui.closeModal,
    showToast: ui.showToast,
  });

  const itemHandlers = useItemHandlers({
    form: {
      category: form.category,
      newItemQty: form.newItemQty,
      newItemType: form.newItemType,
      newItemDesc: form.newItemDesc,
      newItemRam: form.newItemRam,
      newItemColor: form.newItemColor,
      newItemImei: form.newItemImei,
      newItemFinanced: form.newItemFinanced,
      newItemPrice: form.newItemPrice,
      newItemDiscount: form.newItemDiscount,
      newItemDiscountPercent: form.newItemDiscountPercent,
      editingItemId: form.editingItemId,
      exchangeAction: form.exchangeAction,
      items: form.items,
      setItems: form.setItems,
      setNewItemQty: form.setNewItemQty,
      setNewItemType: form.setNewItemType,
      setNewItemDesc: form.setNewItemDesc,
      setNewItemRam: form.setNewItemRam,
      setNewItemColor: form.setNewItemColor,
      setNewItemImei: form.setNewItemImei,
      setNewItemFinanced: form.setNewItemFinanced,
      setNewItemPrice: form.setNewItemPrice,
      setNewItemDiscount: form.setNewItemDiscount,
      setNewItemDiscountPercent: form.setNewItemDiscountPercent,
      setEditingItemId: form.setEditingItemId,
    },
    sales,
    editingId: form.editingId,
    showToast: ui.showToast,
  });

  const paymentHandlers = usePaymentHandlers({
    form: {
      currentPaymentMethod: form.currentPaymentMethod,
      currentPaymentType: form.currentPaymentType,
      currentPaymentAmount: form.currentPaymentAmount,
      currentInstallments: form.currentInstallments,
      editingPaymentId: form.editingPaymentId,
      paymentList: form.paymentList,
      setCurrentPaymentMethod: form.setCurrentPaymentMethod,
      setCurrentPaymentType: form.setCurrentPaymentType,
      setCurrentPaymentAmount: form.setCurrentPaymentAmount,
      setCurrentInstallments: form.setCurrentInstallments,
      setEditingPaymentId: form.setEditingPaymentId,
      setPaymentList: form.setPaymentList,
    },
    category: form.category,
    showToast: ui.showToast,
  });

  const saleHandlers = useSaleHandlers({
    form: {
      date: form.date,
      clientName: form.clientName,
      clientCpf: form.clientCpf,
      clientPhone: form.clientPhone,
      clientEmail: form.clientEmail,
      clientDob: form.clientDob,
      clientAddress: form.clientAddress,
      clientNumber: form.clientNumber,
      clientCity: form.clientCity,
      clientZip: form.clientZip,
      clientState: form.clientState,
      clientNeighborhood: form.clientNeighborhood,
      category: form.category,
      items: form.items,
      finalTotal: form.finalTotal,
      totalDiscount: form.totalDiscount,
      paymentList: form.paymentList,
      totalPaid: form.totalPaid,
      changeAmount: form.changeAmount,
      originalEmployeeName: form.originalEmployeeName,
      clientSource: form.clientSource,
      paymentObservation: form.paymentObservation,
      editingId: form.editingId,
    },
    authSettings: auth.settings,
    openModal: ui.openModal,
    closeModal: ui.closeModal,
    showToast: ui.showToast,
    resetForm: form.resetForm,
    handleSaveClient: clientHandlers.handleSaveClient,
  });

  const { handleManagerAuth } = useAuthHandlers({
    managerPassword: appState.managerPassword,
    pendingAuthAction: appState.pendingAuthAction,
    pendingEditItem: appState.pendingEditItem,
    closeModal: ui.closeModal,
    showToast: ui.showToast,
    performSave: saleHandlers.performSave,
    performDelete: saleHandlers.performDelete,
    performClientUpdate: clientHandlers.performClientUpdate,
    startEdit: form.startEdit,
    setManagerPassword: appState.setManagerPassword,
    setPendingAuthAction: appState.setPendingAuthAction,
    setPendingEditItem: appState.setPendingEditItem,
  });

  const printHandlers = usePrintHandlers({
    currentReceipt: appState.currentReceipt,
    showToast: ui.showToast,
    setItemsPerPage: filters.setItemsPerPage,
    setCurrentReceipt: appState.setCurrentReceipt,
    openModal: ui.openModal,
  });

  const backupHandlers = useBackupHandlers({
    sales,
    clients,
    authSettings: auth.settings,
    modals: ui.modals,
    closeModal: ui.closeModal,
    showToast: ui.showToast,
    fileInputRef: appState.fileInputRef,
  });

  return {
    sales,
    salesLoading,
    clients,
    clientsLoading,
    ui,
    auth,
    form,
    filters,
    notifications,
    appState,
    handlers: {
      toggleRoutine,
      clientHandlers,
      itemHandlers,
      paymentHandlers,
      saleHandlers,
      handleManagerAuth,
      printHandlers,
      backupHandlers,
    },
  };
}
