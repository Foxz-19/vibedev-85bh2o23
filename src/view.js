/** @param {import('./model.js').CoffeeEntry} entry */
export function entryMarkup(entry) {
  const stars = '★'.repeat(entry.rating) + '<span class="star-muted">' + '★'.repeat(5 - entry.rating) + '</span>';
  const notes = entry.notes ? `<p class="entry-notes">“${escapeHtml(entry.notes)}”</p>` : '';
  return `<article class="entry" data-entry-id="${escapeHtml(entry.id)}"><div class="entry-main"><div class="entry-meta"><time datetime="${escapeHtml(entry.dateTried)}">${formatDate(entry.dateTried)}</time><span class="dot">·</span><span>${escapeHtml(entry.brewMethod)}</span></div><h3>${escapeHtml(entry.coffeeName)}</h3><p class="entry-roaster">${escapeHtml(entry.roaster)}</p>${notes}</div><div class="entry-side"><div class="entry-stars" aria-label="${entry.rating} out of 5 stars">${stars}</div><div class="entry-actions"><button class="icon-button edit-button" type="button" data-action="edit" aria-label="Edit ${escapeHtml(entry.coffeeName)}">✎</button><button class="icon-button delete-button" type="button" data-action="delete" aria-label="Delete ${escapeHtml(entry.coffeeName)}">×</button></div></div></article>`;
}

/** @param {string} value */
function escapeHtml(value) { const node = document.createElement('div'); node.textContent = value; return node.innerHTML; }

/** @param {string} date */
function formatDate(date) { return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T12:00:00`)); }
