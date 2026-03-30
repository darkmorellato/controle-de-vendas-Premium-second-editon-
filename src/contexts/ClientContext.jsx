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

  useEffect(() => {
    let unsubClients = null;

    const unsubAuth = authService.onAuthStateChanged((user) => {
      if (unsubClients) { unsubClients(); unsubClients = null; }

      if (user) {
        unsubClients = clientService.subscribe(
          setClients,
          (err) => console.error('Erro ao carregar clientes:', err),
        );
      } else {
        setClients([]);
      }
    });

    return () => {
      unsubAuth();
      if (unsubClients) unsubClients();
    };
  }, []);

  return (
    <ClientContext.Provider value={{ clients }}>
      {children}
    </ClientContext.Provider>
  );
}

/**
 * Hook para consumir clientes do Firestore.
 * @returns {{ clients: any[] }}
 */
export function useClientContext() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error('useClientContext deve ser usado dentro de ClientProvider');
  return ctx;
}
