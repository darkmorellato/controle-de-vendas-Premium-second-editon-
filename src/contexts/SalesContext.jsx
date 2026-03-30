import { createContext, useContext, useState, useEffect } from 'react';
import { salesService } from '../services/index.js';
import { authService } from '../services/authService.js';
import { SALES_WINDOW_DAYS } from '../constants.js';

const SalesContext = createContext(null);

/**
 * Gerencia a assinatura em tempo real da coleção "vendas" do Firestore.
 * Disponibiliza `sales` para toda a árvore sem prop drilling.
 */
export function SalesProvider({ children }) {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    let unsubSales = null;

    const unsubAuth = authService.onAuthStateChanged((user) => {
      if (unsubSales) { unsubSales(); unsubSales = null; }

      if (user) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - SALES_WINDOW_DAYS);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        unsubSales = salesService.subscribe(
          cutoffStr,
          setSales,
          (err) => console.error('Erro ao carregar vendas:', err),
        );
      } else {
        setSales([]);
        authService.signInAnonymously().catch((err) => {
          console.error('Erro de autenticação anônima:', err);
        });
      }
    });

    return () => {
      unsubAuth();
      if (unsubSales) unsubSales();
    };
  }, []);

  return (
    <SalesContext.Provider value={{ sales }}>
      {children}
    </SalesContext.Provider>
  );
}

/**
 * Hook para consumir vendas do Firestore.
 * @returns {{ sales: any[] }}
 */
export function useSalesContext() {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error('useSalesContext deve ser usado dentro de SalesProvider');
  return ctx;
}
