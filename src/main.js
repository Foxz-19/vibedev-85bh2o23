import { getStats, getTodayIso, sortedEntries } from './model.js';
import { loadEntries, saveEntries } from './storage.js';
import { entryMarkup } from './view.js';

const $ = (selector) => document.querySelector(selector);
const form = $('#coffeeForm');
const fields = { id: $('#entryId'), name: $('#coffeeName'), roaster: $('#roaster'), method: $('#brewMethod'), date: $('#dateTried'), notes: $('#notes') };
let entries = [];
let selectedRating = 0;
let oldestFirst = false;
let toastTimer;

const today = getTodayIso();
fields.date.value = today;
$('#todayLabel').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date());

const loaded = loadEntries();
entries = loaded.entries;
if (loaded.error) showToast(loaded.error, true);
render();

$('#ratingStars').addEventListener('click', (event) => {
  const button = event.target.closest('[data-rating]');
  if (!button) return;
  selectedRating = Number(button.dataset.rating);
  updateStars();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = fields.name.value.trim();
  const roaster = fields.roaster.value.trim();
  const date = fields.date.value;
  if (!name || !roaster || !date || !selectedRating) { $('#formError').textContent = 'Add a coffee name, roaster, date, and rating before saving.'; return; }
  $('#formError').textContent = '';
  const existingId = fields.id.value;
  const entry = { id: existingId || makeId(), coffeeName: name, roaster, brewMethod: fields.method.value, rating: selectedRating, notes: fields.notes.value.trim(), dateTried: date, createdAt: existingId ? (entries.find((item) => item.id === existingId)?.createdAt ?? Date.now()) : Date.now() };
  const nextEntries = existingId ? entries.map((item) => item.id === existingId ? entry : item) : [...entries, entry];
  const error = saveEntries(nextEntries);
  if (error) { showToast(error, true); return; }
  entries = nextEntries;
  resetForm();
  render();
  showToast(existingId ? 'Cup updated.' : 'Cup added to your diary.');
});

$('#cancelEdit').addEventListener('click', resetForm);
$('#sortButton').addEventListener('click', () => { oldestFirst = !oldestFirst; $('#sortButton').innerHTML = `${oldestFirst ? 'Oldest first' : 'Newest first'} <span aria-hidden="true">↕</span>`; renderList(); });

$('#entriesList').addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const id = button.closest('[data-entry-id]').dataset.entryId;
  const entry = entries.find((item) => item.id === id);
  if (!entry) return;
  if (button.dataset.action === 'edit') populateForm(entry);
  if (button.dataset.action === 'delete') deleteEntry(entry);
});

function render() { renderStats(); renderList(); }
function renderStats() {
  const stats = getStats(entries);
  $('#totalStat').textContent = String(stats.total);
  $('#averageStat').textContent = stats.average === null ? '—' : `${stats.average.toFixed(1)} / 5`;
  $('#bestStat').textContent = stats.best ? stats.best.coffeeName : 'Nothing rated yet';
  $('#bestRating').textContent = stats.best ? `${'★'.repeat(stats.best.rating)} · ${stats.best.rating}/5` : '';
  $('#entryCount').textContent = stats.total ? `(${stats.total})` : '';
}
function renderList() {
  const list = oldestFirst ? [...sortedEntries(entries)].reverse() : sortedEntries(entries);
  $('#entriesList').innerHTML = list.length ? list.map(entryMarkup).join('') : '<div class="empty-state"><span class="empty-cup" aria-hidden="true">☕</span><h3>Your diary is waiting.</h3><p>Log your first cup to start a trail of good mornings.</p></div>';
}
function updateStars() { document.querySelectorAll('.star').forEach((star) => { const active = Number(star.dataset.rating) <= selectedRating; star.classList.toggle('is-active', active); star.setAttribute('aria-checked', String(Number(star.dataset.rating) === selectedRating)); }); }
function populateForm(entry) { fields.id.value = entry.id; fields.name.value = entry.coffeeName; fields.roaster.value = entry.roaster; fields.method.value = entry.brewMethod; fields.date.value = entry.dateTried; fields.notes.value = entry.notes; selectedRating = entry.rating; updateStars(); $('#formTitle').textContent = 'Edit this cup'; $('#submitButton').innerHTML = 'Update this cup <span aria-hidden="true">↗</span>'; $('#cancelEdit').hidden = false; fields.name.focus(); }
function resetForm() { form.reset(); fields.id.value = ''; fields.date.value = today; selectedRating = 0; updateStars(); $('#formTitle').textContent = 'Log a coffee'; $('#submitButton').innerHTML = 'Save this cup <span aria-hidden="true">↗</span>'; $('#cancelEdit').hidden = true; $('#formError').textContent = ''; }
function deleteEntry(entry) { if (!window.confirm(`Remove “${entry.coffeeName}” from your diary?`)) return; const nextEntries = entries.filter((item) => item.id !== entry.id); const error = saveEntries(nextEntries); if (error) { showToast(error, true); return; } entries = nextEntries; render(); showToast('Cup removed.'); }
function makeId() { return globalThis.crypto?.randomUUID?.() ?? `cup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function showToast(message, isError = false) { const toast = $('#toast'); toast.textContent = message; toast.classList.toggle('is-error', isError); toast.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4200); }
