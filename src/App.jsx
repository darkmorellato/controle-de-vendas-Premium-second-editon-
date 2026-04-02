import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react';
import Icons from './components/Icons.jsx';
import PageLoader from './components/PageLoader.tsx';
import LoginScreen from './components/views/LoginScreen.jsx';
import Header from './components/views/Header.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import SimpleCalendar from './components/SimpleCalendar.jsx';
import TaskAlertModal from './components/TaskAlertModal.jsx';

const ClientsView = lazy(() => import('./components/views/ClientsView.jsx'));
const ReferralsView = lazy(() => import('./components/views/ReferralsView.jsx'));
const ManagerView = lazy(() => import('./components/views/ManagerView.jsx'));
const PerformanceView = lazy(() => import('./components/views/PerformanceView.jsx'));
const SalesForm = lazy(() => import('./components/views/SalesForm.jsx'));
const SalesList = lazy(() => import('./components/views/SalesList.jsx'));
const ReceiptModalLazy = lazy(() => import('./components/modals/ReceiptModal.jsx'));
const BackupModalLazy = lazy(() => import('./components/modals/BackupModal.jsx'));
const LogoutModalLazy = lazy(() => import('./components/modals/LogoutModal.jsx'));
const ConfirmSaleModalLazy = lazy(() => import('./components/modals/ConfirmSaleModal.jsx'));
const ConfirmChangeModalLazy = lazy(() => import('./components/modals/ConfirmChangeModal.jsx'));
const DateLockModalLazy = lazy(() => import('./components/modals/DateLockModal.jsx'));
const ClientSearchModalLazy = lazy(() => import('./components/modals/ClientSearchModal.jsx'));
const ClientHistoryModalLazy = lazy(() => import('./components/modals/ClientHistoryModal.jsx'));
const ClientDataModalLazy = lazy(() => import('./components/modals/ClientDataModal.jsx'));
const ManagerAuthModalLazy = lazy(() => import('./components/modals/ManagerAuthModal.jsx'));
const BirthdayAlertModalLazy = lazy(() => import('./components/modals/BirthdayAlertModal.jsx'));
const CommissionModalLazy = lazy(() => import('./components/modals/CommissionModal.jsx'));
const ConfirmClientUpdateModalLazy = lazy(() => import('./components/modals/ConfirmClientUpdateModal.jsx'));
const ClientDetailsModalLazy = lazy(() => import('./components/modals/ClientDetailsModal.jsx'));
import { db } from './firebase.js';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import {
  SELLERS_LIST, EMPLOYEES_CREDENTIALS, ADM_NAME, ADM_HASH,
  CATEGORIES_LIST, PRODUCT_TYPES, RAM_STORAGE_OPTIONS, PAYMENT_METHODS,
  PAYMENT_TYPES, UF_LIST, ROUTINE_TASKS, ELIGIBLE_FOR_GOAL,
  GOAL_SELLERS, GOAL_MANAGER, COMMISSION_PER_UNIT, MANAGER_HASH,
  APP_VERSION, HELP_LINKS,
} from './constants.js';
import {
  formatCurrency, formatDateBR, maskPhone, maskDateStrict, maskIMEI,
  maskCEP, maskCPF, validateCPF, parseCurrency, getPaymentStyles,
  verifyPassword,
} from './utils.js';
import { salesService, clientService, authService, backupService } from './services/index.js';

// Contexts
import { useSalesContext } from './contexts/SalesContext.jsx';
import { useClientContext } from './contexts/ClientContext.jsx';
import { useUIContext } from './contexts/UIContext.jsx';
import { useApp } from './hooks/useApp.ts';

