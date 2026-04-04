import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('firebase/auth', () => ({
  signInAnonymously: vi.fn(async () => ({ user: { uid: 'anon-123' } })),
  onAuthStateChanged: vi.fn((_auth, cb) => {
    cb({ uid: 'test-user' });
    return () => {};
  }),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ _type: 'collection' })),
  addDoc: vi.fn(async () => ({ id: 'log-123' })),
}));

vi.mock('../../firebase.js', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-user' } },
}));

vi.mock('../../utils.js', () => ({
  verifyPassword: vi.fn(async (password, hash) => {
    if (!hash) return false;
    if (hash === 'legacy-hash') return password === 'test';
    return password === 'correct-password';
  }),
}));

vi.mock('../../constants.js', () => ({
  ADM_NAME: 'admin',
  ADM_HASH: 'pbkdf2:admin-hash',
  EMPLOYEES_CREDENTIALS: {
    joao: 'pbkdf2:joao-hash',
    maria: 'pbkdf2:maria-hash',
  },
  MANAGER_HASH: 'pbkdf2:manager-hash',
}));

const { authService } = await import('../authService.js');
const { signInAnonymously, onAuthStateChanged } = await import('firebase/auth');
const { addDoc: addDocFb } = await import('firebase/firestore');

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signInAnonymously', () => {
    it('calls Firebase signInAnonymously', async () => {
      await authService.signInAnonymously();
      expect(signInAnonymously).toHaveBeenCalled();
    });
  });

  describe('onAuthStateChanged', () => {
    it('registers listener and returns unsubscribe function', () => {
      const callback = vi.fn();
      const unsub = authService.onAuthStateChanged(callback);
      expect(onAuthStateChanged).toHaveBeenCalled();
      expect(typeof unsub).toBe('function');
    });
  });

  describe('currentUser', () => {
    it('returns the current Firebase user', () => {
      expect(authService.currentUser).toEqual({ uid: 'test-user' });
    });
  });

  describe('loginEmployee', () => {
    it('logs in ADM with correct password', async () => {
      const result = await authService.loginEmployee('admin', 'correct-password');
      expect(result).toEqual({ success: true, employeeName: 'admin', isAdm: true });
    });

    it('rejects ADM with wrong password', async () => {
      const result = await authService.loginEmployee('admin', 'wrong-password');
      expect(result).toEqual({ success: false, error: 'Senha ADM incorreta' });
    });

    it('logs in employee with correct password', async () => {
      const result = await authService.loginEmployee('joao', 'correct-password');
      expect(result).toEqual({ success: true, employeeName: 'joao', isAdm: false });
    });

    it('rejects employee with wrong password', async () => {
      const result = await authService.loginEmployee('joao', 'wrong-password');
      expect(result).toEqual({ success: false, error: 'Senha incorreta' });
    });

    it('rejects unknown employee', async () => {
      const result = await authService.loginEmployee('unknown', 'any-password');
      expect(result).toEqual({ success: false, error: 'Usuário não encontrado' });
    });
  });

  describe('verifyManagerPassword', () => {
    it('returns true for correct manager password', async () => {
      const result = await authService.verifyManagerPassword('correct-password');
      expect(result).toBe(true);
    });

    it('returns false for wrong manager password', async () => {
      const result = await authService.verifyManagerPassword('wrong-password');
      expect(result).toBe(false);
    });
  });

  describe('logAction', () => {
    it('writes to system_logs collection', async () => {
      await authService.logAction('login', 'admin');
      expect(addDocFb).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          action: 'login',
          user: 'admin',
        })
      );
    });

    it('silently handles errors without throwing', async () => {
      addDocFb.mockRejectedValueOnce(new Error('Firestore error'));
      await expect(authService.logAction('delete', 'joao')).resolves.not.toThrow();
    });
  });
});
