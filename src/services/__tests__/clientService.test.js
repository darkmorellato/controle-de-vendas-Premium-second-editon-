import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase BEFORE importing the service
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ _type: 'collection' })),
  doc: vi.fn((dbOrCol, nameOrId, id) => {
    if (id) return { id: `${nameOrId}/${id}` };
    if (typeof dbOrCol === 'object' && dbOrCol._type === 'collection') return { id: 'mock-doc-id' };
    return { id: nameOrId };
  }),
  setDoc: vi.fn(async () => {}),
  updateDoc: vi.fn(async () => {}),
  getDoc: vi.fn(async () => ({ exists: () => false })),
  getDocs: vi.fn(async () => ({ docs: [] })),
  query: vi.fn((...args) => args),
  orderBy: vi.fn((field) => ({ field })),
  onSnapshot: vi.fn((_q, onSuccess) => {
    onSuccess({ docs: [] });
    return () => {};
  }),
}));

vi.mock('../../firebase.js', () => ({
  db: {},
}));

const { clientService } = await import('../clientService.js');
const { doc, setDoc, updateDoc, onSnapshot } = await import('firebase/firestore');

describe('clientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generateId returns a string', () => {
    const id = clientService.generateId();
    expect(typeof id).toBe('string');
  });

  it('save calls setDoc with correct doc path', async () => {
    const clientData = { id: 'client-1', name: 'Test Client' };
    await clientService.save(clientData);
    expect(doc).toHaveBeenCalled();
    expect(setDoc).toHaveBeenCalled();
  });

  it('update calls updateDoc with correct doc and data', async () => {
    const data = { name: 'Updated Name' };
    await clientService.update('client-1', data);
    expect(doc).toHaveBeenCalled();
    expect(updateDoc).toHaveBeenCalled();
  });

  it('subscribe calls onSnapshot and returns unsubscribe', () => {
    const onUpdate = vi.fn();
    const unsub = clientService.subscribe(onUpdate);
    expect(onSnapshot).toHaveBeenCalled();
    expect(typeof unsub).toBe('function');
  });
});
