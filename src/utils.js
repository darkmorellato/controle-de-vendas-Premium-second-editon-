/**
 * @typedef {Object} Utils
 * @property {(cpf: string) => boolean} validateCPF
 * @property {(plain: string) => Promise<string>} hashPassword
 * @property {(plain: string, stored: string) => Promise<boolean>} verifyPassword
 * @property {(dateString: string) => string} formatDateBR
 * @property {(value: number) => string} formatCurrency
 * @property {(str: string|number) => number} parseCurrency
 * @property {(value: string) => string} maskCPF
 * @property {(value: string) => string} maskPhone
 * @property {(value: string) => string} maskDateStrict
 * @property {(value: string) => string} maskCEP
 * @property {(value: string) => string} maskIMEI
 * @property {() => string} generateUUID
 * @property {() => string} generateSimpleId
 */

/**
 * Valida CPF brasileiro (dígitos verificadores).
 * @param {string} cpf
 * @returns {boolean}
 */
export const validateCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  let sum = 0, remainder;
  for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cpf.substring(10, 11));
};

// ─── Hashing interno ────────────────────────────────────────────────────────

/**
 * SHA-256 legado (mantido apenas para verificar hashes antigos armazenados nas env vars).
 * Não use para gerar novos hashes — use hashPassword.
 * @param {string} plain
 * @returns {Promise<string>}
 */
const legacySHA256 = async (plain) => {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(plain));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Gera hash PBKDF2 com salt aleatório (formato: "pbkdf2:<saltHex>:<hashHex>").
 * @param {string} plain
 * @returns {Promise<string>}
 */
export const hashPassword = async (plain) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(plain),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 310_000, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  const toHex = (arr) =>
    Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  return `pbkdf2:${toHex(salt)}:${toHex(new Uint8Array(bits))}`;
};

/**
 * Verifica uma senha contra um hash armazenado.
 * Suporta o formato PBKDF2 novo ("pbkdf2:<salt>:<hash>") e SHA-256 legado (64 chars hex).
 * @param {string} plain
 * @param {string} stored
 * @returns {Promise<boolean>}
 */
export const verifyPassword = async (plain, stored) => {
  if (!stored) return false;

  // Formato legado: hash SHA-256 de 64 caracteres sem prefixo
  if (!stored.includes(':')) {
    const computed = await legacySHA256(plain);
    return computed === stored;
  }

  // Formato novo: "pbkdf2:<saltHex>:<hashHex>"
  const parts = stored.split(':');
  if (parts[0] !== 'pbkdf2' || parts.length !== 3) return false;
  const [, saltHex, storedHash] = parts;
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map((h) => parseInt(h, 16)));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(plain),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 310_000, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  const computedHash = Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return computedHash === storedHash;
};

// ─── Formatação de datas ─────────────────────────────────────────────────────

/**
 * Converte data ISO (yyyy-mm-dd) para formato brasileiro (dd/mm/yyyy).
 * @param {string} dateString
 * @returns {string}
 */
export const formatDateBR = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// ─── Formatação monetária ────────────────────────────────────────────────────

/**
 * Formata número para moeda brasileira (ex: 1234.56 → "1.234,56").
 * @param {number} value
 * @returns {string}
 */
export const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.round((value + Number.EPSILON) * 100) / 100);

/**
 * Converte string de moeda brasileira ou número para número.
 * @param {string|number} str
 * @returns {number}
 */
export const parseCurrency = (str) => {
  if (typeof str === 'number') return str;
  if (typeof str !== 'string') return 0;
  return Math.round((parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0) * 100) / 100;
};

// ─── Máscaras de input ────────────────────────────────────────────────────────

/** @param {string} value @returns {string} */
export const maskCPF = (value) =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');

/** @param {string} value @returns {string} */
export const maskPhone = (value) =>
  value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d{4})/, '$1-$2')
    .slice(0, 15);

/** @param {string} value @returns {string} */
export const maskDateStrict = (value) =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{4})\d+?$/, '$1');

/** @param {string} value @returns {string} */
export const maskCEP = (value) =>
  value
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);

