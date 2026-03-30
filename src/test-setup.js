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
