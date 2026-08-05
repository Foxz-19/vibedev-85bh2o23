/** @typedef {{id:string, coffeeName:string, roaster:string, brewMethod:string, rating:number, notes:string, dateTried:string, createdAt:number}} CoffeeEntry */

/** @param {unknown} value @returns {value is CoffeeEntry} */
export function isEntry(value) {
  if (!value || typeof value !== 'object') return false;
  const item = /** @type {Record<string, unknown>} */ (value);
  return typeof item.id === 'string' && typeof item.coffeeName === 'string' && item.coffeeName.trim().length > 0 &&
    typeof item.roaster === 'string' && item.roaster.trim().length > 0 && typeof item.brewMethod === 'string' &&
    Number.isInteger(item.rating) && item.rating >= 1 && item.rating <= 5 && typeof item.notes === 'string' &&
    typeof item.dateTried === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.dateTried) && typeof item.createdAt === 'number';
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