/** @param {string} value @returns {string} */
export const maskIMEI = (value) => value.replace(/\D/g, '').slice(0, 15);

// ─── Geração de IDs ───────────────────────────────────────────────────────────

/** @returns {string} */
export const generateUUID = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

/** @returns {string} */
export const generateSimpleId = () => {
  const arr = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
};

// ─── Lógica de negócio ────────────────────────────────────────────────────────

/**
 * Conta unidades vendidas de produtos elegíveis para meta, subtraindo devoluções.
 * @param {Array<{items?: Array<{type:string, quantity:number, unitPrice:number}>}>} sales
 * @param {string[]} ELIGIBLE
 * @returns {number}
 */
export const countUnits = (sales, ELIGIBLE) =>
  sales.reduce((acc, s) => {
    const pos = (s.items || []).filter(
      (i) => ELIGIBLE.includes(i.type) && i.unitPrice > 0,
    );
    const neg = (s.items || []).filter(
      (i) => ELIGIBLE.includes(i.type) && i.unitPrice < 0,
    );
    return (
      acc +
      pos.reduce((sum, i) => sum + i.quantity, 0) -
      neg.reduce((sum, i) => sum + Math.abs(i.quantity), 0)
    );
  }, 0);

/**
 * Retorna classes CSS para o tipo de pagamento.
 * @param {string} type
 * @returns {{ wrapper: string, amount: string }}
 */
export const getPaymentStyles = (type) => {
  switch (type) {
    case 'Entrada':
      return {
        wrapper: 'bg-gradient-to-r from-[#598c73]/20 to-[#4d7f66]/20 border-[#598c73]/40 text-[#406852]',
        amount: 'text-[#406852]',
      };
    case 'Parte do Pagamento':
      return {
        wrapper: 'bg-gradient-to-r from-[#C96A27]/20 to-[#A85115]/20 border-[#C96A27]/40 text-[#A85115]',
        amount: 'text-[#8A410D]',
      };
    case 'Restante':
      return {
        wrapper: 'bg-gradient-to-r from-[#6B4C9A]/20 to-[#563A80]/20 border-[#6B4C9A]/40 text-[#563A80]',
        amount: 'text-[#452E66]',
      };
    default:
      return {
        wrapper: 'bg-gradient-to-r from-[#2B548F]/20 to-[#224373]/20 border-[#2B548F]/40 text-[#224373]',
        amount: 'text-[#1A3357]',
      };
  }
};

/**
 * Retorna o HTML do cabeçalho de impressão com o total listado.
 * Função pura — sem manipulação de DOM.
 * @param {number} totalValue
 * @param {(v: number) => string} formatCurrencyFn
 * @returns {string}
 */
export const buildPrintHeader = (totalValue, formatCurrencyFn) =>
  `<div style="display:block;text-align:center;margin-bottom:10px;padding-bottom:8px;border-bottom:2px solid #000;font-family:Arial,sans-serif;">
    <div style="font-size:12px;font-weight:bold;color:#000;margin-top:5px;letter-spacing:1px;">
      TOTAL LISTADO: R$ ${formatCurrencyFn(totalValue)}
    </div>
  </div>`;

/**
 * Resolve dados do cliente para uma venda — prefere clientId (modelo novo),
 * cai para campos embutidos (modelo legado).
 * @param {{ clientId?: string, clientName?: string, clientCpf?: string, clientPhone?: string }} sale
 * @param {Array<{id:string, name:string, cpf:string, phone:string}>} clients
 * @returns {{ name: string, cpf: string, phone: string, email: string }}
 */
export const resolveClientForSale = (sale, clients) => {
  if (sale.clientId) {
    const found = clients.find((c) => c.id === sale.clientId);
    if (found) return found;
  }
  return {
    name: sale.clientName || '',
    cpf: sale.clientCpf || '',
    phone: sale.clientPhone || '',
    email: sale.clientEmail || '',
    dob: sale.clientDob || '',
    address: sale.clientAddress || '',
    number: sale.clientNumber || '',
    neighborhood: sale.clientNeighborhood || '',
    city: sale.clientCity || '',
    state: sale.clientState || '',
    zip: sale.clientZip || '',
  };
};
