import { useEffect, lazy, Suspense } from 'react';
import Icons from './components/Icons.jsx';
import Header from './components/views/Header.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import SimpleCalendar from './components/SimpleCalendar.jsx';
import TaskAlertModal from './components/TaskAlertModal.jsx';

// Lazy imports para Views (Code Splitting)
const LoginScreen = lazy(() => import('./components/views/LoginScreen.jsx'));
const ClientsView = lazy(() => import('./components/views/ClientsView.jsx'));
const ReferralsView = lazy(() => import('./components/views/ReferralsView.jsx'));
const ManagerView = lazy(() => import('./components/views/ManagerView.jsx'));
const PerformanceView = lazy(() => import('./components/views/PerformanceView.jsx'));
const SalesForm = lazy(() => import('./components/views/SalesForm.jsx'));
const SalesList = lazy(() => import('./components/views/SalesList.jsx'));

// Componente de loading para lazy loading
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-odoo-500"></div>
      <p className="text-sm text-slate-400">Carregando...</p>
    </div>
  </div>
);
import {
  BackupModal, LogoutModal, ConfirmSaleModal, ConfirmChangeModal,
  DateLockModal, ConfirmClientUpdateModal, ClientSearchModal,
  ClientHistoryModal, ClientDataModal, ManagerAuthModal, BirthdayAlertModal,
  CommissionModal, ReceiptModal,
} from './components/modals/index.js';
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
import { useSalesContext } from './contexts/SalesContext.jsx';
import { useClientContext } from './contexts/ClientContext.jsx';
import { useUIContext } from './contexts/UIContext.jsx';
import { useAuth } from './hooks/useAuth.js';
import { useSaleForm } from './hooks/useSaleForm.js';
import { useFilters } from './hooks/useFilters.js';
import { useNotifications } from './hooks/useNotifications.js';
import { useAppState } from './hooks/useAppState.js';
import { useRoutineHandlers } from './hooks/useRoutineHandlers.js';
import { useClientHandlers } from './hooks/useClientHandlers.js';
import { useItemHandlers } from './hooks/useItemHandlers.js';
import { usePaymentHandlers } from './hooks/usePaymentHandlers.js';
import { useSaleHandlers } from './hooks/useSaleHandlers.js';
import { useAuthHandlers } from './hooks/useAuthHandlers.js';
import { usePrintHandlers } from './hooks/usePrintHandlers.js';
import { useBackupHandlers } from './hooks/useBackupHandlers.js';

