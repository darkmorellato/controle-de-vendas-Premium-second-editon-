export interface SaleItem {
  id: number;
  sequence: number;
  quantity: number;
  type: string;
  description: string;
  ram_storage?: string;
  color?: string;
  imei?: string;
  financed: 'Sim' | 'Não';
  unitPrice: number;
  discount: number;
}

export interface Payment {
  id: number;
  method: string;
  type: string;
  amount: number;
  installments?: string;
}

export interface Sale {
  id: string;
  date: string;
  timestamp: string;
  clientId?: string;
  clientName: string;
  clientCpf?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientDob?: string;
  clientAddress?: string;
  clientNumber?: string;
  clientNeighborhood?: string;
  clientCity?: string;
  clientState?: string;
  clientZip?: string;
  category: string;
  items: SaleItem[];
  amount: number;
  discount: number;
  employeeName: string;
  store: string;
  payments: Payment[];
  amountPaid: number;
  change: number;
  clientSource?: string;
  paymentObservation?: string;
  contractPdfUrl?: string;
}

export interface Client {
  id: string;
  name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  dob?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface AuthSettings {
  employeeName: string;
  currency: string;
}

export interface UserCredentials {
  name: string;
  password: string;
}

export interface EmployeeAuthResult {
  success: boolean;
  employeeName?: string;
  isAdm?: boolean;
  error?: string;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ModalState {
  open: boolean;
  data: unknown;
}

export type ModalName = 
  | 'clientSearch' 
  | 'clientHistory' 
  | 'clientDetails'
  | 'clientData' 
  | 'managerAuth' 
  | 'receipt' 
  | 'dateLock' 
  | 'backup' 
  | 'logout' 
  | 'confirmSale' 
  | 'confirmChange' 
  | 'confirmClientUpdate' 
  | 'birthdayAlert' 
  | 'commission' 
  | 'notifications' 
  | 'alert';

export interface RoutineState {
  [key: string]: boolean;
}

export interface AlertData {
  message: string;
  phase: string;
}

export interface SelectedClientHistory {
  client: Client;
  history: Sale[];
}

export type CurrentView = 
  | 'dashboard' 
  | 'calendar' 
  | 'clients' 
  | 'referrals' 
  | 'manager' 
  | 'performance';

export type FilterMode = 'daily' | 'monthly' | 'yearly';

export interface GroupedSale {
  key: string;
  items: Sale[];
  total: number;
}

export interface MonthlyChartData {
  label: string;
  total: number;
  count: number;
}

export type PendingAuthAction = 'save' | 'edit' | 'delete' | 'update_client' | null;

export interface BackupResult {
  success: boolean;
  aborted?: boolean;
  count?: number;
  error?: string;
}

// ─── storageService ──────────────────────────────────────────────────────────

export interface AppStore {
  version: number;
  settings: AuthSettings;
  reminders: Reminder[];
  theme: string;
}

export interface Reminder {
  id: string;
  date?: string;
  time?: string;
  type?: string;
  description: string;
  completed?: boolean;
}

export type FormCategory = 
  | 'Venda a vista' 
  | 'Crediario Payjoy' 
  | 'Crediario Paymobi' 
  | 'Crediario Crefaz' 
  | 'Devolução' 
  | 'Troca' 
  | 'Outros';

export type ExchangeAction = 'in' | 'out';

export type PaymentMethod = 
  | 'Dinheiro' 
  | 'Pix' 
  | 'Débito' 
  | 'Crédito a vista' 
  | 'Credito Parcelado' 
  | 'Financiado Nuovo' 
  | 'Financiado Payjoy' 
  | 'Financiado Crefaz' 
  | 'Link de Pagamento' 
  | 'Pix (Chave de Pagamento)' 
  | 'Entrada de Aparelho' 
  | 'Brinde' 
  | 'Autorizado Dark/Jack'
  | 'Devolução Dinheiro'
  | 'Devolução Pix'
  | 'Devolução Estorno Cartão'
  | 'Cancelado na Financeira';

export type PaymentType = 'Integral' | 'Entrada' | 'Restante' | 'Parte do Pagamento';

export type ProductType = 
  | 'BRINDES' 
  | 'CABOS' 
  | 'CAPAS' 
  | 'CARREGADOR' 
  | 'CARTÃO SD' 
  | 'CHIP'
  | 'FONES' 
  | 'HONOR' 
  | 'IPHONE' 
  | 'MICROFONE' 
  | 'MOTOROLA' 
  | 'OUTROS'
  | 'PAGAMENTO' 
  | 'PELICULA 3D' 
  | 'PELICULA 9D' 
  | 'PILHA' 
  | 'POCO'
  | 'REALME' 
  | 'RECEPTOR' 
  | 'REDMI' 
  | 'ROCK SPACE' 
  | 'SAMSUNG';

export type RAMStorageOption = 
  | '4/128' 
  | '4/256' 
  | '4/512' 
  | '6/128' 
  | '6/256'
  | '8/256' 
  | '8/512' 
  | '12/256' 
  | '12/512';

export type UF = 
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA'
  | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI' | 'RJ' | 'RN'
  | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export interface SaleFormState {
  date: string;
  category: FormCategory;
  items: SaleItem[];
  paymentList: Payment[];
  clientName: string;
  clientCpf: string;
  clientPhone: string;
  clientEmail: string;
  clientDob: string;
  clientAddress: string;
  clientNumber: string;
  clientCity: string;
  clientZip: string;
  clientState: string;
  clientNeighborhood: string;
  newItemQty: number;
  newItemType: ProductType | '';
  newItemDesc: string;
  newItemRam: RAMStorageOption | '';
  newItemColor: string;
  newItemImei: string;
  newItemFinanced: 'Sim' | 'Não';
  newItemPrice: string;
  newItemDiscount: string;
  newItemDiscountPercent: string;
  editingItemId: number | null;
  exchangeAction: ExchangeAction;
  currentPaymentMethod: PaymentMethod | '';
  currentPaymentType: PaymentType | '';
  currentPaymentAmount: string;
  currentInstallments: string;
  editingPaymentId: number | null;
  clientSource: string;
  paymentObservation: string;
  contractPdf: File | null;
  editingId: string | null;
  isDateLocked: boolean;
  originalEmployeeName: string;
  totalAmount: number;
  totalDiscount: number;
  finalTotal: number;
  totalPaid: number;
  changeAmount: number;
  remainingToPay: number;
}

export interface UseSaleFormReturn extends SaleFormState {
  setDate: (date: string) => void;
  setCategory: (category: FormCategory) => void;
  setItems: (items: SaleItem[] | ((prev: SaleItem[]) => SaleItem[])) => void;
  setPaymentList: (payments: Payment[] | ((prev: Payment[]) => Payment[])) => void;
  setClientName: (name: string) => void;
  setClientCpf: (cpf: string) => void;
  setClientPhone: (phone: string) => void;
  setClientEmail: (email: string) => void;
  setClientDob: (dob: string) => void;
  setClientAddress: (address: string) => void;
  setClientNumber: (number: string) => void;
  setClientCity: (city: string) => void;
  setClientZip: (zip: string) => void;
  setClientState: (state: string) => void;
  setClientNeighborhood: (neighborhood: string) => void;
  setNewItemQty: (qty: number) => void;
  setNewItemType: (type: ProductType | '') => void;
  setNewItemDesc: (desc: string) => void;
  setNewItemRam: (ram: RAMStorageOption | '') => void;
  setNewItemColor: (color: string) => void;
  setNewItemImei: (imei: string) => void;
  setNewItemFinanced: (financed: 'Sim' | 'Não') => void;
  setNewItemPrice: (price: string) => void;
  setNewItemDiscount: (discount: string) => void;
  setNewItemDiscountPercent: (percent: string) => void;
  setEditingItemId: (id: number | null) => void;
  setExchangeAction: (action: ExchangeAction) => void;
  setCurrentPaymentMethod: (method: PaymentMethod | '') => void;
  setCurrentPaymentType: (type: PaymentType | '') => void;
  setCurrentPaymentAmount: (amount: string) => void;
  setCurrentInstallments: (installments: string) => void;
  setEditingPaymentId: (id: number | null) => void;
  setClientSource: (source: string) => void;
  setPaymentObservation: (observation: string) => void;
  setContractPdf: (file: File | null) => void;
  setIsDateLocked: (locked: boolean) => void;
  fillClientData: (client: Client) => void;
  handleEditItem: (item: SaleItem) => void;
  handleEditPayment: (payment: Payment) => void;
  resetForm: () => void;
  startEdit: (sale: Sale) => void;
}

export interface UseAuthReturn {
  isLoggedIn: boolean;
  isAdm: boolean;
  settings: AuthSettings;
  loginModalOpen: boolean;
  sessionPromptOpen: boolean;
  selectedUserForLogin: string | null;
  loginPasswordInput: string;
  loginAttempts: number;
  loginLockedUntil: number;
  setIsLoggedIn: (value: boolean) => void;
  setIsAdm: (value: boolean) => void;
  setSettings: (settings: AuthSettings) => void;
  setLoginModalOpen: (value: boolean) => void;
  setSessionPromptOpen: (value: boolean) => void;
  setSelectedUserForLogin: (name: string | null) => void;
  setLoginPasswordInput: (password: string) => void;
  handleLoginClick: (name: string) => void;
  performLogin: (showToast: (msg: string, type?: 'success' | 'error' | 'info') => void) => Promise<void>;
  logout: () => void;
  loadSavedSession: () => void;
  saveSession: () => void;
}

export interface UseFiltersReturn {
  filteredSales: Sale[];
  groupedSales: GroupedSale[];
  groupBy: 'date' | 'month' | 'year';
  filterDate: string;
  searchTerm: string;
  filterMode: FilterMode;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setFilterMode: (mode: FilterMode) => void;
  setFilterDate: (date: string) => void;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  handlePrevDate: () => void;
  handleNextDate: () => void;
}

export interface UseNotificationsReturn {
  todayBirthdays: Client[];
  monthlyChartData: MonthlyChartData[];
  notifs: NotificationItem[];
}

export interface NotificationItem {
  id: string;
  type: 'birthday' | 'goal' | 'warning' | 'success';
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  detail: string;
  phone?: string;
  name?: string;
  at: string;
}

export interface UseUIReturn {
  currentView: CurrentView;
  setCurrentView: (view: CurrentView) => void;
  isOnline: boolean;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
  modals: Record<ModalName, ModalState>;
  openModal: (modal: ModalName, data?: unknown) => void;
  closeModal: (modal: ModalName) => void;
  isOpen: (modal: ModalName) => boolean;
  isHelpDropdownOpen: boolean;
  setIsHelpDropdownOpen: (value: boolean) => void;
  isNotificationsDropdownOpen: boolean;
  setIsNotificationsDropdownOpen: (value: boolean) => void;
  handleOnline: () => void;
  handleOffline: () => void;
}