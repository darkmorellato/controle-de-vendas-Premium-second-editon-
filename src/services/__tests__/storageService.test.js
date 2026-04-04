import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('storageService', () => {
  let setItemSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setItemSpy = null;
  });

  afterEach(() => {
    if (setItemSpy) {
      setItemSpy.mockRestore();
    }
  });

  describe('load', () => {
    it('returns default store when nothing in localStorage', async () => {
      const { storageService } = await import('../storageService.js');
      const store = storageService.load();

      expect(store).toEqual({
        version: 1,
        settings: { employeeName: '', currency: 'R$' },
        reminders: [],
        theme: 'dark',
      });
    });

    it('returns stored data when present', async () => {
      localStorage.setItem(
        'miplace_store',
        JSON.stringify({
          version: 1,
          settings: { employeeName: 'João', currency: 'US$' },
          reminders: [{ id: 'r1' }],
          theme: 'light',
        })
      );

      const { storageService } = await import('../storageService.js');
      const store = storageService.load();

      expect(store.settings.employeeName).toBe('João');
      expect(store.settings.currency).toBe('US$');
      expect(store.reminders).toEqual([{ id: 'r1' }]);
      expect(store.theme).toBe('light');
    });

    it('returns defaults when stored data is corrupted', async () => {
      localStorage.setItem('miplace_store', 'not valid json');

      const { storageService } = await import('../storageService.js');
      const store = storageService.load();

      expect(store.version).toBe(1);
      expect(store.reminders).toEqual([]);
    });

    it('merges stored data with defaults for missing fields', async () => {
      localStorage.setItem(
        'miplace_store',
        JSON.stringify({ theme: 'light' })
      );

      const { storageService } = await import('../storageService.js');
      const store = storageService.load();

      expect(store.theme).toBe('light');
      expect(store.settings).toEqual({ employeeName: '', currency: 'R$' });
      expect(store.reminders).toEqual([]);
    });
  });

  describe('save', () => {
    it('merges partial data with existing store', async () => {
      const { storageService } = await import('../storageService.js');

      storageService.save({ theme: 'light' });
      const store = storageService.load();

      expect(store.theme).toBe('light');
      expect(store.settings.employeeName).toBe('');
    });

    it('preserves existing data when saving partial updates', async () => {
      const { storageService } = await import('../storageService.js');

      storageService.save({ settings: { employeeName: 'Maria' } });
      storageService.save({ theme: 'light' });

      const store = storageService.load();
      expect(store.theme).toBe('light');
      expect(store.settings.employeeName).toBe('Maria');
    });

    it('always sets version to current', async () => {
      const { storageService } = await import('../storageService.js');

      storageService.save({ theme: 'dark' });
      const store = storageService.load();

      expect(store.version).toBe(1);
    });

    it('silently handles localStorage quota errors', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      const { storageService } = await import('../storageService.js');
      expect(() => storageService.save({ theme: 'dark' })).not.toThrow();

      expect(consoleWarn).toHaveBeenCalled();

      consoleWarn.mockRestore();
    });
  });

  describe('runMigrations', () => {
    it('does nothing when version is already current', async () => {
      localStorage.setItem(
        'miplace_store',
        JSON.stringify({ version: 1, settings: {}, reminders: [], theme: 'dark' })
      );

      const { storageService } = await import('../storageService.js');
      storageService.runMigrations();

      const store = storageService.load();
      expect(store.version).toBe(1);
    });

    it('migrates v0 to v1 collecting legacy keys', async () => {
      localStorage.setItem('vendas_settings_v14', JSON.stringify({ employeeName: 'Legacy User' }));
      localStorage.setItem('miplace_reminders', JSON.stringify([{ id: 'legacy-r1' }]));
      localStorage.setItem('miplace_theme', 'light');

      const { storageService } = await import('../storageService.js');
      storageService.runMigrations();

      const store = storageService.load();
      expect(store.version).toBe(1);
      expect(store.settings.employeeName).toBe('Legacy User');
      expect(store.reminders).toEqual([{ id: 'legacy-r1' }]);
      expect(store.theme).toBe('light');

      expect(localStorage.getItem('vendas_settings_v14')).toBeNull();
      expect(localStorage.getItem('miplace_reminders')).toBeNull();
      expect(localStorage.getItem('miplace_theme')).toBeNull();
    });

    it('handles missing legacy keys gracefully', async () => {
      const { storageService } = await import('../storageService.js');
      storageService.runMigrations();

      const store = storageService.load();
      expect(store.version).toBe(1);
      expect(store.settings.employeeName).toBe('');
      expect(store.reminders).toEqual([]);
      expect(store.theme).toBe('dark');
    });

    it('handles corrupted legacy settings gracefully', async () => {
      localStorage.setItem('vendas_settings_v14', 'not json');

      const { storageService } = await import('../storageService.js');
      storageService.runMigrations();

      const store = storageService.load();
      expect(store.version).toBe(1);
      expect(store.settings.employeeName).toBe('');
    });

    it('is idempotent — running twice has no extra effect', async () => {
      localStorage.setItem('miplace_theme', 'light');

      const { storageService } = await import('../storageService.js');
      storageService.runMigrations();
      storageService.runMigrations();

      const store = storageService.load();
      expect(store.theme).toBe('light');
      expect(store.version).toBe(1);
    });
  });

  describe('clear', () => {
    it('removes the store from localStorage', async () => {
      const { storageService } = await import('../storageService.js');

      storageService.save({ theme: 'dark' });
      expect(localStorage.getItem('miplace_store')).not.toBeNull();

      storageService.clear();
      expect(localStorage.getItem('miplace_store')).toBeNull();
    });
  });
});
