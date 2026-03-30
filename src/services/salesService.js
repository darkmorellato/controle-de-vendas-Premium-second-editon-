import { db } from '../firebase.js';
import {
  collection, doc, setDoc, deleteDoc,
  query, where, orderBy, onSnapshot,
  writeBatch,
} from 'firebase/firestore';

export const salesService = {
  subscribe(cutoffStr, onUpdate, onError) {
    const q = query(
      collection(db, 'vendas'),
      where('date', '>=', cutoffStr),
      orderBy('date', 'desc'),
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const loaded = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        onUpdate(loaded);
      },
      onError,
    );
  },

  save(saleData) {
    return setDoc(doc(db, 'vendas', saleData.id), saleData);
  },

  delete(saleId) {
    return deleteDoc(doc(db, 'vendas', saleId));
  },

  generateId() {
    return doc(collection(db, 'vendas')).id;
  },

  /**
   * Atualiza clientId (e campos legados) nas vendas associadas a um cliente.
   * Para vendas novas que já têm clientId, apenas atualiza os campos de exibição fallback.
   */
  updateClientInSales(salesToUpdate, clientData) {
    if (salesToUpdate.length === 0) return Promise.resolve();
    const batch = writeBatch(db);
    salesToUpdate.forEach((sale) => {
      const ref = doc(db, 'vendas', sale.id);
      batch.update(ref, {
        clientId: clientData.id,
        // Campos legados mantidos para compatibilidade com documentos antigos
        clientName: clientData.name,
        clientCpf: clientData.cpf,
        clientPhone: clientData.phone,
        clientEmail: clientData.email,
        clientDob: clientData.dob,
        clientAddress: clientData.address,
        clientNumber: clientData.number,
        clientNeighborhood: clientData.neighborhood,
        clientCity: clientData.city,
        clientState: clientData.state,
        clientZip: clientData.zip,
      });
    });
    return batch.commit();
  },
};