const App = (): JSX.Element => {
  const { sales } = useSalesContext();
  const { clients } = useClientContext();
  const ui = useUIContext();
  const {
    currentView: currentViewState, setCurrentView: setCurrentViewState,
    isOnline, handleOnline, handleOffline,
    toasts, showToast, removeToast,
    modals, openModal, closeModal,
    isHelpDropdownOpen, setIsHelpDropdownOpen,
    isNotificationsDropdownOpen, setIsNotificationsDropdownOpen,
  } = ui;

  const authState = useAuth();
  const form = useSaleForm();
  const filters = useFilters(sales, clients);
  const notifications = useNotifications(authState.isLoggedIn, sales, clients);

  const appState = useAppState({ 
    sales, 
    clients,
    isLoggedIn: authState.isLoggedIn,
    employeeName: authState.settings.employeeName,
  });
  const {
    routineState,
    reminders,
    setReminders,
    managerPassword,
    setManagerPassword,
    pendingAuthAction,
    setPendingAuthAction,
    pendingEditItem,
    setPendingEditItem,
    dateLockPassword,
    setDateLockPassword,
    selectedClientForEdit,
    setSelectedClientForEdit,
    selectedClientHistory,
    setSelectedClientHistory,
    clientSearchTerm,
    setClientSearchTerm,
    alertModalOpen,
    setAlertModalOpen,
    alertData,
    setAlertData,
    lastAlertTime,
    setLastAlertTime,
    currentReceipt,
    setCurrentReceipt,
    fileInputRef,
    filteredClients,
  } = appState;

  const { toggleRoutine } = useRoutineHandlers({
    routineState,
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
    employeeName: authState.settings.employeeName,
    selectedClientForEdit,
    setSelectedClientForEdit: appState.setSelectedClientForEdit,
    openModal,
    closeModal,
    showToast,
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
    showToast,
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
    showToast,
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
    authSettings: authState.settings,
    openModal,
    closeModal,
    showToast,
    resetForm: form.resetForm,
    handleSaveClient: clientHandlers.handleSaveClient,
  });

  const { handleManagerAuth } = useAuthHandlers({
    managerPassword,
    pendingAuthAction,
    pendingEditItem,
    closeModal,
    showToast,
    performSave: saleHandlers.performSave,
    performDelete: saleHandlers.performDelete,
    performClientUpdate: clientHandlers.performClientUpdate,
    startEdit: form.startEdit,
    setManagerPassword,
    setPendingAuthAction,
    setPendingEditItem,
  });

  const printHandlers = usePrintHandlers({
    currentReceipt,
    showToast,
    setItemsPerPage: filters.setItemsPerPage,
    setCurrentReceipt,
    openModal,
  });

  const backupHandlers = useBackupHandlers({
    sales,
    clients,
    authSettings: authState.settings,
    modals,
    closeModal,
    showToast,
    fileInputRef,
  });

  useEffect(() => {
    authState.loadSavedSession();
  }, [authState.loadSavedSession]);

  useEffect(() => {
    authState.saveSession();
  }, [authState.settings, authState.saveSession]);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  useEffect(() => {
    if (form.items.length > 0) {
      const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }
  }, [form.items]);

  useEffect(() => {
    if (modals.receipt?.open) document.body.classList.add('receipt-open');
    else document.body.classList.remove('receipt-open');
  }, [modals.receipt?.open]);

  if (!authState.isLoggedIn) {
    return (
      <LoginScreen
        toasts={toasts}
        setToasts={() => {}}
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
            <ClientsView clients={clients} filteredClients={filteredClients} clientSearchTerm={clientSearchTerm} setClientSearchTerm={setClientSearchTerm} handleViewHistory={clientHandlers.handleViewHistory} handleOpenClientData={clientHandlers.handleOpenClientData} fillClientData={form.fillClientData} setCurrentView={setCurrentViewState} />
          </Suspense>
        ) : currentViewState === 'performance' ? (
          <Suspense fallback={<PageLoader />}>
            <PerformanceView sales={sales} clients={clients} formatCurrency={formatCurrency} SELLERS_LIST={SELLERS_LIST} GOAL_SELLERS={GOAL_SELLERS} GOAL_MANAGER={GOAL_MANAGER} COMMISSION_PER_UNIT={COMMISSION_PER_UNIT} ELIGIBLE_FOR_GOAL={ELIGIBLE_FOR_GOAL} />
          </Suspense>
        ) : currentViewState === 'manager' ? (
          <Suspense fallback={<PageLoader />}>
            <ManagerView sales={sales} formatCurrency={formatCurrency} SELLERS_LIST={SELLERS_LIST} GOAL_SELLERS={GOAL_SELLERS} GOAL_MANAGER={GOAL_MANAGER} COMMISSION_PER_UNIT={COMMISSION_PER_UNIT} ELIGIBLE_FOR_GOAL={ELIGIBLE_FOR_GOAL} />
          </Suspense>
        ) : currentViewState === 'referrals' ? (
          <Suspense fallback={<PageLoader />}>
            <ReferralsView sales={sales} formatCurrency={formatCurrency} />
          </Suspense>
        ) : currentViewState === 'sales' ? (
          <Suspense fallback={<PageLoader />}>
            <SalesForm
              date={form.date} setDate={form.setDate} isDateLocked={form.isDateLocked} setIsDateLocked={form.setIsDateLocked}
              clientName={form.clientName} setClientName={form.setClientName}
              clientCpf={form.clientCpf} setClientCpf={form.setClientCpf}
              clientPhone={form.clientPhone} setClientPhone={form.setClientPhone}
              clientEmail={form.clientEmail} setClientEmail={form.setClientEmail}
              clientDob={form.clientDob} setClientDob={form.setClientDob}
              clientAddress={form.clientAddress} setClientAddress={form.setClientAddress}
              clientNumber={form.clientNumber} setClientNumber={form.setClientNumber}
              clientCity={form.clientCity} setClientCity={form.setClientCity}
              clientZip={form.clientZip} setClientZip={form.setClientZip}
              clientState={form.clientState} setClientState={form.setClientState}
              clientNeighborhood={form.clientNeighborhood} setClientNeighborhood={form.setClientNeighborhood}
              category={form.category} setCategory={form.setCategory}
              items={form.items} setItems={form.setItems}
              newItemQty={form.newItemQty} setNewItemQty={form.setNewItemQty}
              newItemType={form.newItemType} setNewItemType={form.setNewItemType}
              newItemDesc={form.newItemDesc} setNewItemDesc={form.setNewItemDesc}
              newItemRam={form.newItemRam} setNewItemRam={form.setNewItemRam}
              newItemColor={form.newItemColor} setNewItemColor={form.setNewItemColor}
              newItemImei={form.newItemImei} setNewItemImei={form.setNewItemImei}
              newItemFinanced={form.newItemFinanced} setNewItemFinanced={form.setNewItemFinanced}
              newItemPrice={form.newItemPrice} setNewItemPrice={form.setNewItemPrice}
              newItemDiscount={form.newItemDiscount} setNewItemDiscount={form.setNewItemDiscount}
              newItemDiscountPercent={form.newItemDiscountPercent} setNewItemDiscountPercent={form.setNewItemDiscountPercent}
              editingItemId={form.editingItemId} setEditingItemId={form.setEditingItemId}
              exchangeAction={form.exchangeAction} setExchangeAction={form.setExchangeAction}
              totalAmount={form.totalAmount} totalDiscount={form.totalDiscount} finalTotal={form.finalTotal}
              totalPaid={form.totalPaid} remainingToPay={form.remainingToPay} changeAmount={form.changeAmount}
              paymentList={form.paymentList}
              currentPaymentMethod={form.currentPaymentMethod} setCurrentPaymentMethod={form.setCurrentPaymentMethod}
              currentPaymentType={form.currentPaymentType} setCurrentPaymentType={form.setCurrentPaymentType}
              currentPaymentAmount={form.currentPaymentAmount} setCurrentPaymentAmount={form.setCurrentPaymentAmount}
              currentInstallments={form.currentInstallments} setCurrentInstallments={form.setCurrentInstallments}
              paymentObservation={form.paymentObservation} setPaymentObservation={form.setPaymentObservation}
              editingId={form.editingId}
              handleAddItem={itemHandlers.handleAddItem} handleRemoveItem={itemHandlers.handleRemoveItem} handleUpdateItem={itemHandlers.handleUpdateItem}
              handleAddPayment={paymentHandlers.handleAddPayment} handleRemovePayment={paymentHandlers.handleRemovePayment} handleUpdatePayment={paymentHandlers.handleUpdatePayment}
              resetForm={form.resetForm} startEdit={form.startEdit} fillClientData={form.fillClientData}
              openClientSearchModal={() => openModal('clientSearch')} openDateLockModal={() => openModal('dateLock')}
              openConfirmSaleModal={() => openModal('confirmSale')} openConfirmChangeModal={() => openModal('confirmChange')}
              openClientHistoryModal={() => openModal('clientHistory')}
              clientSource={form.clientSource}
              handleSaveClient={clientHandlers.handleSaveClient}
              clientSource={form.clientSource} setClientSource={form.setClientSource}
              employeeName={authState.settings.employeeName} isAdm={authState.isAdm}
              CATEGORIES_LIST={CATEGORIES_LIST} PRODUCT_TYPES={PRODUCT_TYPES} RAM_STORAGE_OPTIONS={RAM_STORAGE_OPTIONS} PAYMENT_METHODS={PAYMENT_METHODS} PAYMENT_TYPES={PAYMENT_TYPES} UF_LIST={UF_LIST}
              formatCurrency={formatCurrency}
            />
          </Suspense>
        ) : (
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
            />
          </Suspense>
        )}
      </div>
        ) : currentViewState === 'referrals' ? (
          <ReferralsView sales={sales} formatCurrency={formatCurrency} formatDateBR={formatDateBR} />
        ) : currentViewState === 'manager' ? (
          <ManagerView sales={sales} formatCurrency={formatCurrency} SELLERS_LIST={SELLERS_LIST} GOAL_SELLERS={GOAL_SELLERS} GOAL_MANAGER={GOAL_MANAGER} COMMISSION_PER_UNIT={COMMISSION_PER_UNIT} ELIGIBLE_FOR_GOAL={ELIGIBLE_FOR_GOAL} />
        ) : currentViewState === 'performance' ? (
          <PerformanceView sales={sales} clients={clients} settings={authState.settings} formatCurrency={formatCurrency} monthlyChartData={notifications.monthlyChartData} setCommissionModalOpen={() => openModal('commission')} GOAL_SELLERS={GOAL_SELLERS} GOAL_MANAGER={GOAL_MANAGER} COMMISSION_PER_UNIT={COMMISSION_PER_UNIT} ELIGIBLE_FOR_GOAL={ELIGIBLE_FOR_GOAL} />
        ) : (
          <>
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
              editingId={form.editingId} resetForm={form.resetForm}
              totalAmount={form.totalAmount} totalDiscount={form.totalDiscount} finalTotal={form.finalTotal} remainingToPay={form.remainingToPay} totalPaid={form.totalPaid} changeAmount={form.changeAmount}
              handleAddItem={itemHandlers.handleAddItem} handleEditItem={form.handleEditItem} handleAddPayment={paymentHandlers.handleAddPayment} handleEditPayment={paymentHandlers.handleEditPayment} handleRemovePayment={paymentHandlers.handleRemovePayment}
              handleSubmit={saleHandlers.handleSubmit} handleCpfChange={clientHandlers.handleCpfChange} handleZipChange={clientHandlers.handleZipChange} maskPhone={maskPhone} maskDateStrict={maskDateStrict} maskIMEI={maskIMEI}
              handleItemPriceChange={itemHandlers.handleItemPriceChange} handlePercentChange={itemHandlers.handlePercentChange} handleDiscountValChange={itemHandlers.handleDiscountValChange}
              handleCurrentPaymentAmountChange={paymentHandlers.handleCurrentPaymentAmountChange} getPaymentStyles={getPaymentStyles}
              setClientSearchModalOpen={() => openModal('clientSearch')} handleSaveClient={clientHandlers.handleSaveClient}
              CATEGORIES_LIST={CATEGORIES_LIST} PRODUCT_TYPES={PRODUCT_TYPES} RAM_STORAGE_OPTIONS={RAM_STORAGE_OPTIONS} PAYMENT_METHODS={PAYMENT_METHODS} PAYMENT_TYPES={PAYMENT_TYPES} UF_LIST={UF_LIST}
              formatCurrency={formatCurrency}
            />
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
            />
          </>
        )}
      </div>

      <ClientDataModal
        isOpen={modals.clientData?.open}
        onClose={() => closeModal('clientData')}
        selectedClientForEdit={selectedClientForEdit}
        onFieldChange={clientHandlers.handleClientDataChange}
        onConfirm={clientHandlers.confirmClientUpdate}
        UF_LIST={UF_LIST}
      />

      <ReceiptModal isOpen={modals.receipt?.open} onClose={() => closeModal('receipt')} receipt={currentReceipt} onPrint={printHandlers.handleExportReceiptPDF} formatCurrency={formatCurrency} formatDateBR={formatDateBR} />
      <BackupModal isOpen={modals.backup?.open} onClose={() => closeModal('backup')} onExport={backupHandlers.handleExportBackup} onSaveToCloud={backupHandlers.handleSaveToCloud} fileInputRef={fileInputRef} />
      <LogoutModal isOpen={modals.logout?.open} onClose={() => closeModal('logout')} onExportBackup={backupHandlers.handleExportBackup} onSaveToCloud={backupHandlers.handleSaveToCloud} onLogout={() => { authState.logout(); closeModal('logout'); }} />
      <ConfirmSaleModal isOpen={modals.confirmSale?.open} onClose={() => closeModal('confirmSale')} onConfirm={saleHandlers.confirmSave} />
      <ConfirmChangeModal isOpen={modals.confirmChange?.open} onClose={() => closeModal('confirmChange')} onConfirm={saleHandlers.confirmChange} changeAmount={form.changeAmount} formatCurrency={formatCurrency} />
      <DateLockModal isOpen={modals.dateLock?.open} onClose={() => { closeModal('dateLock'); setDateLockPassword(''); }} dateLockPassword={dateLockPassword} setDateLockPassword={setDateLockPassword} onUnlock={() => { form.setIsDateLocked(false); closeModal('dateLock'); setDateLockPassword(''); showToast('Data liberada!'); }} MANAGER_HASH={MANAGER_HASH} hashPassword={verifyPassword} showToast={showToast} />
      <ClientSearchModal isOpen={modals.clientSearch?.open} onClose={() => closeModal('clientSearch')} searchTerm={clientSearchTerm} setSearchTerm={setClientSearchTerm} filteredClients={filteredClients} onSelectClient={(c) => { form.fillClientData(c); closeModal('clientSearch'); }} />
      <ClientHistoryModal isOpen={modals.clientHistory?.open} onClose={() => closeModal('clientHistory')} selectedClientHistory={selectedClientHistory} openReceipt={printHandlers.openReceipt} formatCurrency={formatCurrency} formatDateBR={formatDateBR} />
      <BirthdayAlertModal isOpen={notifications.todayBirthdays.length > 0 && modals.birthdayAlert?.open} onClose={() => closeModal('birthdayAlert')} todayBirthdays={notifications.todayBirthdays} />
      <CommissionModal isOpen={modals.commission?.open} onClose={() => closeModal('commission')} sales={sales} SELLERS_LIST={SELLERS_LIST} GOAL_SELLERS={GOAL_SELLERS} GOAL_MANAGER={GOAL_MANAGER} COMMISSION_PER_UNIT={COMMISSION_PER_UNIT} ELIGIBLE_FOR_GOAL={ELIGIBLE_FOR_GOAL} formatCurrency={formatCurrency} />
      <ManagerAuthModal isOpen={modals.managerAuth?.open} onClose={() => closeModal('managerAuth')} managerPassword={managerPassword} setManagerPassword={setManagerPassword} onAuth={handleManagerAuth} pendingAuthAction={pendingAuthAction} />
      <ConfirmClientUpdateModal isOpen={modals.confirmClientUpdate?.open} onClose={() => closeModal('confirmClientUpdate')} onConfirm={clientHandlers.performClientUpdate} />

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