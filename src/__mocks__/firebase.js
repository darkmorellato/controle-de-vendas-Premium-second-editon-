import { jest } from 'vitest';

export const mockFirestoreData = {
  vendas: [],
  clientes: [],
  rotina_state: {},
  contratos: {},
};

const createMockCollection = (collectionName) => ({
  doc: (id) => ({
    get: jest.fn(async () => ({
      exists: mockFirestoreData[collectionName]?.[id] !== undefined,
      data: () => mockFirestoreData[collectionName]?.[id],
      id,
    })),
    set: jest.fn(async (data) => {
      mockFirestoreData[collectionName] = mockFirestoreData[collectionName] || {};
      mockFirestoreData[collectionName][id] = data;
    }),
    update: jest.fn(async (data) => {
      mockFirestoreData[collectionName] = mockFirestoreData[collectionName] || {};
      mockFirestoreData[collectionName][id] = {
        ...mockFirestoreData[collectionName][id],
        ...data,
      };
    }),
    delete: jest.fn(async () => {
      delete mockFirestoreData[collectionName]?.[id];
    }),
  }),
  add: jest.fn(async (data) => {
    const id = `mock-${Date.now()}`;
    mockFirestoreData[collectionName] = mockFirestoreData[collectionName] || {};
    mockFirestoreData[collectionName][id] = data;
    return { id };
  }),
});

export const db = {
  collection: (name) => createMockCollection(name),
  doc: (collectionName, id) => createMockCollection(collectionName).doc(id),
};

export const mockOnSnapshot = (docMock, callback, _errorCallback) => {
  callback({ exists: () => false, data: () => ({}) });
  return () => {};
};

export const mockGetDocs = jest.fn(async () => ({
  docs: [],
  empty: true,
  map: () => [],
}));

export const mockGetDoc = jest.fn(async () => ({
  exists: () => false,
  data: () => ({}),
  id: 'mock-id',
}));

export const mockSetDoc = jest.fn(async () => {});
export const mockUpdateDoc = jest.fn(async () => {});
export const mockDeleteDoc = jest.fn(async () => {});
export const mockWriteBatch = jest.fn(() => ({
  update: jest.fn().mockReturnThis(),
  commit: jest.fn(async () => {}),
}));

export const mockQuery = jest.fn(() => ({}));
export const mockWhere = jest.fn(() => ({}));
export const mockOrderBy = jest.fn(() => ({}));

export const resetFirestoreMocks = () => {
  Object.keys(mockFirestoreData).forEach((key) => {
    mockFirestoreData[key] = {};
  });
};

export default {
  db,
  mockFirestoreData,
  mockOnSnapshot,
  mockGetDocs,
  mockGetDoc,
  mockSetDoc,
  mockUpdateDoc,
  mockDeleteDoc,
  mockWriteBatch,
  mockQuery,
  mockWhere,
  mockOrderBy,
  resetFirestoreMocks,
};