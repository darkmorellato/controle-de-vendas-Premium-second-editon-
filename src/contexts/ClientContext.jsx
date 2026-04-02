import { createContext, useContext, useState, useEffect } from 'react';
import { clientService } from '../services/index.js';
import { authService } from '../services/authService.js';

const ClientContext = createContext(null);

/**
 * Gerencia a assinatura em tempo real da coleção "clientes" do Firestore.
 * Disponibiliza `clients` para toda a árvore sem prop drilling.
 */
export function ClientProvider({ children }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubClients = null;

    const unsubAuth = authService.onAuthStateChanged((user) => {
      if (unsubClients) { unsubClients(); unsubClients = null; }

      if (user) {
        unsubClients = clientService.subscribe(
          (loaded) => {
            setClients(loaded);
            setLoading(false);
          },
          () => {
            setLoading(false);
          },
        );
      } else {
        setClients([]);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubClients) unsubClients();
    };
  }, []);

  return (
    <ClientContext.Provider value={{ clients, loading }}>
      {children}
    </ClientContext.Provider>
  );
}

/**
 * Hook para consumir clientes do Firestore.
 */
export function useClientContext() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error('useClientContext deve ser usado dentro de ClientProvider');
  return ctx;
}