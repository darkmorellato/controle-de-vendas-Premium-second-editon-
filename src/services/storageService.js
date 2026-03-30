/**
 * storageService — gerencia o localStorage com versioning e migração automática.
 *
 * Estrutura unificada (chave: "miplace_store"):
 * {
 *   version: number,
 *   settings: { employeeName: string, currency: string },
 *   reminders: Array,
 *   theme: string,
 * }
 *
 * Migrações:
 *   v0 → v1: coleta chaves legadas espalhadas (vendas_settings_v14, miplace_reminders,
 *             miplace_theme) no objeto unificado e remove as chaves antigas.
 */

const STORAGE_KEY = 'miplace_store';
const CURRENT_VERSION = 1;

/** @returns {{ version: number, settings: {employeeName:string,currency:string}, reminders: any[], theme: string }} */
const defaultStore = () => ({
  version: CURRENT_VERSION,
  settings: { employeeName: '', currency: 'R$' },
  reminders: [],
  theme: 'dark',
});

/**
 * Lê e valida o store do localStorage. Retorna defaults em caso de erro.
 */
const readRaw = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Migra do formato legado (chaves espalhadas) para o formato unificado.
 * @param {Record<string,string>} legacySnapshot - snapshot das chaves legadas relevantes
 * @returns {ReturnType<typeof defaultStore>}
 */
const migrateToV1 = (legacySnapshot) => {
  const store = defaultStore();
  store.version = 1;

  // Coleta settings legadas
  try {
    const legacySettings = legacySnapshot['vendas_settings_v14']
      ? JSON.parse(legacySnapshot['vendas_settings_v14'])
      : null;
    if (legacySettings?.employeeName) {
      store.settings = { ...store.settings, ...legacySettings };
    }
  } catch {}

  // Coleta reminders legados
  try {
    const legacyReminders = legacySnapshot['miplace_reminders']
      ? JSON.parse(legacySnapshot['miplace_reminders'])
      : [];
    if (Array.isArray(legacyReminders)) store.reminders = legacyReminders;
  } catch {}

  // Coleta tema legado
  if (legacySnapshot['miplace_theme']) {
    store.theme = legacySnapshot['miplace_theme'];
  }

  return store;
};

/** Chaves legadas que serão removidas após migração */
const LEGACY_KEYS = ['vendas_settings_v14', 'miplace_reminders', 'miplace_theme'];

export const storageService = {
  /**
   * Carrega o store atual. Retorna defaults se não existir.
   */
  load() {
    const raw = readRaw();
    if (!raw) return defaultStore();
    return { ...defaultStore(), ...raw };
  },

  /**
   * Salva parcialmente o store (merge com o existente).
   * @param {Partial<ReturnType<typeof defaultStore>>} partial
   */
  save(partial) {
    try {
      const current = this.load();
      const next = { ...current, ...partial, version: CURRENT_VERSION };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('storageService.save error:', e);
    }
  },

  /**
   * Executa migrações pendentes. Deve ser chamado na inicialização do app.
   * Idempotente — sem efeito se a versão já estiver atualizada.
   */
  runMigrations() {
    const raw = readRaw();
    const currentVersion = raw?.version ?? 0;

    if (currentVersion >= CURRENT_VERSION) return;

    // v0 → v1: coletar chaves legadas
    if (currentVersion < 1) {
      const legacySnapshot = {};
      LEGACY_KEYS.forEach((key) => {
        const val = localStorage.getItem(key);
        if (val !== null) legacySnapshot[key] = val;
      });

      const migratedStore = migrateToV1(legacySnapshot);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedStore));

      // Remove chaves legadas
      LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    }
  },

  /**
   * Apaga completamente o store (usado em logout total, se necessário).
   */
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
