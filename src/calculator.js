/** @typedef {{flour:number, hydration:number}} DoughValues */

export function readValues(flourInput, hydrationInput) {
  const flour = Number(flourInput);
  const hydration = Number(hydrationInput);
  if (!Number.isFinite(flour) || flour < 1 || flour > 100000) return { ok: false, field: 'flour', message: 'Enter flour between 1 and 100,000 g.' };
  if (!Number.isFinite(hydration) || hydration < 1 || hydration > 200) return { ok: false, field: 'hydration', message: 'Enter hydration between 1% and 200%.' };
  return { ok: true, values: { flour, hydration } };
}

export function isValidDough({ flour, hydration }) { return Number.isFinite(flour) && flour >= 1 && flour <= 100000 && Number.isFinite(hydration) && hydration >= 1 && hydration <= 200; }

export function waterFor({ flour, hydration }) { return flour * hydration / 100; }

export function formatGrams(value) { return `${Number.isInteger(value) ? value : value.toFixed(1)} g`; }

export function describe(hydration) {
  if (hydration < 65) return 'Stiff dough';
  if (hydration < 76) return 'Classic loaf';
  if (hydration <= 82) return 'Open crumb';
  return 'Wet & sticky';
}

export function meterPercent(hydration) { return Math.max(4, Math.min(100, hydration / 1.4)); }
