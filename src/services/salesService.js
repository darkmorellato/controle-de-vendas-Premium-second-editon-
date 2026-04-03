import { db, storage } from '../firebase.js';
import {
  collection, doc, setDoc, deleteDoc, getDoc,
  query, where, orderBy, onSnapshot, getDocs,
  writeBatch,
} from 'firebase/firestore';
import {
  ref, uploadBytes, getDownloadURL, deleteObject,
} from 'firebase/storage';

const MAX_CONTRACT_SIZE = 5 * 1024 * 1024; // 5MB

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
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() };
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

    // Upload to Firebase Cloud Storage (not Base64 in Firestore)
    const storageRef = ref(storage, `contratos/${saleId}.pdf`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);

    // Save metadata in Firestore (not the file itself)
    await setDoc(doc(db, 'contratos', saleId), {
      saleId,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
      storagePath: `contratos/${saleId}.pdf`,
      downloadUrl,
      createdAt: new Date().toISOString(),
    });

    return downloadUrl;
  },

  async deleteContract(saleId) {
    try {
      // Delete from Storage
      const storageRef = ref(storage, `contratos/${saleId}.pdf`);
      await deleteObject(storageRef).catch(() => {}); // ignore if not found
      // Delete metadata from Firestore
      await deleteDoc(doc(db, 'contratos', saleId));
      return true;
    } catch (error) {
      if (error.code === 'storage/object-not-found' || error.code === 'not-found') {
        return false;
      }
      throw error;
    }
  },
};
