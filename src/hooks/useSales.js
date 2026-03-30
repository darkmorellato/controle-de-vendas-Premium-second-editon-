/**
 * @deprecated Este hook usa a API legada Firebase v8 compat (db.collection())
 * que não funciona com a instância v9 modular exportada por firebase.js.
 *
 * Use o SalesContext + salesService em vez deste hook.
 * Este arquivo será removido em uma versão futura.
 */
import { useState } from 'react';

/** @deprecated Use SalesContext / salesService */
export function useSales() {
  console.warn('[useSales] DEPRECATED: Use SalesContext + salesService instead.');
  const [sales] = useState([]);
  return { sales };
}
