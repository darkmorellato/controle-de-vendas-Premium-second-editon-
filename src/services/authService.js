import { auth, db } from '../firebase.js';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { verifyPassword } from '../utils.js';
import { ADM_NAME, ADM_HASH, EMPLOYEES_CREDENTIALS, MANAGER_HASH } from '../constants.js';

export const authService = {
  signInAnonymously() {
    return signInAnonymously(auth);
  },

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  get currentUser() {
    return auth.currentUser;
  },

  async loginEmployee(name, password) {
    if (!ADM_HASH) {
      return { success: false, error: 'Configuração de auth ausente. Contate o administrador.' };
    }

    if (name === ADM_NAME) {
      const valid = await verifyPassword(password, ADM_HASH);
      if (valid) return { success: true, employeeName: ADM_NAME, isAdm: true };
      return { success: false, error: 'Senha ADM incorreta' };
    }

    const storedHash = EMPLOYEES_CREDENTIALS[name];
    if (!storedHash) return { success: false, error: 'Usuário não encontrado' };

    const valid = await verifyPassword(password, storedHash);
    if (valid) return { success: true, employeeName: name, isAdm: false };
    return { success: false, error: 'Senha incorreta' };
  },

  async verifyManagerPassword(password) {
    if (!MANAGER_HASH) return false;
    return verifyPassword(password, MANAGER_HASH);
  },

  async logAction(action, userName) {
    try {
      await addDoc(collection(db, 'system_logs'), {
        action,
        user: userName,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Erro ao registrar log:', e);
    }
  },
};
