import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDocs = (data) => data.map((item, i) => ({
  id: `doc-${i}`,
  data: () => item,
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ _type: 'collection' })),
  doc: vi.fn((dbOrCol, nameOrId, id) => {
    if (id) return { id: `${nameOrId}/${id}` };
    if (typeof dbOrCol === 'object' && dbOrCol._type === 'collection') return { id: 'mock-doc-id' };
    return { id: nameOrId };
  }),
  setDoc: vi.fn(async () => {}),
  deleteDoc: vi.fn(async () => {}),
  getDoc: vi.fn(async () => ({ exists: () => false })),
  getDocs: vi.fn(async () => ({ docs: [] })),
  query: vi.fn((...args) => args),
  where: vi.fn((field, op, val) => ({ field, op, val })),
  orderBy: vi.fn((field) => ({ field })),
  onSnapshot: vi.fn((_q, onSuccess) => {
    onSuccess({ docs: [] });
    return () => {};
  }),
  writeBatch: vi.fn(() => ({
    update: vi.fn(),
    commit: vi.fn(async () => {}),
  })),
}));

vi.mock('../../firebase.js', () => ({
  db: {},
}));

const { salesService } = await import('../salesService.js');
const { doc, setDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, onSnapshot, writeBatch } =
  await import('firebase/firestore');

describe('salesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('subscribe', () => {
    it('sets up a Firestore listener with where and orderBy', () => {
      const onUpdate = vi.fn();
      const onError = vi.fn();
      const unsub = salesService.subscribe('2025-01-01', onUpdate, onError);

      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('date', '>=', '2025-01-01');
      expect(orderBy).toHaveBeenCalledWith('date', 'desc');
      expect(onSnapshot).toHaveBeenCalled();
      expect(typeof unsub).toBe('function');
    });

    it('calls onUpdate with mapped docs', () => {
      const onUpdate = vi.fn();
      onSnapshot.mockImplementation((_q, onSuccess) => {
        onSuccess({
          docs: [
            { id: 'sale-1', data: () => ({ amount: 1000 }) },
            { id: 'sale-2', data: () => ({ amount: 2000 }) },
          ],
        });
        return () => {};
      });

      salesService.subscribe('2025-01-01', onUpdate);
      expect(onUpdate).toHaveBeenCalledWith([
        { id: 'sale-1', amount: 1000 },
        { id: 'sale-2', amount: 2000 },
      ]);
    });

    it('calls onError on listener failure', () => {
      const onUpdate = vi.fn();
      const onError = vi.fn();
      const error = new Error('permission-denied');
      onSnapshot.mockImplementation((_q, onSuccess, onErrorCb) => {
        onErrorCb(error);
        return () => {};
      });

      salesService.subscribe('2025-01-01', onUpdate, onError);
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe('getAll', () => {
    it('queries and returns sales mapped to objects', async () => {
      getDocs.mockResolvedValueOnce({
        docs: mockDocs([
          { id: 's1', date: '2025-03-01', amount: 500 },
          { id: 's2', date: '2025-03-02', amount: 1500 },
        ]),
      });

      const result = await salesService.getAll('2025-01-01');
      expect(query).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(500);
      expect(result[1].amount).toBe(1500);
    });
  });

  describe('getById', () => {
    it('returns null when sale does not exist', async () => {
      getDoc.mockResolvedValueOnce({ exists: () => false });
      const result = await salesService.getById('nonexistent');
      expect(result).toBeNull();
    });

    it('returns sale with id when found', async () => {
      getDoc.mockResolvedValueOnce({
        id: 'sale-1',
        exists: () => true,
        data: () => ({ amount: 999, date: '2025-03-01' }),
      });

      const result = await salesService.getById('sale-1');
      expect(result).toEqual({ id: 'sale-1', amount: 999, date: '2025-03-01' });
    });
  });

  describe('save', () => {
    it('calls setDoc with correct doc reference and data', async () => {
      const saleData = { id: 'sale-1', amount: 1000, date: '2025-03-01' };
      await salesService.save(saleData);
      expect(doc).toHaveBeenCalled();
      expect(setDoc).toHaveBeenCalledWith(expect.anything(), saleData);
    });
  });

  describe('delete', () => {
    it('calls deleteDoc with correct doc reference', async () => {
      await salesService.delete('sale-1');
      expect(doc).toHaveBeenCalled();
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('generateId', () => {
    it('returns a string id', () => {
      const id = salesService.generateId();
      expect(typeof id).toBe('string');
    });
  });

  describe('updateClientInSales', () => {
    it('resolves immediately for empty array', async () => {
      await expect(salesService.updateClientInSales([], {})).resolves.toBeUndefined();
    });

    it('batch updates all sales with client data', async () => {
      const batchMock = writeBatch();
      writeBatch.mockReturnValue(batchMock);

      const sales = [{ id: 's1' }, { id: 's2' }];
      const clientData = {
        id: 'c1',
        name: 'João',
        cpf: '123.456.789-00',
        phone: '(11) 99999-0000',
        email: 'joao@test.com',
        dob: '1990-01-01',
        address: 'Rua Teste',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zip: '01001-000',
      };

      await salesService.updateClientInSales(sales, clientData);
      expect(writeBatch).toHaveBeenCalled();
      expect(batchMock.update).toHaveBeenCalledTimes(2);
      expect(batchMock.commit).toHaveBeenCalled();
    });
  });

  describe('uploadContract', () => {
    it('throws when no file provided', async () => {
      await expect(salesService.uploadContract('sale-1', null)).rejects.toThrow(
        'Arquivo não fornecido'
      );
    });

    it('throws when file is not PDF', async () => {
      const file = { type: 'image/png', size: 500 };
      await expect(salesService.uploadContract('sale-1', file)).rejects.toThrow(
        'Apenas arquivos PDF são permitidos'
      );
    });

    it('throws when file exceeds 1MB limit', async () => {
      const file = { type: 'application/pdf', size: 2 * 1024 * 1024 };
      await expect(salesService.uploadContract('sale-1', file)).rejects.toThrow(
        'O arquivo deve ter no máximo 1MB'
      );
    });

    it('uploads valid PDF as base64 to Firestore', async () => {
      const mockFile = new Blob(['test pdf content'], { type: 'application/pdf' });
      Object.defineProperty(mockFile, 'name', { value: 'contract.pdf' });
      Object.defineProperty(mockFile, 'size', { value: 500 });

      const result = await salesService.uploadContract('sale-1', mockFile);
      expect(typeof result).toBe('string');
      expect(setDoc).toHaveBeenCalled();
    });
  });

  describe('deleteContract', () => {
    it('returns true when contract deleted successfully', async () => {
      const result = await salesService.deleteContract('sale-1');
      expect(result).toBe(true);
    });

    it('returns false when contract not found', async () => {
      deleteDoc.mockRejectedValueOnce({ code: 'not-found' });
      const result = await salesService.deleteContract('sale-1');
      expect(result).toBe(false);
    });

    it('rethrows non-not-found errors', async () => {
      deleteDoc.mockRejectedValueOnce(new Error('permission-denied'));
      await expect(salesService.deleteContract('sale-1')).rejects.toThrow('permission-denied');
    });
  });
});
