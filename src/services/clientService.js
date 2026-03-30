import { db } from '../firebase.js';
import {
  collection, doc, setDoc, updateDoc,
  query, orderBy, onSnapshot,
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
