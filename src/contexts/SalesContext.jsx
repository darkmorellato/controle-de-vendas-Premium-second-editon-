import { createContext, useContext } from 'react';
import { useSalesQuery } from '../hooks/useSalesQuery.ts';

const SalesContext = createContext(null);

export function SalesProvider({ children }) {
  const { data: sales = [], isLoading, error, refetch } = useSalesQuery();

  return (
    <SalesContext.Provider value={{ sales, loading: isLoading, error, refetch }}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSalesContext() {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error('useSalesContext deve ser usado dentro de SalesProvider');
  return ctx;
}