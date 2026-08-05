/** @typedef {{id:string, coffeeName:string, roaster:string, brewMethod:string, rating:number, notes:string, dateTried:string, createdAt:number}} CoffeeEntry */

/** @param {unknown} value @returns {value is CoffeeEntry} */
export function isEntry(value) {
  if (!value || typeof value !== 'object') return false;
  const item = /** @type {Record<string, unknown>} */ (value);
  return typeof item.id === 'string' && item.id.length <= 100 && typeof item.coffeeName === 'string' && item.coffeeName.trim().length > 0 && item.coffeeName.length <= 80 &&
    typeof item.roaster === 'string' && item.roaster.trim().length > 0 && item.roaster.length <= 80 && typeof item.brewMethod === 'string' && item.brewMethod.length > 0 &&
    Number.isInteger(item.rating) && item.rating >= 1 && item.rating <= 5 && typeof item.notes === 'string' &&
    item.notes.length <= 240 && typeof item.dateTried === 'string' && isValidDateString(item.dateTried) && Number.isFinite(item.createdAt);
}

/** @param {string} value */
export function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** @param {Date} [date] */
export function getTodayIso(date = new Date()) {
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** @param {CoffeeEntry[]} entries */
export function sortedEntries(entries) { return [...entries].sort((a, b) => b.dateTried.localeCompare(a.dateTried) || b.createdAt - a.createdAt); }

/** @param {CoffeeEntry[]} entries */
export function getStats(entries) {
  if (!entries.length) return { total: 0, average: null, best: null };
  const average = entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length;
  const best = entries.reduce((winner, entry) => entry.rating > winner.rating ? entry : winner, entries[0]);
  return { total: entries.length, average, best };
}
