/**
 * @deprecated Este hook usa a API legada Firebase v8 compat (db.collection())
 * que não funciona com a instância v9 modular exportada por firebase.js.
 *
 * Use o ClientContext + clientService em vez deste hook.
 * Este arquivo será removido em uma versão futura.
 */
import { useState } from 'react';

/** @deprecated Use ClientContext / clientService */
export function useClients() {
  console.warn('[useClients] DEPRECATED: Use ClientContext + clientService instead.');
  const [clients] = useState([]);
  return { clients };
}
