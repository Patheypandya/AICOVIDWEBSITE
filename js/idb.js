// Phrases Anne adds herself (with optional voice recordings), stored in IndexedDB on the phone.
const DB = 'kemcho', STORE = 'phrases';

function open() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id' });
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

function tx(mode, fn) {
  return open().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(req?.result);
    t.onerror = () => reject(t.error);
  }));
}

export async function allCustom() {
  try {
    const rows = await tx('readonly', (s) => s.getAll());
    return (rows || []).sort((a, b) => a.createdAt - b.createdAt);
  } catch { return []; }
}
export const putCustom = (p) => tx('readwrite', (s) => s.put(p));
export const deleteCustom = (id) => tx('readwrite', (s) => s.delete(id));
