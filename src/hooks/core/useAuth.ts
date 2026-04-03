import { useState, useCallback } from 'react';
import { authService } from '../../services/index.js';
import { storageService } from '../../services/storageService.js';
import { ADM_NAME } from '../../constants.js';

const MAX_ATTEMPTS_BEFORE_LOCK = 3;
const BASE_LOCK_MS = 2_000;
const MAX_LOCK_MS = 300_000; // 5 minutos
const LOCKOUT_STORAGE_KEY = 'login_lockout_state';

/** Persiste estado de lockout no localStorage para sobreviver a recargas de página. */
const saveLockout = (user, until, attempts) => {
  try {
    localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify({ user, until, attempts }));
  } catch {}
};

/** Lê e valida lockout persistido. Retorna null se não houver lockout ativo. */
const loadLockout = (user) => {
  try {
    const raw = localStorage.getItem(LOCKOUT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.user === user && parsed.until > Date.now()) return parsed;
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

  const handleLoginClick = useCallback((name) => {
    setSelectedUserForLogin(name);
    setLoginPasswordInput('');
    // Ao abrir o modal, verifica lockout persistido para esse usuário
    const existing = loadLockout(name);
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
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

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
      }
    },
    [loginAttempts, loginLockedUntil, loginPasswordInput, selectedUserForLogin],
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
