import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ _type: 'collection' })),
  doc: vi.fn((dbOrCol, nameOrId, id) => {
    if (id) return { id: `${nameOrId}/${id}` };
    if (typeof dbOrCol === 'object' && dbOrCol._type === 'collection') return { id: 'mock-doc-id' };
    return { id: nameOrId };
  }),
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    commit: vi.fn(async () => {}),
  })),
}));

vi.mock('../../firebase.js', () => ({
  db: {},
}));

vi.mock('../storageService.js', () => ({
  storageService: {
    load: vi.fn(() => ({ reminders: [] })),
    save: vi.fn(),
  },
}));

const originalShowSaveFilePicker = window.showSaveFilePicker;
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;
const originalBlob = global.Blob;

describe('backupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.showSaveFilePicker = originalShowSaveFilePicker;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    global.Blob = originalBlob;
  });

  describe('exportToFile', () => {
    it('uses showSaveFilePicker when available', async () => {
      const mockHandle = {
        createWritable: vi.fn(async () => ({
          write: vi.fn(async () => {}),
          close: vi.fn(async () => {}),
        })),
      };
      window.showSaveFilePicker = vi.fn(async () => mockHandle);

      const { backupService } = await import('../backupService.js');
      const result = await backupService.exportToFile([], [], {});

      expect(window.showSaveFilePicker).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.method).toBe('picker');
    });

    it('falls back to blob download when showSaveFilePicker not available', async () => {
      window.showSaveFilePicker = undefined;
      URL.createObjectURL = vi.fn(() => 'blob:url');
      URL.revokeObjectURL = vi.fn();

      const mockA = { click: vi.fn() };
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockA);

      const { backupService } = await import('../backupService.js');
      const result = await backupService.exportToFile(
        [{ id: 's1', date: '2025-01-01', employeeName: 'test', items: [], amount: 100 }],
        [],
        {}
      );

      expect(result.success).toBe(true);
      expect(result.method).toBe('download');
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockA.click).toHaveBeenCalled();

      createElementSpy.mockRestore();
    });

    it('returns aborted when user cancels save dialog', async () => {
      const abortError = new Error('User cancelled');
      abortError.name = 'AbortError';
      window.showSaveFilePicker = vi.fn(async () => {
        throw abortError;
      });

      const { backupService } = await import('../backupService.js');
      const result = await backupService.exportToFile([], [], {});

      expect(result.success).toBe(false);
      expect(result.aborted).toBe(true);
    });

    it('includes reminders from storageService in export', async () => {
      const mockWrite = vi.fn(async () => {});
      const mockClose = vi.fn(async () => {});
      const mockHandle = {
        createWritable: vi.fn(async () => ({
          write: mockWrite,
          close: mockClose,
        })),
      };
      window.showSaveFilePicker = vi.fn(async () => mockHandle);

      const { storageService } = await import('../storageService.js');
      storageService.load.mockReturnValue({
        reminders: [{ id: 'r1', text: 'test' }],
      });

      const { backupService } = await import('../backupService.js');
      await backupService.exportToFile([], [], {});

      const writtenData = JSON.parse(mockWrite.mock.calls[0][0]);
      expect(writtenData.reminders).toEqual([{ id: 'r1', text: 'test' }]);
    });
  });

  describe('importFromFiles', () => {
    it('imports valid sales and clients from JSON file', async () => {
      const { backupService } = await import('../backupService.js');

      const mockFile = new Blob(
        [
          JSON.stringify({
            sales: [
              { id: 's1', date: '2025-01-01', employeeName: 'joao', items: [], amount: 500 },
            ],
            clients: [{ id: 'c1', name: 'Maria' }],
          }),
        ],
        { type: 'application/json' }
      );
      mockFile.name = 'backup.json';

      const result = await backupService.importFromFiles([mockFile]);
      expect(result.success).toBe(true);
      expect(result.count).toBeGreaterThan(0);
    });

    it('filters out invalid sales', async () => {
      const { backupService } = await import('../backupService.js');

      const mockFile = new Blob(
        [
          JSON.stringify({
            sales: [
              { id: 's1', date: '2025-01-01', employeeName: 'joao', items: [], amount: 500 },
              { id: '', date: '2025-01-01', employeeName: 'joao', items: [], amount: 500 },
              { date: '2025-01-01', employeeName: 'joao', items: [], amount: 500 },
              null,
              'not an object',
            ],
          }),
        ],
        { type: 'application/json' }
      );
      mockFile.name = 'backup.json';

      const result = await backupService.importFromFiles([mockFile]);
      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });

    it('filters out invalid clients', async () => {
      const { backupService } = await import('../backupService.js');

      const mockFile = new Blob(
        [
          JSON.stringify({
            clients: [
              { id: 'c1', name: 'Valid' },
              { id: '', name: 'Invalid id' },
              { id: 'c2', name: '' },
              { id: 'c3', name: 'Bad CPF', cpf: '123' },
            ],
          }),
        ],
        { type: 'application/json' }
      );
      mockFile.name = 'backup.json';

      const result = await backupService.importFromFiles([mockFile]);
      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
    });

    it('returns failure when no valid data found', async () => {
      const { backupService } = await import('../backupService.js');

      const mockFile = new Blob(
        [JSON.stringify({ sales: [], clients: [] })],
        { type: 'application/json' }
      );
      mockFile.name = 'backup.json';

      const result = await backupService.importFromFiles([mockFile]);
      expect(result.success).toBe(false);
      expect(result.count).toBe(0);
    });

    it('merges reminders without duplicating existing ids', async () => {
      const { storageService } = await import('../storageService.js');
      storageService.load.mockReturnValue({
        reminders: [{ id: 'r1', text: 'existing' }],
      });

      const { backupService } = await import('../backupService.js');

      const mockFile = new Blob(
        [
          JSON.stringify({
            reminders: [
              { id: 'r1', text: 'duplicate' },
              { id: 'r2', text: 'new' },
            ],
          }),
        ],
        { type: 'application/json' }
      );
      mockFile.name = 'backup.json';

      await backupService.importFromFiles([mockFile]);
      expect(storageService.save).toHaveBeenCalledWith({
        reminders: [
          { id: 'r1', text: 'existing' },
          { id: 'r2', text: 'new' },
        ],
      });
    });

    it('handles multiple files in one import', async () => {
      const { backupService } = await import('../backupService.js');

      const file1 = new Blob(
        [
          JSON.stringify({
            sales: [
              { id: 's1', date: '2025-01-01', employeeName: 'joao', items: [], amount: 100 },
            ],
          }),
        ],
        { type: 'application/json' }
      );
      file1.name = 'backup1.json';

      const file2 = new Blob(
        [
          JSON.stringify({
            sales: [
              { id: 's2', date: '2025-01-02', employeeName: 'maria', items: [], amount: 200 },
            ],
          }),
        ],
        { type: 'application/json' }
      );
      file2.name = 'backup2.json';

      const result = await backupService.importFromFiles([file1, file2]);
      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
    });

    it('chunks batch writes when exceeding 500 ops', async () => {
      const { backupService } = await import('../backupService.js');

      const sales = Array.from({ length: 600 }, (_, i) => ({
        id: `s${i}`,
        date: '2025-01-01',
        employeeName: 'joao',
        items: [],
        amount: 100,
      }));

      const mockFile = new Blob(
        [JSON.stringify({ sales })],
        { type: 'application/json' }
      );
      mockFile.name = 'large-backup.json';

      const result = await backupService.importFromFiles([mockFile]);
      expect(result.success).toBe(true);
      expect(result.count).toBe(600);
    });
  });
});
