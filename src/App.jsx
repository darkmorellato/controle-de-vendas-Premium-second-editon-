import { useEffect, useState, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import Icons from './components/Icons.jsx';
import PageLoader from './components/PageLoader.tsx';
import LoginScreen from './components/views/LoginScreen.jsx';
import Header from './components/views/Header.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import SimpleCalendar from './components/SimpleCalendar.jsx';
import TaskAlertModal from './components/TaskAlertModal.jsx';
import { SalesFormProvider } from './contexts/SalesFormContext.jsx';

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
const NotificationsModalLazy = lazy(() => import('./components/modals/NotificationsModal.jsx'));
const CommissionModalLazy = lazy(() => import('./components/modals/CommissionModal.jsx'));
const ConfirmClientUpdateModalLazy = lazy(() => import('./components/modals/ConfirmClientUpdateModal.jsx'));
const ClientDetailsModalLazy = lazy(() => import('./components/modals/ClientDetailsModal.jsx'));
import {
  SELLERS_LIST, EMPLOYEES_CREDENTIALS, ADM_NAME, ADM_HASH,
  CATEGORIES_LIST, PRODUCT_TYPES, RAM_STORAGE_OPTIONS, PAYMENT_METHODS,
  PAYMENT_TYPES, UF_LIST, ROUTINE_TASKS, ELIGIBLE_FOR_GOAL,
  GOAL_SELLERS, GOAL_MANAGER, COMMISSION_PER_UNIT, MANAGER_HASH,
  APP_VERSION, HELP_LINKS,
} from './constants.js';
import {
  formatCurrency, formatDateBR, maskPhone, maskDateStrict, maskIMEI,
  getPaymentStyles, verifyPassword,
} from './utils.js';
import { salesService, authService } from './services/index.js';

// Contexts
import { useSalesContext } from './contexts/SalesContext.jsx';
import { useClientContext } from './contexts/ClientContext.jsx';
import { useUIContext } from './contexts/UIContext.jsx';
import { useApp } from './hooks/core/useApp.ts';

const App = () => {
  const app = useApp();
  const { sales } = useSalesContext();
  const { clients } = useClientContext();
  const ui = useUIContext();
  const { auth: authState, form, filters, notifications, handlers, appState, routine, clientOps } = app;
  const { itemHandlers, paymentHandlers, saleHandlers, printHandlers, backupHandlers } = handlers;
  const {
    currentView: currentViewState, setCurrentView: setCurrentViewState,
    isOnline, handleOnline, handleOffline,
    toasts, showToast, removeToast,
    modals, openModal, closeModal,
    isHelpDropdownOpen, setIsHelpDropdownOpen,
    isNotificationsDropdownOpen, setIsNotificationsDropdownOpen,
  } = ui;

  // Estado local restante (appState manages: selectedClientForEdit, managerPassword, pendingAuthAction, pendingEditItem, currentReceipt, fileInputRef)
  const {
    managerPassword, setManagerPassword,
    pendingAuthAction, setPendingAuthAction,
    pendingEditItem, setPendingEditItem,
    selectedClientForEdit, setSelectedClientForEdit,
    currentReceipt, setCurrentReceipt,
    fileInputRef: fileInputInternalRef,
  } = appState;
  const [dateLockPassword, setDateLockPassword] = useState('');
  const [selectedClientHistory, setSelectedClientHistory] = useState(null);
  const [clientDetailsData, setClientDetailsData] = useState(null);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [sellerFilter, setSellerFilter] = useState('todos');
  const [monthFilter, setMonthFilter] = useState('todos');
  const currentMonth = new Date().toISOString().substring(0, 7); // "2026-04"
  const [referralsMonthFilter, setReferralsMonthFilter] = useState(currentMonth);
  const [performanceMonthFilter, setPerformanceMonthFilter] = useState(currentMonth);
  const performanceAvailableMonths = ['2026-04', '2026-03'];
  const [managerMonthFilter, setManagerMonthFilter] = useState(currentMonth);
  const managerAvailableMonths = ['2026-04', '2026-03'];
  const { routineState, reminders, setReminders, alertModalOpen, setAlertModalOpen, alertData, toggleRoutine } = routine;
  const { handleCpfChange, handleZipChange, handleSaveClient, handleViewHistory, handleOpenClientData, handleClientDataChange, performClientUpdate, confirmClientUpdate } = clientOps;

  // Efeitos de inicialização
  useEffect(() => {
    authState.loadSavedSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.loadSavedSession]);

  useEffect(() => {
    authState.saveSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.settings, authState.saveSession]);

  // Auto-abrir alerta de aniversário ao logar
  useEffect(() => {
    if (authState.isLoggedIn && notifications.todayBirthdays.length > 0) {
      const timer = setTimeout(() => openModal('birthdayAlert'), 1500);
      return () => clearTimeout(timer);
    }
  }, [authState.isLoggedIn, notifications.todayBirthdays.length, openModal]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sales, sortedSaleDates, filters.setFilterDate]);

  // Alertas de rotina — gerenciados pelo hook useRoutineAlerts (routine)

  // Salvar/excluir venda — KEPT: App.jsx version has contract PDF upload logic not in hooks
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
  }, [form, authState.settings, showToast, handleSaveClient, openModal, setCurrentReceipt]);

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
      if (pendingAuthAction === 'delete') saleHandlers.performDelete();
      if (pendingAuthAction === 'update_client') performClientUpdate();
      closeModal('managerAuth');
      setManagerPassword(''); setPendingAuthAction(null); setPendingEditItem(null);
    } else {
      showToast('Senha incorreta', 'error');
    }
  }, [managerPassword, pendingAuthAction, pendingEditItem, performSave, saleHandlers, form, closeModal, showToast, performClientUpdate, setManagerPassword, setPendingAuthAction, setPendingEditItem]);

  // Histórico e dados do cliente — delegados ao clientOps
  // handleViewHistory, handleOpenClientData, handleClientDataChange vêm de clientOps

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

  // Dados derivados
  const availableMonths = useMemo(() => {
    const months = new Set();
    clients.forEach(c => {
      if (c.createdAt) {
        const month = c.createdAt.substring(0, 7); // "2026-04"
        months.add(month);
      }
    });
    return [...months].sort().reverse();
  }, [clients]);

  const availableReferralMonths = useMemo(() => {
    const months = new Set();
    const now = new Date();
    const currentMonthStr = now.toISOString().substring(0, 7); // "2026-04"
    months.add(currentMonthStr); // Sempre incluir mês atual
    sales.filter(s => s.clientSource && s.clientSource.trim()).forEach(s => {
      if (s.date) {
        const month = s.date.substring(0, 7);
        months.add(month);
      }
    });
    return [...months].sort().reverse();
  }, [sales]);

  const filteredClients = useMemo(() => {
    let result = clients;
    
    // Filtro por vendedor
    if (sellerFilter && sellerFilter !== 'todos') {
      result = result.filter(c => c.createdBy === sellerFilter);
    }
    
    // Filtro por mês
    if (monthFilter && monthFilter !== 'todos') {
      result = result.filter(c => c.createdAt && c.createdAt.startsWith(monthFilter));
    }
    
    // Filtro por busca
    if (clientSearchTerm) {
      const term = clientSearchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          (c.name || '').toLowerCase().includes(term) ||
          (c.cpf && c.cpf.includes(clientSearchTerm)),
      );
    }
    
    return result;
  }, [clients, clientSearchTerm, sellerFilter, monthFilter]);

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
        onOpenNotificationsModal={() => openModal('notifications')}
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
            <ClientsView clients={clients} filteredClients={filteredClients} clientSearchTerm={clientSearchTerm} setClientSearchTerm={setClientSearchTerm} sellerFilter={sellerFilter} setSellerFilter={setSellerFilter} SELLERS_LIST={SELLERS_LIST} monthFilter={monthFilter} setMonthFilter={setMonthFilter} availableMonths={availableMonths} handleViewHistory={handleViewHistory} handleOpenClientData={handleOpenClientData} fillClientData={form.fillClientData} setCurrentView={setCurrentViewState} />
          </Suspense>
        ) : currentViewState === 'referrals' ? (
          <Suspense fallback={<PageLoader />}>
            <ReferralsView sales={sales} formatCurrency={formatCurrency} formatDateBR={formatDateBR} monthFilter={referralsMonthFilter} setMonthFilter={setReferralsMonthFilter} availableMonths={availableReferralMonths} />
          </Suspense>
        ) : currentViewState === 'manager' ? (
          <Suspense fallback={<PageLoader />}>
            <ManagerView sales={sales} formatCurrency={formatCurrency} SELLERS_LIST={SELLERS_LIST} GOAL_SELLERS={GOAL_SELLERS} GOAL_MANAGER={GOAL_MANAGER} COMMISSION_PER_UNIT={COMMISSION_PER_UNIT} ELIGIBLE_FOR_GOAL={ELIGIBLE_FOR_GOAL} managerMonthFilter={managerMonthFilter} setManagerMonthFilter={setManagerMonthFilter} managerAvailableMonths={managerAvailableMonths} />
          </Suspense>
        ) : currentViewState === 'performance' ? (
          <Suspense fallback={<PageLoader />}>
            <PerformanceView sales={sales} clients={clients} settings={authState.settings} formatCurrency={formatCurrency} monthlyChartData={notifications.monthlyChartData} setCommissionModalOpen={() => openModal('commission')} GOAL_SELLERS={GOAL_SELLERS} GOAL_MANAGER={GOAL_MANAGER} COMMISSION_PER_UNIT={COMMISSION_PER_UNIT} ELIGIBLE_FOR_GOAL={ELIGIBLE_FOR_GOAL} performanceMonthFilter={performanceMonthFilter} setPerformanceMonthFilter={setPerformanceMonthFilter} performanceAvailableMonths={performanceAvailableMonths} />
          </Suspense>
        ) : (
          <Suspense fallback={<PageLoader />}>
            <SalesFormProvider value={form}>
              <SalesForm showToast={showToast} formatCurrency={formatCurrency} maskPhone={maskPhone} maskDateStrict={maskDateStrict} maskIMEI={maskIMEI} getPaymentStyles={getPaymentStyles} CATEGORIES_LIST={CATEGORIES_LIST} PRODUCT_TYPES={PRODUCT_TYPES} RAM_STORAGE_OPTIONS={RAM_STORAGE_OPTIONS} PAYMENT_METHODS={PAYMENT_METHODS} PAYMENT_TYPES={PAYMENT_TYPES} UF_LIST={UF_LIST} setClientSearchModalOpen={() => openModal('clientSearch')} setDateLockModalOpen={() => openModal('dateLock')} handleCpfChange={handleCpfChange} handleZipChange={handleZipChange} handleAddItem={itemHandlers.handleAddItem} handleEditItem={form.handleEditItem} handleAddPayment={paymentHandlers.handleAddPayment} handleEditPayment={form.handleEditPayment} handleRemovePayment={paymentHandlers.handleRemovePayment} handleSubmit={handleSubmit} handleItemPriceChange={itemHandlers.handleItemPriceChange} handlePercentChange={itemHandlers.handlePercentChange} handleDiscountValChange={itemHandlers.handleDiscountValChange} handleCurrentPaymentAmountChange={paymentHandlers.handleCurrentPaymentAmountChange} handleSaveClient={clientOps.handleSaveClient} />
            </SalesFormProvider>
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
            openReceipt={printHandlers.openReceipt}
            startEdit={(sale) => { setPendingEditItem(sale); setPendingAuthAction('edit'); openModal('managerAuth'); }}
            pendingEditItem={pendingEditItem} setPendingEditItem={setPendingEditItem}
            setPendingAuthAction={setPendingAuthAction} setManagerAuthModalOpen={() => openModal('managerAuth')}
            formatCurrency={formatCurrency} formatDateBR={formatDateBR}
            printSalesList={printHandlers.printSalesList} getPaymentStyles={getPaymentStyles}
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
        <ReceiptModalLazy isOpen={modals.receipt?.open} onClose={() => closeModal('receipt')} receipt={currentReceipt} onPrint={printHandlers.handleExportReceiptPDF} formatCurrency={formatCurrency} formatDateBR={formatDateBR} />
      </Suspense>
      <Suspense fallback={null}>
        <BackupModalLazy isOpen={modals.backup?.open} onClose={() => closeModal('backup')} onExport={backupHandlers.handleExportBackup} onSaveToCloud={backupHandlers.handleSaveToCloud} fileInputRef={fileInputInternalRef} />
      </Suspense>
      <Suspense fallback={null}>
        <LogoutModalLazy isOpen={modals.logout?.open} onClose={() => closeModal('logout')} onExportBackup={backupHandlers.handleExportBackup} onSaveToCloud={backupHandlers.handleSaveToCloud} onLogout={() => { authState.logout(); closeModal('logout'); }} />
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
        <ClientHistoryModalLazy isOpen={modals.clientHistory?.open} onClose={() => closeModal('clientHistory')} selectedClientHistory={selectedClientHistory} openReceipt={printHandlers.openReceipt} formatCurrency={formatCurrency} formatDateBR={formatDateBR} />
      </Suspense>
      <Suspense fallback={null}>
        <BirthdayAlertModalLazy isOpen={notifications.todayBirthdays.length > 0 && modals.birthdayAlert?.open} onClose={() => closeModal('birthdayAlert')} todayBirthdays={notifications.todayBirthdays} />
      </Suspense>
      <Suspense fallback={null}>
        <NotificationsModalLazy 
          isOpen={modals.notifications?.open} 
          onClose={() => closeModal('notifications')} 
          sales={sales} 
          settings={authState.settings} 
          clients={clients} 
          reminders={reminders} 
          GOAL_SELLERS={GOAL_SELLERS} 
          GOAL_MANAGER={GOAL_MANAGER} 
          ELIGIBLE_FOR_GOAL={ELIGIBLE_FOR_GOAL} 
          onGoToCalendar={() => { closeModal('notifications'); setCurrentViewState('calendar'); }} 
          formatCurrency={formatCurrency} 
        />
      </Suspense>
      <Suspense fallback={null}>
        <CommissionModalLazy isOpen={modals.commission?.open} onClose={() => closeModal('commission')} sales={sales} SELLERS_LIST={SELLERS_LIST} GOAL_SELLERS={GOAL_SELLERS} GOAL_MANAGER={GOAL_MANAGER} COMMISSION_PER_UNIT={COMMISSION_PER_UNIT} ELIGIBLE_FOR_GOAL={ELIGIBLE_FOR_GOAL} formatCurrency={formatCurrency} performanceMonthFilter={performanceMonthFilter} setPerformanceMonthFilter={setPerformanceMonthFilter} performanceAvailableMonths={performanceAvailableMonths} />
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
