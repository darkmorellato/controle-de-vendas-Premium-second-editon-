// ─── Entidades do domínio ────────────────────────────────────────────────────

export interface SaleItem {
  id: number;
  sequence: number;
  quantity: number;
  type: string;
  description: string;
  ram_storage?: string;
  color?: string;
  imei?: string;
  financed?: string;
  unitPrice: number;
  discount: number;
}

export interface Payment {
  id: number;
  method: string;
  type: string;
  amount: number;
  installments?: string | null;
}

export interface Sale {
  id: string;
  date: string;
  timestamp: string;
  /** Referência normalizada ao cliente (modelo novo). */
  clientId?: string;
  /** @deprecated Usar clientId + resolveClientForSale(). Mantido para compatibilidade com docs antigos. */
  clientName?: string;
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

export interface Settings {
  employeeName: string;
  currency: string;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface AppNotification {
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

export interface Reminder {
  id: string;
  date?: string;
  time?: string;
  type?: string;
  description: string;
  completed?: boolean;
}

export interface ModalState {
  open: boolean;
  data: unknown | null;
}

export interface ModalMap {
  [key: string]: ModalState;
}

export interface ChartDataPoint {
  label: string;
  total: number;
  count: number;
}

export interface HelpLink {
  title: string;
  url: string;
  icon: string;
}

export interface GroupedSales {
  key: string;
  items: Sale[];
  total: number;
}

export interface PaymentStyle {
  wrapper: string;
  amount: string;
}

// ─── storageService ──────────────────────────────────────────────────────────

export interface AppStore {
  version: number;
  settings: Settings;
  reminders: Reminder[];
  theme: string;
}

// ─── authService ─────────────────────────────────────────────────────────────

export interface LoginResult {
  success: boolean;
  employeeName?: string;
  isAdm?: boolean;
  error?: string;
}