const App = () => {
  const app = useApp();
  const { sales } = useSalesContext();
  const { clients } = useClientContext();
  const ui = useUIContext();
  const { auth: authState, form, filters, notifications } = app;
  const {
    currentView: currentViewState, setCurrentView: setCurrentViewState,
    isOnline, handleOnline, handleOffline,
    toasts, showToast, removeToast,
    modals, openModal, closeModal,
    isHelpDropdownOpen, setIsHelpDropdownOpen,
    isNotificationsDropdownOpen, setIsNotificationsDropdownOpen,
  } = ui;

  // Estado local restante
  const [routineState, setRoutineState] = useState({});
  const [reminders, setReminders] = useState([]);
  const [managerPassword, setManagerPassword] = useState('');
  const [pendingAuthAction, setPendingAuthAction] = useState(null);
  const [pendingEditItem, setPendingEditItem] = useState(null);
  const [dateLockPassword, setDateLockPassword] = useState('');
  const [selectedClientForEdit, setSelectedClientForEdit] = useState(null);
  const [selectedClientHistory, setSelectedClientHistory] = useState(null);
  const [clientDetailsData, setClientDetailsData] = useState(null);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertData, setAlertData] = useState({ message: '', phase: '' });
  const [lastAlertTime, setLastAlertTime] = useState(0);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const fileInputInternalRef = useRef(null);

  // Efeitos de inicialização
  useEffect(() => {
    authState.loadSavedSession();
  }, [authState.loadSavedSession]);

  useEffect(() => {
    authState.saveSession();
  }, [authState.settings, authState.saveSession]);

  // Rotina diária (Firestore)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const unsub = onSnapshot(
      doc(db, 'rotina_state', today),
      (d) => { if (d.exists()) setRoutineState(d.data()); else setRoutineState({}); },
      (err) => console.error('Erro rotina:', err),
    );
    return () => unsub();
  }, []);

  // Online/offline
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  // Alerta de unload quando há itens no formulário
  useEffect(() => {
    if (form.items.length > 0) {
      const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }
  }, [form.items]);

  // Body class para modal de recibo
  useEffect(() => {
    if (modals.receipt?.open) document.body.classList.add('receipt-open');
    else document.body.classList.remove('receipt-open');
  }, [modals.receipt?.open]);

  // Datas únicas das vendas (memoizado)
  const sortedSaleDates = useMemo(
    () => [...new Set(sales.map((s) => s.date))].filter(Boolean).sort(),
    [sales],
  );

  // Jump para data mais recente na primeira carga
  const jumpedToLatest = useRef(false);
  useEffect(() => {
    if (sales.length === 0 || jumpedToLatest.current) return;
    jumpedToLatest.current = true;
    const today = new Date().toISOString().split('T')[0];
    if (!sales.some((s) => s.date === today)) {
      if (sortedSaleDates.length > 0) filters.setFilterDate(sortedSaleDates[sortedSaleDates.length - 1]);
    }
  }, [sales, sortedSaleDates, filters.setFilterDate]);

  // Alertas de rotina periódicos
  useEffect(() => {
    if (!authState.isLoggedIn) return;
    const checkAlerts = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (Date.now() - lastAlertTime < 15 * 60 * 1000) return;
      const phases = [
        { name: 'Início - Manhã', start: 570, end: 780, key: 'morning' },
        { name: 'Meio - Tarde', start: 810, end: 990, key: 'afternoon' },
        { name: 'Fim - Fechamento', start: 1020, end: 1110, key: 'evening' },
      ];
      for (const p of phases) {
        if (currentMinutes >= p.start && currentMinutes <= p.end) {
          if (!ROUTINE_TASKS[p.key].every((_, i) => routineState[`${p.key}-${i}`])) {
            setAlertData({
              phase: p.name,
              message: `(${authState.settings.employeeName}) Não esqueça de completar suas tarefas diárias\n${p.name}\nExiste Pendências!`,
            });
            setAlertModalOpen(true);
            setLastAlertTime(Date.now());
            try { new Audio('/speech_1771176567518.mp3').play().catch(() => {}); } catch {}
            break;
          }
        }
      }
    };
    const interval = setInterval(checkAlerts, 60_000);
    checkAlerts();
    return () => clearInterval(interval);
  }, [authState.isLoggedIn, routineState, lastAlertTime, authState.settings.employeeName]);

  // Handlers de rotina
  const toggleRoutine = useCallback((category, index) => {
    const key = `${category}-${index}`;
    const today = new Date().toISOString().split('T')[0];
    const newVal = !routineState[key];
    setDoc(doc(db, 'rotina_state', today), { [key]: newVal }, { merge: true });
  }, [routineState]);

  // Handlers de cliente / formulário
  const handleCpfChange = useCallback((e) => {
    const val = maskCPF(e.target.value);
    form.setClientCpf(val);
    if (val.replace(/\D/g, '').length === 11) {
      const found = clients.find(
        (c) => c.cpf && c.cpf.replace(/\D/g, '') === val.replace(/\D/g, ''),
      );
      if (found) { showToast('Cliente encontrado!', 'info'); form.fillClientData(found); }
    }
  }, [clients, showToast, form]);

  const handleZipChange = useCallback(async (e) => {
    const value = maskCEP(e.target.value);
    form.setClientZip(value);
    if (value.replace(/\D/g, '').length === 8) {
      try {
        showToast('Buscando endereço...', 'info');
        const res = await fetch(`https://viacep.com.br/ws/${value.replace(/\D/g, '')}/json/`);
        const data = await res.json();
        if (!data.erro) {
          form.setClientAddress(data.logradouro);
          form.setClientCity(data.localidade);
          form.setClientState(data.uf);
          form.setClientNeighborhood(data.bairro);
          showToast('Endereço encontrado!');
        } else {
          showToast('CEP não encontrado. Verifique o número.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Erro ao buscar o CEP. Verifique sua conexão.', 'error');
      }
    }
  }, [showToast, form]);

  const handleSaveClient = useCallback(() => {
    if (!form.clientName) { showToast('Nome é obrigatório', 'error'); return; }
    if (form.clientCpf && !validateCPF(form.clientCpf)) { showToast('CPF Inválido', 'error'); return; }
    const existingClient = clients.find(
      (c) =>
        (c.cpf && form.clientCpf && c.cpf.replace(/\D/g, '') === form.clientCpf.replace(/\D/g, '')) ||
        (c.name && form.clientName && c.name.trim().toLowerCase() === form.clientName.trim().toLowerCase()),
    );
    const clientId = existingClient ? existingClient.id : clientService.generateId();
    const clientData = {
      id: clientId, name: form.clientName, cpf: form.clientCpf,
      phone: form.clientPhone, email: form.clientEmail, dob: form.clientDob,
      address: form.clientAddress, number: form.clientNumber,
      neighborhood: form.clientNeighborhood, city: form.clientCity,
      zip: form.clientZip, state: form.clientState,
      createdBy: existingClient ? existingClient.createdBy : authState.settings.employeeName,
      createdAt: existingClient ? existingClient.createdAt : new Date().toISOString(),
    };
    clientService.save(clientData)
      .then(() => showToast('Dados salvos!'))
      .catch((err) => showToast('Erro: ' + err.message, 'error'));
    return clientId;
  }, [form, clients, authState.settings, showToast]);

  // Handlers de itens e pagamentos
  const handleAddItem = useCallback(() => {
    if (!form.category) { showToast('Selecione a Categoria primeiro', 'error'); return; }
    if (!form.newItemType) { showToast('Selecione o Tipo do item', 'error'); return; }
    if (!form.newItemDesc || !form.newItemPrice) { showToast('Preencha Descrição e Preço', 'error'); return; }
    if (form.newItemImei?.trim()) {
      const imeiClean = form.newItemImei.trim();
      if (form.items.some((i) => i.imei?.trim() === imeiClean && i.id !== form.editingItemId)) {
        showToast('IMEI já adicionado nesta venda!', 'error'); return;
      }
      if (sales.some((s) => {
        if (form.editingId && s.id === form.editingId) return false;
        return (s.items || []).some((i) => i.imei?.trim() === imeiClean);
      })) { showToast('IMEI já registrado em outra venda!', 'error'); return; }
    }
    let finalPrice = parseCurrency(form.newItemPrice);
    let finalDiscount = parseCurrency(form.newItemDiscount);
    if (form.category === 'Devolução') {
      finalPrice = -Math.abs(finalPrice); finalDiscount = -Math.abs(finalDiscount);
    } else if (form.category === 'Troca') {
      if (form.exchangeAction === 'in') { finalPrice = -Math.abs(finalPrice); finalDiscount = -Math.abs(finalDiscount); }
      else { finalPrice = Math.abs(finalPrice); finalDiscount = Math.abs(finalDiscount); }
    }
    if (form.editingItemId) {
      form.setItems((prev) => prev.map((i) => i.id === form.editingItemId
        ? { ...i, quantity: form.newItemQty, type: form.newItemType || 'PRODUTO', description: form.newItemDesc, ram_storage: form.newItemRam, color: form.newItemColor, imei: form.newItemImei, financed: form.newItemFinanced, unitPrice: finalPrice, discount: finalDiscount }
        : i));
      form.setEditingItemId(null);
      showToast('Item atualizado!');
    } else {
      form.setItems([...form.items, { id: Date.now(), sequence: form.items.length + 1, quantity: form.newItemQty, type: form.newItemType || 'PRODUTO', description: form.newItemDesc, ram_storage: form.newItemRam, color: form.newItemColor, imei: form.newItemImei, financed: form.newItemFinanced, unitPrice: finalPrice, discount: finalDiscount }]);
    }
    form.setNewItemQty(1); form.setNewItemType(''); form.setNewItemDesc(''); form.setNewItemRam('');
    form.setNewItemColor(''); form.setNewItemImei(''); form.setNewItemFinanced('Não');
    form.setNewItemPrice(''); form.setNewItemDiscount(''); form.setNewItemDiscountPercent('');
  }, [form, sales, showToast]);

  const handleAddPayment = useCallback(() => {
    if (!form.currentPaymentMethod) { showToast('Selecione a Forma de pagamento', 'error'); return; }
    if (!form.currentPaymentAmount || parseCurrency(form.currentPaymentAmount) <= 0) {
      showToast('Preencha um valor válido', 'error'); return;
    }
    let amountToAdd = parseCurrency(form.currentPaymentAmount);
    if (['Devolução Dinheiro', 'Devolução Pix', 'Devolução Estorno Cartão'].includes(form.currentPaymentMethod)) {
      amountToAdd = -Math.abs(amountToAdd);
    }
    if (form.editingPaymentId) {
      form.setPaymentList((prev) => prev.map((p) => p.id === form.editingPaymentId
        ? { ...p, method: form.currentPaymentMethod, type: form.currentPaymentType || 'Integral', amount: amountToAdd, installments: form.currentPaymentMethod === 'Credito Parcelado' ? form.currentInstallments : null }
        : p));
      form.setEditingPaymentId(null);
      showToast('Pagamento atualizado!');
    } else {
      form.setPaymentList([...form.paymentList, { id: Date.now(), method: form.currentPaymentMethod, type: form.currentPaymentType || 'Integral', amount: amountToAdd, installments: form.currentPaymentMethod === 'Credito Parcelado' ? form.currentInstallments : null }]);
    }
    form.setCurrentPaymentMethod(''); form.setCurrentPaymentType('');
    form.setCurrentPaymentAmount(''); form.setCurrentInstallments('');
  }, [form, showToast]);

  const handleRemovePayment = useCallback(
    (id) => form.setPaymentList(form.paymentList.filter((p) => p.id !== id)),
    [form],
  );

  // Handlers de formatação de preços
  const handleItemPriceChange = useCallback((e) => {
    const val = e.target.value.replace(/\D/g, '');
    const floatVal = parseFloat(val) / 100 || 0;
    form.setNewItemPrice(formatCurrency(floatVal));
    if (form.newItemDiscountPercent) {
      const pct = parseFloat(form.newItemDiscountPercent.replace(',', '.')) || 0;
      form.setNewItemDiscount(formatCurrency((floatVal * form.newItemQty) * (pct / 100)));
    }
  }, [form]);

  const handlePercentChange = useCallback((e) => {
    const val = e.target.value.replace(',', '.');
    form.setNewItemDiscountPercent(val);
    if (form.newItemPrice) {
      const price = parseCurrency(form.newItemPrice);
      const pct = parseFloat(val) || 0;
      form.setNewItemDiscount(formatCurrency((price * form.newItemQty) * (pct / 100)));
    }
  }, [form]);

  const handleDiscountValChange = useCallback((e) => {
    const val = e.target.value.replace(/\D/g, '');
    const floatVal = parseFloat(val) / 100 || 0;
    form.setNewItemDiscount(formatCurrency(floatVal));
    if (form.newItemPrice) {
      const price = parseCurrency(form.newItemPrice) * form.newItemQty;
      if (price > 0) form.setNewItemDiscountPercent(((floatVal / price) * 100).toFixed(2).replace('.', ','));
    }
  }, [form]);

  const handleCurrentPaymentAmountChange = useCallback((e) => {
    const val = e.target.value.replace(/\D/g, '');
    const floatVal = parseFloat(val) / 100 || 0;
    form.setCurrentPaymentAmount(formatCurrency(floatVal));
  }, [form]);

  // Salvar/excluir venda
  const performSave = useCallback(async () => {
    const clientId = form.clientName ? handleSaveClient() : null;

    const saleId = form.editingId || salesService.generateId();
    
    let contractPdfUrl = null;
    if (form.contractPdf) {
      try {
        contractPdfUrl = await salesService.uploadContract(saleId, form.contractPdf);
      } catch (err) {
        showToast('Erro ao fazer upload do contrato: ' + err.message, 'error');
        return;
      }
    }

    const saleData = {
      id: saleId,
      date: form.date,
      timestamp: new Date().toISOString(),
      ...(clientId && { clientId }),
      clientName: form.clientName, clientCpf: form.clientCpf, clientPhone: form.clientPhone,
      clientEmail: form.clientEmail, clientDob: form.clientDob, clientAddress: form.clientAddress,
      clientNumber: form.clientNumber, clientCity: form.clientCity, clientZip: form.clientZip,
      clientState: form.clientState, clientNeighborhood: form.clientNeighborhood,
      category: form.category, items: form.items,
      amount: Math.round((form.finalTotal + Number.EPSILON) * 100) / 100,
      discount: Math.round((form.totalDiscount + Number.EPSILON) * 100) / 100,
      employeeName: form.originalEmployeeName || authState.settings.employeeName,
      store: 'Miplace Premium',
      payments: form.paymentList,
      amountPaid: form.totalPaid,
      change: form.changeAmount,
      clientSource: form.clientSource,
      paymentObservation: form.paymentObservation,
      ...(contractPdfUrl && { contractPdfUrl }),
    };
    salesService.save(saleData)
      .then(() => {
        showToast(form.editingId ? 'Atualizado!' : 'Venda registrada!');
        if (!form.editingId) { setCurrentReceipt(saleData); openModal('receipt'); }
        form.resetForm();
      })
      .catch((err) => showToast('Erro: ' + err.message, 'error'));
  }, [form, authState.settings, showToast, handleSaveClient, openModal]);

  const performDelete = useCallback(() => {
    if (form.editingId) {
      salesService.delete(form.editingId)
        .then(() => { showToast('Excluído!', 'error'); form.resetForm(); })
        .catch((err) => showToast('Erro: ' + err.message, 'error'));
    }
  }, [form, showToast]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (form.items.length === 0) { showToast('Adicione itens!', 'error'); return; }
    const isRefundOrExchangeCredit = form.finalTotal < 0;
    
    const crediarioCategories = ['Crediario Payjoy', 'Crediario Crefaz', 'Crediario Paymobi'];
    const isCrediario = crediarioCategories.includes(form.category);
    
    if (isCrediario && !form.contractPdf) {
      showToast('Contrato PDF é obrigatório para vendas crediaristas!', 'error');
      return;
    }
    
    if (!isRefundOrExchangeCredit && form.remainingToPay > 0.02) {
      showToast('Valor pago insuficiente.', 'error'); return;
    }
    if (!isRefundOrExchangeCredit && form.changeAmount > 0.02) { openModal('confirmChange'); return; }
    openModal('confirmSale');
  }, [form, showToast, openModal]);

  // Auth de gerente
  const handleManagerAuth = useCallback(async () => {
    const isValid = await authService.verifyManagerPassword(managerPassword);
    if (isValid) {
      if (pendingAuthAction === 'save') performSave();
      if (pendingAuthAction === 'edit' && pendingEditItem) form.startEdit(pendingEditItem);
      if (pendingAuthAction === 'delete') performDelete();
      if (pendingAuthAction === 'update_client') performClientUpdate();
      closeModal('managerAuth');
      setManagerPassword(''); setPendingAuthAction(null); setPendingEditItem(null);
    } else {
      showToast('Senha incorreta', 'error');
    }
  }, [managerPassword, pendingAuthAction, pendingEditItem, performSave, performDelete, form, closeModal, showToast]);

  // Atualizar dados do cliente
  const performClientUpdate = useCallback(async () => {
    const originalClient = clients.find((c) => c.id === selectedClientForEdit.id);
    const originalCpf = originalClient?.cpf ? originalClient.cpf.replace(/\D/g, '') : null;
    const originalName = (originalClient?.name || '').trim().toLowerCase();
    const salesToUpdate = sales.filter((s) => {
      const saleCpf = s.clientCpf ? s.clientCpf.replace(/\D/g, '') : null;
      return (
        (s.clientId && s.clientId === selectedClientForEdit.id) ||
        (originalCpf && saleCpf && originalCpf === saleCpf) ||
        ((s.clientName || '').trim().toLowerCase() === originalName && originalName !== '')
      );
    });
    try {
      await clientService.update(selectedClientForEdit.id, selectedClientForEdit);
      await salesService.updateClientInSales(salesToUpdate, selectedClientForEdit);
      showToast('Dados atualizados!');
      closeModal('confirmClientUpdate'); closeModal('clientData');
    } catch (error) { showToast('Erro: ' + error.message, 'error'); }
  }, [selectedClientForEdit, clients, sales, closeModal, showToast]);

  const handleClientDataChange = useCallback((field, value) => {
    setSelectedClientForEdit((prev) => ({ ...prev, [field]: value }));
  }, []);

  const confirmClientUpdate = useCallback(() => {
    setPendingAuthAction('update_client');
    openModal('managerAuth');
  }, [openModal]);

  // Backup
  const handleExportBackup = useCallback(async () => {
    try {
      const result = await backupService.exportToFile(sales, clients, authState.settings);
      if (result.success) showToast('Backup salvo!');
      if (result.aborted) return;
      if (modals.logout?.open) closeModal('logout');
    } catch (err) {
      showToast('Erro ao exportar backup: ' + err.message, 'error');
    }
  }, [sales, clients, authState.settings, modals.logout, closeModal, showToast]);

  const handleSaveToCloud = useCallback(async () => {
    if (!authService.currentUser) { showToast('Erro: Não conectado.', 'error'); return; }
    showToast('Verificando sincronização...', 'info');
    await authService.logAction('manual_cloud_save', authState.settings.employeeName);
    setTimeout(() => showToast('Dados salvos na nuvem!'), 1000);
  }, [authState.settings, showToast]);

  const handleImportBackup = useCallback(async (e) => {
    try {
      const result = await backupService.importFromFiles(e.target.files);
      if (result.success) { showToast(`${result.count} registros importados!`); closeModal('backup'); }
      else showToast('Nenhum dado válido encontrado.');
      if (fileInputInternalRef.current) fileInputInternalRef.current.value = '';
    } catch (error) { showToast('Erro: ' + error.message, 'error'); }
  }, [showToast, closeModal]);

  // Impressão
  const handleExportReceiptPDF = useCallback((mode) => {
    const element = document.getElementById('receipt-paper');
    if (!element) { showToast('Recibo não encontrado', 'error'); return; }
    const clientName = currentReceipt?.clientName || 'Venda';
    const receiptHtml = element.outerHTML;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Recibo - ${clientName}</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><style>*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;box-sizing:border-box;margin:0;padding:0}html,body{background:#d0cdc8;display:flex;justify-content:center;padding:24px;font-family:'Plus Jakarta Sans',sans-serif}#receipt-paper{width:360px!important;overflow:hidden}img{max-width:100%}@media print{@page{size:80mm auto;margin:0}html,body{background:white;padding:0;display:block}#receipt-paper{width:80mm!important;border-radius:0!important}}</style></head><body>${receiptHtml}<script>document.fonts.ready.then(function(){setTimeout(function(){window.print()},800)})<\/script></body></html>`;
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:0;';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open(); iframeDoc.write(html); iframeDoc.close();
    iframe.contentWindow.focus();
    setTimeout(() => {
      try { iframe.contentWindow.print(); showToast('Dialogo de impressao aberto!'); }
      catch (e) { showToast('Erro: ' + e.message, 'error'); }
      setTimeout(() => document.body.removeChild(iframe), 60_000);
    }, 1000);
  }, [currentReceipt, showToast]);

  const printSalesList = useCallback(() => {
    filters.setItemsPerPage(10_000);
    setTimeout(() => {
      const source = document.querySelector('.print-sales-area');
      if (!source) { showToast('Nenhum dado para imprimir', 'error'); filters.setItemsPerPage(50); return; }
      const clone = source.cloneNode(true);
      clone.querySelectorAll('.no-print').forEach((el) => el.remove());

      const totalValue = filters.filteredSales.reduce((s, i) => s + (i.amountPaid || i.amount), 0);
      const ph = clone.querySelector('.print-header');
      if (ph) {
        ph.textContent = '';
        Object.assign(ph.style, { display:'block', textAlign:'center', marginBottom:'10px', paddingBottom:'8px', borderBottom:'2px solid #000', fontFamily:'Arial,sans-serif' });
        const div = document.createElement('div');
        Object.assign(div.style, { fontSize:'12px', fontWeight:'bold', color:'#000', marginTop:'5px', letterSpacing:'1px' });
        div.textContent = `TOTAL LISTADO: R$ ${formatCurrency(totalValue)}`;
        ph.appendChild(div);
      }

      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
      document.body.appendChild(iframe);
      const win = iframe.contentWindow;
      win.document.write(`<html><head><title>Relatorio de Vendas</title><style>@page{margin:10mm;size:A4 portrait}body{margin:0;padding:0;font-family:Arial,sans-serif;font-size:10pt;color:#000;background:#fff;line-height:1.3}*{color:#000!important;background:transparent!important;box-shadow:none!important;text-shadow:none!important;border-color:#000!important;border-radius:0!important}table{border-collapse:collapse;width:100%;table-layout:fixed;margin-bottom:20px}table tr{page-break-inside:avoid;border-bottom:1px solid #ddd}table th,table td{padding:8px 4px;text-align:left;vertical-align:top;word-wrap:break-word}table th{font-weight:bold;border-bottom:2px solid #000;font-size:9pt;text-transform:uppercase;color:#333!important}.flex{display:flex;align-items:center;justify-content:space-between;border-left:3px solid #000;padding-left:8px;margin-bottom:8px;margin-top:15px;background:#f9f9f9!important;padding:4px 8px}table th:nth-child(1),table td:nth-child(1){width:18%}table th:nth-child(2),table td:nth-child(2){width:38%}table th:nth-child(3),table td:nth-child(3){width:10%;text-align:center}table th:nth-child(4),table td:nth-child(4){width:20%}table th:nth-child(5),table td:nth-child(5){width:14%;text-align:right}table td:nth-child(5) div:first-child{font-weight:bold;font-size:11pt}b,strong{font-weight:bold}h3{margin:0;font-size:11pt;font-weight:bold;text-transform:uppercase}.space-y-10>div{margin-bottom:20px}.print-header{text-align:center;margin-bottom:20px;border-bottom:2px solid #000;padding-bottom:15px}p{margin:3px 0}svg{display:none!important}*{font-size:10pt!important;line-height:1.3!important}h3,h3*{font-size:11pt!important}table th,table th*{font-size:9pt!important}table td:nth-child(5) div:first-child,table td:nth-child(5) div:first-child*{font-size:11pt!important}td div.flex{display:block!important;border:none!important;padding:0!important;margin:0!important;background:transparent!important}td .flex-1,td .text-right,td .flex-shrink-0{display:block!important;text-align:left!important;width:100%!important;margin-top:2px!important}td .text-right{margin-top:4px!important;margin-bottom:2px!important;font-weight:bold}td .space-y-2>div{display:block!important;padding-bottom:6px;margin-bottom:6px;border-bottom:1px dashed #ccc;width:100%;clear:both}td .space-y-2>div:last-child{border-bottom:none}td .flex-wrap{display:block!important;margin-top:4px!important}td .flex-wrap span{display:inline-block!important;padding-right:8px!important}td:nth-child(4) div{display:block!important;margin-bottom:3px!important}</style></head><body>${clone.outerHTML}</body></html>`);
      win.document.close(); win.focus();
      setTimeout(() => { win.print(); document.body.removeChild(iframe); filters.setItemsPerPage(50); }, 350);
    }, 250);
  }, [filters, showToast]);

  // Histórico e dados do cliente
  const handleViewHistory = useCallback((client) => {
    const cleanTargetCpf = client.cpf ? client.cpf.replace(/\D/g, '') : null;
    const targetName = (client.name || '').trim().toLowerCase();
    const clientSales = sales.filter((s) => {
      if (s.clientId && s.clientId === client.id) return true;
      const saleCpf = s.clientCpf ? s.clientCpf.replace(/\D/g, '') : null;
      if (cleanTargetCpf?.length === 11) return saleCpf && cleanTargetCpf === saleCpf;
      return (s.clientName || '').trim().toLowerCase() === targetName && !(saleCpf?.length === 11);
    });
    setSelectedClientHistory({ client, history: clientSales });
    openModal('clientHistory');
  }, [sales, openModal]);

  const handleOpenClientData = useCallback((client) => {
    setSelectedClientForEdit({ ...client });
    openModal('clientData');
  }, [openModal]);

  const openClientDetails = useCallback((sale) => {
    const clientData = {
      clientName: sale.clientName,
      clientCpf: sale.clientCpf,
      clientPhone: sale.clientPhone,
      clientEmail: sale.clientEmail,
      clientDob: sale.clientDob ? formatDateBR(sale.clientDob) : '',
      clientAddress: sale.clientAddress,
      clientNumber: sale.clientNumber,
      clientNeighborhood: sale.clientNeighborhood,
      clientCity: sale.clientCity,
      clientState: sale.clientState,
      clientZip: sale.clientZip,
    };
    setClientDetailsData(clientData);
    openModal('clientDetails');
  }, [openModal]);

  const openReceipt = useCallback(
    (sale) => { setCurrentReceipt(sale); openModal('receipt'); },
    [openModal],
  );

  // Dados derivados
  const filteredClients = useMemo(() => {
    if (!clientSearchTerm) return clients;
    const term = clientSearchTerm.toLowerCase();
    return clients.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(term) ||
        (c.cpf && c.cpf.includes(clientSearchTerm)),
    );
  }, [clients, clientSearchTerm]);

  // Tela de login
  if (!authState.isLoggedIn) {
    return (
      <LoginScreen
        toasts={toasts}
        setToasts={(updater) => {
          if (typeof updater === 'function') {
            // LoginScreen chama setToasts com filter function
            // Ignoramos
          }
        }}
        SELLERS_LIST={SELLERS_LIST}
        ADM_NAME={ADM_NAME}
        handleLoginClick={authState.handleLoginClick}
        loginModalOpen={authState.loginModalOpen}
        selectedUserForLogin={authState.selectedUserForLogin}
        loginPasswordInput={authState.loginPasswordInput}
        setLoginPasswordInput={authState.setLoginPasswordInput}
        performLogin={() => authState.performLogin(showToast)}
        sessionPromptOpen={authState.sessionPromptOpen}
        setSessionPromptOpen={authState.setSessionPromptOpen}
        setSettings={authState.setSettings}
        setIsAdm={authState.setIsAdm}
        setIsLoggedIn={authState.setIsLoggedIn}
        showToast={showToast}
        setLoginModalOpen={authState.setLoginModalOpen}
      />
    );
  }

  // App principal
  return (
    <div className="min-h-screen font-sans pb-32 print:bg-white print:pb-0">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <TaskAlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        onGoToCalendar={() => { setAlertModalOpen(false); setCurrentViewState('calendar'); }}
        message={alertData.message}
        phase={alertData.phase}
        userName={authState.settings.employeeName}
      />
      <Header
        settings={authState.settings}
        isAdm={authState.isAdm}
        isOnline={isOnline}
        currentView={currentViewState}
        setCurrentView={setCurrentViewState}
        setLogoutModalOpen={() => openModal('logout')}
        setCommissionModalOpen={() => openModal('commission')}
        isNotificationsDropdownOpen={isNotificationsDropdownOpen}
        setIsNotificationsDropdownOpen={setIsNotificationsDropdownOpen}
        setIsHelpDropdownOpen={setIsHelpDropdownOpen}
        isHelpDropdownOpen={isHelpDropdownOpen}
        HELP_LINKS={HELP_LINKS}
        ADM_NAME={ADM_NAME}
        isBackupOpen={modals.backup?.open}
        setIsBackupOpen={(v) => v ? openModal('backup') : closeModal('backup')}
        APP_VERSION={APP_VERSION}
        sales={sales}
        clients={clients}
        reminders={reminders}
        GOAL_SELLERS={GOAL_SELLERS}
        GOAL_MANAGER={GOAL_MANAGER}
        ELIGIBLE_FOR_GOAL={ELIGIBLE_FOR_GOAL}
      />

      {!isOnline && (
        <div className="max-w-6xl mx-auto px-6 mt-2 no-print">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-6 py-4 flex items-center gap-4">
            <div className="p-2 bg-amber-500/20 rounded-xl shrink-0">
              <Icons.AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-700 text-sm">Modo Offline Ativo</p>
              <p className="text-amber-600 text-xs mt-0.5">Firebase Persistence garante sincronização automática.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 space-y-10 animate-fade-in-up">
        {currentViewState === 'calendar' ? (
          <SimpleCalendar routineState={routineState} toggleRoutine={toggleRoutine} reminders={reminders} setReminders={setReminders} />
        ) : currentViewState === 'clients' ? (
          <Suspense fallback={<PageLoader />}>
            <ClientsView clients={clients} filteredClients={filteredClients} clientSearchTerm={clientSearchTerm} setClientSearchTerm={setClientSearchTerm} handleViewHistory={handleViewHistory} handleOpenClientData={handleOpenClientData} fillClientData={form.fillClientData} setCurrentView={setCurrentViewState} />
          </Suspense>
        ) : currentViewState === 'referrals' ? (
          <Suspense fallback={<PageLoader />}>
            <ReferralsView sales={sales} formatCurrency={formatCurrency} formatDateBR={formatDateBR} />
          </Suspense>
        ) : currentViewState === 'manager' ? (
          <Suspense fallback={<PageLoader />}>
            <ManagerView sales={sales} formatCurrency={formatCurrency} SELLERS_LIST={SELLERS_LIST} GOAL_SELLERS={GOAL_SELLERS} GOAL_MANAGER={GOAL_MANAGER} COMMISSION_PER_UNIT={COMMISSION_PER_UNIT} ELIGIBLE_FOR_GOAL={ELIGIBLE_FOR_GOAL} />
          </Suspense>
        ) : currentViewState === 'performance' ? (
          <Suspense fallback={<PageLoader />}>
            <PerformanceView sales={sales} clients={clients} settings={authState.settings} formatCurrency={formatCurrency} monthlyChartData={notifications.monthlyChartData} setCommissionModalOpen={() => openModal('commission')} GOAL_SELLERS={GOAL_SELLERS} GOAL_MANAGER={GOAL_MANAGER} COMMISSION_PER_UNIT={COMMISSION_PER_UNIT} ELIGIBLE_FOR_GOAL={ELIGIBLE_FOR_GOAL} />
          </Suspense>
        ) : (
          <Suspense fallback={<PageLoader />}>
            <SalesForm
              date={form.date} setDate={form.setDate} isDateLocked={form.isDateLocked} setDateLockModalOpen={() => openModal('dateLock')} setIsDateLocked={form.setIsDateLocked}
              category={form.category} setCategory={form.setCategory}
              clientName={form.clientName} setClientName={form.setClientName} clientCpf={form.clientCpf} setClientCpf={form.setClientCpf} clientPhone={form.clientPhone} setClientPhone={form.setClientPhone}
              clientEmail={form.clientEmail} setClientEmail={form.setClientEmail} clientDob={form.clientDob} setClientDob={form.setClientDob} clientAddress={form.clientAddress} setClientAddress={form.setClientAddress}
              clientNumber={form.clientNumber} setClientNumber={form.setClientNumber} clientCity={form.clientCity} setClientCity={form.setClientCity} clientZip={form.clientZip} setClientZip={form.setClientZip}
              clientState={form.clientState} setClientState={form.setClientState} clientNeighborhood={form.clientNeighborhood} setClientNeighborhood={form.setClientNeighborhood}
              items={form.items} newItemQty={form.newItemQty} setNewItemQty={form.setNewItemQty} newItemType={form.newItemType} setNewItemType={form.setNewItemType} newItemDesc={form.newItemDesc} setNewItemDesc={form.setNewItemDesc}
              newItemRam={form.newItemRam} setNewItemRam={form.setNewItemRam} newItemColor={form.newItemColor} setNewItemColor={form.setNewItemColor} newItemImei={form.newItemImei} setNewItemImei={form.setNewItemImei}
              newItemFinanced={form.newItemFinanced} setNewItemFinanced={form.setNewItemFinanced} newItemPrice={form.newItemPrice} setNewItemPrice={form.setNewItemPrice}
              newItemDiscount={form.newItemDiscount} setNewItemDiscount={form.setNewItemDiscount} newItemDiscountPercent={form.newItemDiscountPercent} setNewItemDiscountPercent={form.setNewItemDiscountPercent}
              editingItemId={form.editingItemId} setEditingItemId={form.setEditingItemId}
              exchangeAction={form.exchangeAction} setExchangeAction={form.setExchangeAction}
              paymentList={form.paymentList} currentPaymentMethod={form.currentPaymentMethod} setCurrentPaymentMethod={form.setCurrentPaymentMethod}
              currentPaymentType={form.currentPaymentType} setCurrentPaymentType={form.setCurrentPaymentType} currentPaymentAmount={form.currentPaymentAmount} setCurrentPaymentAmount={form.setCurrentPaymentAmount}
              currentInstallments={form.currentInstallments} setCurrentInstallments={form.setCurrentInstallments} editingPaymentId={form.editingPaymentId} setEditingPaymentId={form.setEditingPaymentId}
              clientSource={form.clientSource} setClientSource={form.setClientSource}
              paymentObservation={form.paymentObservation} setPaymentObservation={form.setPaymentObservation}
              contractPdf={form.contractPdf} setContractPdf={form.setContractPdf}
              editingId={form.editingId} resetForm={form.resetForm}
              showToast={showToast}
              totalAmount={form.totalAmount} totalDiscount={form.totalDiscount} finalTotal={form.finalTotal} remainingToPay={form.remainingToPay} totalPaid={form.totalPaid} changeAmount={form.changeAmount}
              handleAddItem={handleAddItem} handleEditItem={form.handleEditItem} handleAddPayment={handleAddPayment} handleEditPayment={form.handleEditPayment} handleRemovePayment={handleRemovePayment}
              handleSubmit={handleSubmit} handleCpfChange={handleCpfChange} handleZipChange={handleZipChange} maskPhone={maskPhone} maskDateStrict={maskDateStrict} maskIMEI={maskIMEI}
              handleItemPriceChange={handleItemPriceChange} handlePercentChange={handlePercentChange} handleDiscountValChange={handleDiscountValChange}
              handleCurrentPaymentAmountChange={handleCurrentPaymentAmountChange} getPaymentStyles={getPaymentStyles}
              setClientSearchModalOpen={() => openModal('clientSearch')} handleSaveClient={handleSaveClient}
              CATEGORIES_LIST={CATEGORIES_LIST} PRODUCT_TYPES={PRODUCT_TYPES} RAM_STORAGE_OPTIONS={RAM_STORAGE_OPTIONS} PAYMENT_METHODS={PAYMENT_METHODS} PAYMENT_TYPES={PAYMENT_TYPES} UF_LIST={UF_LIST}
              formatCurrency={formatCurrency}
            />
          </Suspense>
        )}
      </div>

      {currentViewState !== 'calendar' && currentViewState !== 'clients' && currentViewState !== 'referrals' && currentViewState !== 'manager' && currentViewState !== 'performance' && (
        <Suspense fallback={<PageLoader />}>
          <SalesList
            filteredSales={filters.filteredSales} groupedSales={filters.groupedSales} groupBy={filters.groupBy} settings={authState.settings}
            filterDate={filters.filterDate} searchTerm={filters.searchTerm} filterMode={filters.filterMode}
            setFilterMode={filters.setFilterMode} setFilterDate={filters.setFilterDate} setSearchTerm={filters.setSearchTerm}
            handlePrevDate={filters.handlePrevDate} handleNextDate={filters.handleNextDate}
            currentPage={filters.currentPage} setCurrentPage={filters.setCurrentPage} totalPages={filters.totalPages}
            openReceipt={openReceipt}
            startEdit={(sale) => { setPendingEditItem(sale); setPendingAuthAction('edit'); openModal('managerAuth'); }}
            pendingEditItem={pendingEditItem} setPendingEditItem={setPendingEditItem}
            setPendingAuthAction={setPendingAuthAction} setManagerAuthModalOpen={() => openModal('managerAuth')}
            formatCurrency={formatCurrency} formatDateBR={formatDateBR}
            printSalesList={printSalesList} getPaymentStyles={getPaymentStyles}
            openClientDetails={openClientDetails}
          />
        </Suspense>
      )}

      {/* Modal de edição de dados do cliente */}
      <Suspense fallback={null}>
        <ClientDataModalLazy
          isOpen={modals.clientData?.open}
          onClose={() => closeModal('clientData')}
          selectedClientForEdit={selectedClientForEdit}
          onFieldChange={handleClientDataChange}
          onConfirm={confirmClientUpdate}
          UF_LIST={UF_LIST}
        />
      </Suspense>

      {/* Modais */}
      <Suspense fallback={null}>
        <ReceiptModalLazy isOpen={modals.receipt?.open} onClose={() => closeModal('receipt')} receipt={currentReceipt} onPrint={handleExportReceiptPDF} formatCurrency={formatCurrency} formatDateBR={formatDateBR} />
      </Suspense>
      <Suspense fallback={null}>
        <BackupModalLazy isOpen={modals.backup?.open} onClose={() => closeModal('backup')} onExport={handleExportBackup} onSaveToCloud={handleSaveToCloud} fileInputRef={fileInputInternalRef} />
      </Suspense>
      <Suspense fallback={null}>
        <LogoutModalLazy isOpen={modals.logout?.open} onClose={() => closeModal('logout')} onExportBackup={handleExportBackup} onSaveToCloud={handleSaveToCloud} onLogout={() => { authState.logout(); closeModal('logout'); }} />
      </Suspense>
      <Suspense fallback={null}>
        <ConfirmSaleModalLazy isOpen={modals.confirmSale?.open} onClose={() => closeModal('confirmSale')} onConfirm={() => { closeModal('confirmSale'); performSave(); }} />
      </Suspense>
      <Suspense fallback={null}>
        <ConfirmChangeModalLazy isOpen={modals.confirmChange?.open} onClose={() => closeModal('confirmChange')} onConfirm={() => { closeModal('confirmChange'); openModal('confirmSale'); }} changeAmount={form.changeAmount} formatCurrency={formatCurrency} />
      </Suspense>
      <Suspense fallback={null}>
        <DateLockModalLazy isOpen={modals.dateLock?.open} onClose={() => { closeModal('dateLock'); setDateLockPassword(''); }} dateLockPassword={dateLockPassword} setDateLockPassword={setDateLockPassword} onUnlock={() => { form.setIsDateLocked(false); closeModal('dateLock'); setDateLockPassword(''); showToast('Data liberada!'); }} MANAGER_HASH={MANAGER_HASH} hashPassword={verifyPassword} showToast={showToast} />
      </Suspense>
      <Suspense fallback={null}>
        <ClientSearchModalLazy isOpen={modals.clientSearch?.open} onClose={() => closeModal('clientSearch')} searchTerm={clientSearchTerm} setSearchTerm={setClientSearchTerm} filteredClients={filteredClients} onSelectClient={(c) => { form.fillClientData(c); closeModal('clientSearch'); }} />
      </Suspense>
      <Suspense fallback={null}>
        <ClientHistoryModalLazy isOpen={modals.clientHistory?.open} onClose={() => closeModal('clientHistory')} selectedClientHistory={selectedClientHistory} openReceipt={openReceipt} formatCurrency={formatCurrency} formatDateBR={formatDateBR} />
      </Suspense>
      <Suspense fallback={null}>
        <BirthdayAlertModalLazy isOpen={notifications.todayBirthdays.length > 0 && modals.birthdayAlert?.open} onClose={() => closeModal('birthdayAlert')} todayBirthdays={notifications.todayBirthdays} />
      </Suspense>
      <Suspense fallback={null}>
        <CommissionModalLazy isOpen={modals.commission?.open} onClose={() => closeModal('commission')} sales={sales} SELLERS_LIST={SELLERS_LIST} GOAL_SELLERS={GOAL_SELLERS} GOAL_MANAGER={GOAL_MANAGER} COMMISSION_PER_UNIT={COMMISSION_PER_UNIT} ELIGIBLE_FOR_GOAL={ELIGIBLE_FOR_GOAL} formatCurrency={formatCurrency} />
      </Suspense>
      <Suspense fallback={null}>
        <ManagerAuthModalLazy isOpen={modals.managerAuth?.open} onClose={() => closeModal('managerAuth')} managerPassword={managerPassword} setManagerPassword={setManagerPassword} onAuth={handleManagerAuth} pendingAuthAction={pendingAuthAction} />
      </Suspense>
      <Suspense fallback={null}>
        <ConfirmClientUpdateModalLazy isOpen={modals.confirmClientUpdate?.open} onClose={() => closeModal('confirmClientUpdate')} onConfirm={performClientUpdate} />
      </Suspense>
      <Suspense fallback={null}>
        <ClientDetailsModalLazy isOpen={modals.clientDetails?.open} onClose={() => closeModal('clientDetails')} clientData={clientDetailsData} formatDateBR={formatDateBR} />
      </Suspense>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-6 pb-6 no-print">
        <div className="text-center py-4 border-t border-[#0f0f0f]/10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Miplace Premium • Sistema de Vendas <span className="text-odoo-500 ml-2">{APP_VERSION}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
