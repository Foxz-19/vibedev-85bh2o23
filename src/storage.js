import { isValidDough } from './calculator.js';

const KEY = 'crumb-recipes-v1';

/** @typedef {{id:string,name:string,flour:number,hydration:number,createdAt:number}} Recipe */

function validRecipe(value) { return value && typeof value.id === 'string' && value.id.trim() && typeof value.name === 'string' && value.name.trim() && value.name.length <= 32 && Number.isFinite(value.createdAt) && isValidDough(value); }

export function loadRecipes() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { recipes: [], notice: '' };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('invalid shape');
    const seen=new Set(),valid=parsed.filter((r)=>validRecipe(r)&&!seen.has(r.id)&&seen.add(r.id)),recipes=valid.slice(0,5);
    return { recipes, notice: valid.length < parsed.length ? 'Some recipes were invalid.' : valid.length > 5 ? 'Only 5 recipes can be loaded.' : '' };
  } catch (error) {
    return { recipes: [], notice: 'Saved recipes could not be read, so a fresh list is ready.' };
  }
}

export function persistRecipes(recipes) {
  try { localStorage.setItem(KEY, JSON.stringify(recipes)); return { ok: true }; }
  catch (error) { return { ok: false, message: 'Saving is blocked; recipe was not saved.' }; }
}
