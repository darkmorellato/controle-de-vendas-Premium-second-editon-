import { createContext, useContext, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';

const AuthContext = createContext(null);

/**
 * Fornece estado de autenticação para toda a árvore de componentes.
 * Substitui a necessidade de prop drilling de isLoggedIn, isAdm, settings, etc.
 */
export function AuthProvider({ children, showToast }) {
  const auth = useAuth();

  // Carrega sessão salva na inicialização
  useEffect(() => {
    auth.loadSavedSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persiste settings quando mudam
  useEffect(() => {
    auth.saveSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.settings]);

  return (
    <AuthContext.Provider value={{ ...auth, showToast }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para consumir o contexto de autenticação.
 * @returns {ReturnType<typeof useAuth> & { showToast: Function }}
 */
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext deve ser usado dentro de AuthProvider');
  return ctx;
}
