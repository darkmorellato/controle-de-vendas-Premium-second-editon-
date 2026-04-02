import { db } from '../firebase.js';
import {
  collection, doc, setDoc, updateDoc,
  query, orderBy, onSnapshot, getDocs, getDoc,
} from 'firebase/firestore';

export const clientService = {
  subscribe(onUpdate, onError) {
    const q = query(collection(db, 'clientes'), orderBy('name'));
    return onSnapshot(
      q,
      (snapshot) => {
        const loaded = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        onUpdate(loaded);
      },
      onError,
    );
  },

  async getAll() {
    const q = query(collection(db, 'clientes'), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async getById(clientId) {
    const docRef = doc(db, 'clientes', clientId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() };
  },

  save(clientData) {
    return setDoc(doc(db, 'clientes', clientData.id), clientData);
  },

  update(clientId, data) {
    return updateDoc(doc(db, 'clientes', clientId), data);
  },

  generateId() {
    return doc(collection(db, 'clientes')).id;
  },
};
