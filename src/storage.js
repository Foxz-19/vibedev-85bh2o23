import { isEntry } from './model.js';

const STORAGE_KEY = 'caffeine-diary.entries.v1';

/** @returns {{entries: import('./model.js').CoffeeEntry[], error: string|null}} */
export function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [], error: null };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isEntry)) throw new Error('Invalid diary format');
    return { entries: parsed, error: null };
  } catch (error) {
    console.warn('Unable to read diary', error);
    return { entries: [], error: 'Your saved diary could not be read, so a fresh log was opened.' };
  }
}

/** @param {import('./model.js').CoffeeEntry[]} entries @returns {string|null} */
export function saveEntries(entries) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); return null; }
  catch (error) { console.warn('Unable to save diary', error); return 'This cup could not be saved. Check your browser storage and try again.'; }
}
