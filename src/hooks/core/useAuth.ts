import { useState, useCallback, useRef } from 'react';
import { authService } from '../../services/index.js';
import { storageService } from '../../services/storageService.js';
import { ADM_NAME } from '../../constants.js';

const MAX_ATTEMPTS_BEFORE_LOCK = 3;
const BASE_LOCK_MS = 2_000;
const MAX_LOCK_MS = 300_000; // 5 minutos
const LOCKOUT_STORAGE_KEY = 'login_lockout_state';

const LOCKOUT_HMAC_KEY = 'lockout_integrity_v1';

const generateLockoutHmac = async (user: string, until: number, attempts: number) => {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(LOCKOUT_HMAC_KEY + user),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    enc.encode(`${user}:${until}:${attempts}`),
  );
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

const saveLockout = async (user: string, until: number, attempts: number) => {
  try {
    const hmac = await generateLockoutHmac(user, until, attempts);
    localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify({ user, until, attempts, hmac }));
  } catch {}
};

const loadLockout = async (user: string) => {
  try {
    const raw = localStorage.getItem(LOCKOUT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.user !== user) return null;
    if (parsed.until <= Date.now()) return null;
    if (typeof parsed.until !== 'number' || typeof parsed.attempts !== 'number') return null;
    const expectedHmac = await generateLockoutHmac(user, parsed.until, parsed.attempts);
    if (parsed.hmac !== expectedHmac) return null;
    return parsed;
  } catch {}
  return null;
};

const clearLockout = () => {
  try { localStorage.removeItem(LOCKOUT_STORAGE_KEY); } catch {}
};

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdm, setIsAdm] = useState(false);
  const [settings, setSettings] = useState({ employeeName: '', currency: 'R$' });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [sessionPromptOpen, setSessionPromptOpen] = useState(false);
  const [selectedUserForLogin, setSelectedUserForLogin] = useState(null);
  const [loginPasswordInput, setLoginPasswordInput] = useState('');

  // Brute-force protection
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginLockedUntil, setLoginLockedUntil] = useState(0);

  const handleLoginClick = useCallback(async (name) => {
    setSelectedUserForLogin(name);
    setLoginPasswordInput('');
    const existing = await loadLockout(name);
    if (existing) {
      setLoginAttempts(existing.attempts);
      setLoginLockedUntil(existing.until);
    } else {
      setLoginAttempts(0);
      setLoginLockedUntil(0);
    }
    setLoginModalOpen(true);
  }, []);

  const performLogin = useCallback(
    async (showToast) => {
      const now = Date.now();
      if (now < loginLockedUntil) {
        const secs = Math.ceil((loginLockedUntil - now) / 1000);
        showToast(`Aguarde ${secs}s antes de tentar novamente.`, 'error');
        return;
      }

      const result = await authService.loginEmployee(selectedUserForLogin, loginPasswordInput);

      if (result.success) {
        setLoginAttempts(0);
        setLoginLockedUntil(0);
        clearLockout();
        setSettings({ employeeName: result.employeeName });
        setIsAdm(result.isAdm);
        setIsLoggedIn(true);
        setLoginModalOpen(false);
        showToast(
          result.isAdm
            ? `Bem-vindo, ${ADM_NAME}! 🔑`
            : `Bem-vindo, ${result.employeeName}!`,
        );
      } else {
        setLoginAttempts((prev) => {
          const newAttempts = prev + 1;
          if (newAttempts >= MAX_ATTEMPTS_BEFORE_LOCK) {
            const lockMs = Math.min(
              MAX_LOCK_MS,
              BASE_LOCK_MS * Math.pow(2, newAttempts - MAX_ATTEMPTS_BEFORE_LOCK),
            );
            const lockUntil = Date.now() + lockMs;
            setLoginLockedUntil(lockUntil);
            saveLockout(selectedUserForLogin, lockUntil, newAttempts);
            const secs = Math.ceil(lockMs / 1000);
            const display = secs >= 60 ? `${Math.ceil(secs / 60)}min` : `${secs}s`;
            showToast(
              `${result.error} — Aguarde ${display} antes de tentar novamente.`,
              'error',
            );
          } else {
            showToast(result.error, 'error');
          }
          return newAttempts;
        });
      }
    },
    [loginLockedUntil, loginPasswordInput, selectedUserForLogin],
  );

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setIsAdm(false);
  }, []);

  const loadSavedSession = useCallback(() => {
    storageService.runMigrations();
    const store = storageService.load();
    if (store.settings?.employeeName) {
      setSettings(store.settings);
      setSelectedUserForLogin(store.settings.employeeName);
      setSessionPromptOpen(true);
    }
  }, []);

  const saveSession = useCallback(() => {
    storageService.save({ settings });
  }, [settings]);

  return {
    isLoggedIn, isAdm, settings,
    loginModalOpen, sessionPromptOpen, selectedUserForLogin, loginPasswordInput,
    loginAttempts, loginLockedUntil,
    setIsLoggedIn, setIsAdm, setSettings,
    setLoginModalOpen, setSessionPromptOpen, setSelectedUserForLogin, setLoginPasswordInput,
    handleLoginClick, performLogin, logout, loadSavedSession, saveSession,
  };
}
