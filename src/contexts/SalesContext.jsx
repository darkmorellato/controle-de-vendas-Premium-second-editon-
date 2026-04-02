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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubSales = null;

    // Forçar login anônimo primeiro
    authService.signInAnonymously()
      .catch(() => {});

    // Depois assinar auth
    const unsubAuth = authService.onAuthStateChanged((user) => {
      if (unsubSales) { unsubSales(); unsubSales = null; }

      if (user) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - SALES_WINDOW_DAYS);
        const cutoffStr = cutoff.toISOString().split('T')[0];

        unsubSales = salesService.subscribe(
          cutoffStr,
          (loaded) => {
            setSales(loaded);
            setLoading(false);
          },
          (err) => {
            setError(err);
            setLoading(false);
          },
        );
      } else {
        setSales([]);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubSales) unsubSales();
    };
  }, []);

  return (
    <SalesContext.Provider value={{ sales, loading, error }}>
      {children}
    </SalesContext.Provider>
  );
}

/**
 * Hook para consumir vendas do Firestore.
 */
export function useSalesContext() {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error('useSalesContext deve ser usado dentro de SalesProvider');
  return ctx;
}
