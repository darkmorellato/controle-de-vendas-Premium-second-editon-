import { db } from '../firebase.js';
import {
  collection, doc, setDoc, deleteDoc,
  query, where, orderBy, onSnapshot, getDocs,
  writeBatch,
} from 'firebase/firestore';

const MAX_CONTRACT_SIZE = 1 * 1024 * 1024; // 1MB (Firestore limit)

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

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

  async getAll(cutoffStr) {
    const q = query(
      collection(db, 'vendas'),
      where('date', '>=', cutoffStr),
      orderBy('date', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async getById(saleId) {
    const docRef = doc(db, 'vendas', saleId);
    const snapshot = await getDocs(query(collection(db, 'vendas'), where('__name__', '==', saleId)));
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() };
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

  async uploadContract(saleId, file) {
    if (!file) {
      throw new Error('Arquivo não fornecido');
    }

    if (file.type !== 'application/pdf') {
      throw new Error('Apenas arquivos PDF são permitidos');
    }

    if (file.size > MAX_CONTRACT_SIZE) {
      throw new Error('O arquivo deve ter no máximo 5MB');
    }

    // Convert PDF to Base64 and store in Firestore
    const base64Data = await fileToBase64(file);
    
    // Save contract to a separate collection for backup
    await setDoc(doc(db, 'contratos', saleId), {
      saleId,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
      base64Data,
      createdAt: new Date().toISOString(),
    });

    // Return a data URL that can be used directly (works for PDFs)
    return base64Data;
  },

  async deleteContract(saleId) {
    try {
      await deleteDoc(doc(db, 'contratos', saleId));
      return true;
    } catch (error) {
      if (error.code === 'not-found') {
        return false;
      }
      throw error;
    }
  },
};
