import '@testing-library/jest-dom';

/**
 * Garante que crypto.subtle está disponível no ambiente jsdom/Node.
 * Node 18+ expõe webcrypto globalmente, mas jsdom pode não incluir SubtleCrypto.
 */
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
  const { webcrypto } = await import('node:crypto');
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: false,
    configurable: true,
  });
}

/**
 * Mock das variáveis de ambiente do Firebase para testes
 * (não disponíveis no CI)
 */
import { vi } from 'vitest';
vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key');
vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com');
vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project');
vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test.appspot.com');
vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789');
vi.stubEnv('VITE_FIREBASE_APP_ID', '1:123456789:web:test');
vi.stubEnv('VITE_FIREBASE_MEASUREMENT_ID', 'G-TEST123');
