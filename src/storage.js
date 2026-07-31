import { isValidDough } from './calculator.js';

const KEY = 'crumb-recipes-v1';

/** @typedef {{id:string,name:string,flour:number,hydration:number,createdAt:number}} Recipe */

function validRecipe(value) { return value && typeof value.id === 'string' && typeof value.name === 'string' && value.name.trim() && value.name.length <= 32 && Number.isFinite(value.createdAt) && isValidDough(value); }

export function loadRecipes() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { recipes: [], notice: '' };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('invalid shape');
    return { recipes: parsed.filter(validRecipe).slice(0, 5), notice: parsed.every(validRecipe) ? '' : 'Some saved recipes were skipped because their data was incomplete.' };
  } catch (error) {
    return { recipes: [], notice: 'Saved recipes could not be read, so a fresh list is ready.' };
  }
}

export function persistRecipes(recipes) {
  try { localStorage.setItem(KEY, JSON.stringify(recipes)); return { ok: true }; }
  catch (error) { return { ok: false, message: 'This browser blocked saving. The recipe was not saved.' }; }
}
