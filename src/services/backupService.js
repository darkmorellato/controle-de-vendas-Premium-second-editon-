import { db } from '../firebase.js';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { storageService } from './storageService.js';

const isValidCPF = (cpf) => typeof cpf === 'string' && cpf.length >= 11;

const validateSale = (s) => {
  if (!s || typeof s !== 'object') return false;
  if (typeof s.id !== 'string' || s.id.length === 0) return false;
  if (typeof s.date !== 'string') return false;
  if (typeof s.employeeName !== 'string' || s.employeeName.length === 0) return false;
  if (!Array.isArray(s.items)) return false;
  if (typeof s.amount !== 'number' || isNaN(s.amount)) return false;
  return true;
};

const validateClient = (c) => {
  if (!c || typeof c !== 'object') return false;
  if (typeof c.id !== 'string' || c.id.length === 0) return false;
  if (typeof c.name !== 'string' || c.name.length === 0) return false;
  if (c.cpf && !isValidCPF(c.cpf)) return false;
  return true;
};

export const backupService = {
  async exportToFile(sales, clients, settings) {
    const reminders = storageService.load().reminders;
    const data = { sales, clients, settings, reminders };
    const fileName = `backup_miplace_${new Date().toISOString().split('T')[0]}.json`;
    const jsonString = JSON.stringify(data);

    try {
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(jsonString);
        await writable.close();
        return { success: true, method: 'picker' };
      }
    } catch (err) {
      if (err.name === 'AbortError') return { success: false, aborted: true };
    }

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    return { success: true, method: 'download' };
  },

  async importFromFiles(files) {
    const readFile = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            resolve(JSON.parse(event.target.result));
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });

    const loadedDataList = await Promise.all(Array.from(files).map(readFile));
    const allOps = [];

    loadedDataList.forEach((data) => {
      if (data.sales && Array.isArray(data.sales)) {
        const validSales = data.sales.filter(validateSale);
        validSales.forEach((s) => allOps.push({ col: 'vendas', id: s.id, data: s }));
      }
      if (data.clients && Array.isArray(data.clients)) {
        const validClients = data.clients.filter(validateClient);
        validClients.forEach((c) => allOps.push({ col: 'clientes', id: c.id, data: c }));
      }
      if (data.clients && Array.isArray(data.clients)) {
        const validClients = data.clients.filter(validateClient);
        validClients.forEach((c) => allOps.push({ col: 'clientes', id: c.id, data: c }));
      }
      if (data.reminders && Array.isArray(data.reminders) && data.reminders.length > 0) {
        const current = storageService.load();
        const existingIds = new Set((current.reminders || []).map((r) => r.id));
        const merged = [
          ...(current.reminders || []),
          ...data.reminders.filter((r) => !existingIds.has(r.id)),
        ];
        storageService.save({ reminders: merged });
      }
    });

    if (allOps.length === 0) return { success: false, count: 0 };

    const BATCH_LIMIT = 500;
    for (let i = 0; i < allOps.length; i += BATCH_LIMIT) {
      const chunk = allOps.slice(i, i + BATCH_LIMIT);
      const batch = writeBatch(db);
      chunk.forEach((op) => {
        const ref = doc(collection(db, op.col), op.id);
        batch.set(ref, op.data, { merge: true });
      });
      await batch.commit();
    }

    return { success: true, count: allOps.length };
  },
};
