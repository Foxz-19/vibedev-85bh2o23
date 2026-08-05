import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEntries, saveEntries } from '../src/storage.js';

const STORAGE_KEY = 'caffeine-diary.entries.v1';
const validEntry = { id: 'coffee-1', coffeeName: 'Ethiopian Yirgacheffe', roaster: 'Little Wolf Coffee', brewMethod: 'Pour-over', rating: 5, notes: 'Floral', dateTried: '2026-08-05', createdAt: 1 };
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalWarn = console.warn;

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
}

function useStorage(storage) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
}

function restoreStorage() {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete globalThis.localStorage;
}

test.afterEach(restoreStorage);
test.beforeEach(() => { console.warn = () => {}; });
test.after(() => { console.warn = originalWarn; });

test('round-trips valid diary entries through storage', () => {
  const storage = new MemoryStorage();
  useStorage(storage);
  assert.equal(saveEntries([validEntry]), null);
  assert.deepEqual(loadEntries(), { entries: [validEntry], error: null });
});

test('recovers visibly from corrupt saved data', () => {
  const storage = new MemoryStorage();
  storage.setItem(STORAGE_KEY, '{not-json');
  useStorage(storage);
  const result = loadEntries();
  assert.deepEqual(result.entries, []);
  assert.match(result.error, /could not be read/);
});

test('recovers visibly when browser storage cannot be read', () => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Storage blocked'); } });
  assert.match(loadEntries().error, /could not be read/);
});

test('reports failed writes without changing application state', () => {
  useStorage({ getItem() { return null; }, setItem() { throw new Error('Quota exceeded'); } });
  assert.match(saveEntries([validEntry]), /could not be saved/);
});
