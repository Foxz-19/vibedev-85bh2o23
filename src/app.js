import { describe, formatGrams, meterPercent, readValues, waterFor } from './calculator.js';
import { loadRecipes, persistRecipes } from './storage.js';

const $ = (selector) => document.querySelector(selector);
const flour = $('#flour');
const hydration = $('#hydration');
const waterResult = $('#water-result');
const descriptor = $('#descriptor');
const meterFill = $('#meter-fill');
const formMessage = $('#form-message');
const recipeMessage = $('#recipe-message');
const recipeForm = $('#recipe-form');
const recipeName = $('#recipe-name');
const recipeList = $('#recipe-list');
const recipeCount = $('#recipe-count');
const saveButton = $('#save-recipe');
const cancelEdit = $('#cancel-edit');

/** @type {import('./storage.js').Recipe[]} */
let recipes = [];
let editingId = null;

function setMessage(element, message = '') { element.textContent = message; }

function resetEditor() {
  editingId = null; recipeName.value = ''; recipeName.removeAttribute('aria-invalid'); cancelEdit.hidden = true; saveButton.querySelector('span').textContent = 'Save recipe';
}

function calculate(focusError = false) {
  const result = readValues(flour.value, hydration.value);
  if (!result.ok) {
    flour.setAttribute('aria-invalid', String(result.field === 'flour')); hydration.setAttribute('aria-invalid', String(result.field === 'hydration'));
    waterResult.textContent = '—'; descriptor.textContent = 'Check your inputs'; meterFill.style.width = '4%'; setMessage(formMessage, result.message); if (focusError) (result.field === 'flour' ? flour : hydration).focus(); return null;
  }
  const { values } = result;
  flour.removeAttribute('aria-invalid'); hydration.removeAttribute('aria-invalid');
  waterResult.textContent = formatGrams(waterFor(values));
  descriptor.textContent = describe(values.hydration);
  meterFill.style.width = `${meterPercent(values.hydration)}%`;
  setMessage(formMessage);
  document.querySelectorAll('.preset').forEach((button) => button.setAttribute('aria-pressed', button.dataset.hydration === String(values.hydration)));
  return values;
}

function renderRecipes() {
  recipeCount.textContent = `${recipes.length} / 5`;
  if (!recipes.length) {
    recipeList.innerHTML = '<div class="empty"><strong>No recipes yet.</strong>Save a favorite ratio and it will appear here.</div>';
    return;
  }
  recipeList.innerHTML = recipes.map((recipe) => `<article class="recipe-item"><div><div class="recipe-name" title="${escapeHtml(recipe.name)}">${escapeHtml(recipe.name)}</div><span class="recipe-meta">${recipe.flour} g flour · ${recipe.hydration}% · ${formatGrams(waterFor(recipe))} water</span></div><div class="recipe-actions"><button class="text-button load" type="button" data-action="load" data-id="${escapeHtml(recipe.id)}">Load</button><button class="text-button" type="button" data-action="edit" data-id="${escapeHtml(recipe.id)}">Edit</button><button class="text-button" type="button" data-action="delete" data-id="${escapeHtml(recipe.id)}" aria-label="Delete ${escapeHtml(recipe.name)}">×</button></div></article>`).join('');
}

function escapeHtml(value) { return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }

function persist(nextRecipes) {
  const result = persistRecipes(nextRecipes);
  if (!result.ok) { setMessage(recipeMessage, result.message); return false; }
  recipes = nextRecipes; renderRecipes(); setMessage(recipeMessage); return true;
}

function saveRecipe(event) {
  event.preventDefault();
  const values = calculate(true);
  const name = recipeName.value.trim();
  if (!values) return;
  if (!name) { recipeName.setAttribute('aria-invalid', 'true'); setMessage(recipeMessage, 'Give this recipe a name first.'); recipeName.focus(); return; }
  recipeName.removeAttribute('aria-invalid');
  if (editingId) {
    const next = recipes.map((recipe) => recipe.id === editingId ? { ...recipe, name, ...values } : recipe);
    if (persist(next)) { resetEditor(); setMessage(recipeMessage, 'Recipe updated.'); }
    return;
  }
  if (recipes.length >= 5) { setMessage(recipeMessage, 'You have 5 saved recipes. Delete one to make room.'); return; }
  const next = [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, ...values, createdAt: Date.now() }, ...recipes];
  if (persist(next)) { recipeName.value = ''; setMessage(recipeMessage, 'Recipe saved.'); }
}

function recipeAction(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const recipe = recipes.find((item) => item.id === button.dataset.id);
  if (!recipe) return;
  if (button.dataset.action === 'load') {
    resetEditor(); flour.value = recipe.flour; hydration.value = recipe.hydration; calculate(); window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); setMessage(recipeMessage, `${recipe.name} loaded.`); return;
  }
  if (button.dataset.action === 'edit') {
    flour.value = recipe.flour; hydration.value = recipe.hydration; recipeName.value = recipe.name; editingId = recipe.id; cancelEdit.hidden = false; saveButton.querySelector('span').textContent = 'Update recipe'; calculate(); recipeName.focus(); setMessage(recipeMessage, `Editing ${recipe.name}.`); return;
  }
  if (button.dataset.action === 'delete') {
    if (!window.confirm(`Delete ${recipe.name}?`)) return;
    if (persist(recipes.filter((item) => item.id !== recipe.id))) { if (editingId === recipe.id) resetEditor(); setMessage(recipeMessage, 'Recipe deleted.'); }
  }
}

flour.addEventListener('input', calculate); hydration.addEventListener('input', calculate);
document.querySelectorAll('.preset').forEach((button) => button.addEventListener('click', () => { hydration.value = button.dataset.hydration; calculate(); }));
recipeName.addEventListener('input', () => recipeName.removeAttribute('aria-invalid'));
cancelEdit.addEventListener('click', () => { resetEditor(); recipeName.focus(); setMessage(recipeMessage, 'Edit cancelled.'); });
recipeForm.addEventListener('submit', saveRecipe); recipeList.addEventListener('click', recipeAction);
addEventListener('beforeunload', (event) => { if (editingId) { event.preventDefault(); event.returnValue = ''; } });

const loaded = loadRecipes(); recipes = loaded.recipes; renderRecipes(); calculate(); if (loaded.notice) setMessage(recipeMessage, loaded.notice);
