import { createContext, useContext } from 'react';
import { useClientsQuery } from '../hooks/data/useClientsQuery.ts';

const ClientContext = createContext(null);

export function ClientProvider({ children }) {
  const { data: clients = [], isLoading, error, refetch } = useClientsQuery();

  return (
    <ClientContext.Provider value={{ clients, loading: isLoading, error, refetch }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClientContext() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error('useClientContext deve ser usado dentro de ClientProvider');
  return ctx;
}