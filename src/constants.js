/**
 * @typedef {Object} Constants
 * @property {string[]} SELLERS_LIST
 * @property {Record<string, string>} EMPLOYEES_CREDENTIALS
 * @property {string} ADM_NAME
 * @property {string | undefined} ADM_HASH
 * @property {string[]} CATEGORIES_LIST
 * @property {string[]} PRODUCT_TYPES
 * @property {string[]} RAM_STORAGE_OPTIONS
 * @property {string[]} PAYMENT_METHODS
 * @property {string[]} PAYMENT_TYPES
 * @property {string[]} UF_LIST
 * @property {Object} ROUTINE_TASKS
 * @property {string[]} ELIGIBLE_FOR_GOAL
 * @property {number} GOAL_SELLERS
 * @property {number} GOAL_MANAGER
 * @property {number} COMMISSION_PER_UNIT
 * @property {string | undefined} MANAGER_HASH
 * @property {string} APP_VERSION
 * @property {number} SALES_WINDOW_DAYS
 * @property {Array<{title: string, url: string, icon: string}>} HELP_LINKS
 */

/** @type {string[]} */
export const SELLERS_LIST = ['Gabriela Ferreira', 'Sabrina Almeida'];

/**
 * Hashes de senha dos funcionários.
 * OBRIGATÓRIO: defina VITE_HASH_GABRIELA e VITE_HASH_SABRINA nas variáveis de ambiente.
 * Sem fallbacks hardcoded — não exponha hashes no bundle.
 * @type {Record<string, string | undefined>}
 */
export const EMPLOYEES_CREDENTIALS = {
  'Gabriela Ferreira': import.meta.env.VITE_HASH_GABRIELA,
  'Sabrina Almeida': import.meta.env.VITE_HASH_SABRINA,
};

/** @type {string} */
export const ADM_NAME = import.meta.env.VITE_ADM_NAME || 'Dark Morellato';

/**
 * Hash de senha do administrador.
 * OBRIGATÓRIO: defina VITE_ADM_HASH nas variáveis de ambiente.
 * @type {string | undefined}
 */
export const ADM_HASH = import.meta.env.VITE_ADM_HASH;

/** @type {string[]} */
export const CATEGORIES_LIST = [
  'Venda a vista',
  'Crediario Payjoy',
  'Crediario Paymobi',
  'Crediario Crefaz',
  'Devolução',
  'Troca',
  'Outros',
];

/** @type {string[]} */
export const PRODUCT_TYPES = [
  'BRINDES', 'CABOS', 'CAPAS', 'CARREGADOR', 'CARTÃO SD', 'CHIP',
  'FONES', 'HONOR', 'IPHONE', 'MICROFONE', 'MOTOROLA', 'OUTROS',
  'PAGAMENTO', 'PELICULA 3D', 'PELICULA 9D', 'PILHA', 'POCO',
  'REALME', 'RECEPTOR', 'REDMI', 'ROCK SPACE', 'SAMSUNG',
];

/** @type {string[]} */
export const RAM_STORAGE_OPTIONS = [
  '4/128', '4/256', '4/512', '6/128', '6/256',
  '8/256', '8/512', '12/256', '12/512',
];

/** @type {string[]} */
export const PAYMENT_METHODS = [
  'Dinheiro', 'Pix', 'Débito', 'Crédito a vista', 'Credito Parcelado',
  'Financiado Nuovo', 'Financiado Payjoy', 'Financiado Crefaz',
  'Link de Pagamento', 'Pix (Chave de Pagamento)', 'Entrada de Aparelho',
  'Brinde', 'Autorizado Dark/Jack',
];

/** @type {string[]} */
export const PAYMENT_TYPES = ['Integral', 'Entrada', 'Restante', 'Parte do Pagamento'];

/** @type {string[]} */
export const UF_LIST = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

/** @type {{ morning: string[], afternoon: string[], evening: string[] }} */
export const ROUTINE_TASKS = {
  morning: [
    'Fazer Café e limpar a area do cafe',
    'Limpeza da Loja Geral, Varrer, Passar Pano, Limpar Vitrine e Aparelhos',
    "Postar Bom dia, Facebook, What's app e Instagram",
    'Responder Clientes e verificar mensagens em todas redes sociais.',
    'Enviar os Contratos das vendas do dia anterior',
    'Verificar Preços da vitrine',
    'Contagem de estoque de aparelhos',
  ],
  afternoon: [
    'Responder Clientes e verificar mensagens nas redes sociais',
    'Fazer Postagens no Facebook nos grupos (feira do rolo)',
    "Postar no What's app",
    'Postar Reels com Capa Personalizada',
    'Fazer post na pagina do Facebook',
    'Fazer videos da Loja para novos Posts (atendimento, clientes, lançamentos e criativos)',
    'Entrega de panfletos em dias fracos ou parados',
  ],
  evening: [
    'Verificar seus lançamentos e seus clientes.',
    'Pos vendas e seus clientes',
    'Buscar diariamente novos clientes',
    'Controle de vendas Individuais',
  ],
};

/** @type {string[]} */
export const ELIGIBLE_FOR_GOAL = ['HONOR', 'IPHONE', 'MOTOROLA', 'POCO', 'REALME', 'REDMI', 'SAMSUNG'];

/** @type {number} */
export const GOAL_SELLERS = 25;

/** @type {number} */
export const GOAL_MANAGER = 65;

/** @type {number} */
export const COMMISSION_PER_UNIT = 10;

/**
 * Hash de senha do gerente para autorizações sensíveis.
 * OBRIGATÓRIO: defina VITE_MANAGER_HASH nas variáveis de ambiente.
 * @type {string | undefined}
 */
export const MANAGER_HASH = import.meta.env.VITE_MANAGER_HASH;

/** @type {string} */
export const APP_VERSION = 'v2.5.0';

/** @type {number} */
export const SALES_WINDOW_DAYS = 90;

/** @type {Array<{title: string, url: string, icon: string}>} */
export const HELP_LINKS = [
  { title: "Termo de Garantia Android/iPhone", url: "https://termo-a-vista.vercel.app", icon: "FileText" },
  { title: "Termo Responsabilidade Payjoy", url: "https://termo-payjoy.vercel.app", icon: "FileText" },
  { title: "Termo Responsabilidade Nuovo", url: "https://termo-nuovo.vercel.app", icon: "FileText" },
  { title: "Ordem de Serviço", url: "https://o-s-kappa.vercel.app", icon: "Wrench" },
  { title: "Contato Garantias", url: "https://contato-garantia.vercel.app", icon: "Phone" },
  { title: "Calendário Pagamento Nuovo", url: "https://calendario-paymobi.vercel.app", icon: "Calendar" },
  { title: "Calculadora Taxa Cartão", url: "https://calculadora-taxa-de-cart.vercel.app", icon: "Calculator" },
  { title: "Calculadora Payjoy", url: "https://calculadora-payjoy.vercel.app", icon: "Calculator" },
  { title: "Calculadora Nuovo", url: "https://nextjs-boilerplate-xij5.vercel.app", icon: "Calculator" },
  { title: "Suporte ADM", url: "https://wa.me/5519989354849", icon: "WhatsApp" },
];
