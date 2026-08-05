import test from 'node:test';
import assert from 'node:assert/strict';
import { getStats, getTodayIso, isEntry, isValidDateString, sortedEntries } from '../src/model.js';

const entry = (id, dateTried, rating) => ({ id, coffeeName: `Coffee ${id}`, roaster: 'Roaster', brewMethod: 'Pour-over', rating, notes: '', dateTried, createdAt: Number(id) });

test('validates real calendar dates, not just date-shaped strings', () => {
  assert.equal(isValidDateString('2026-02-28'), true);
  assert.equal(isValidDateString('2026-02-29'), false);
  assert.equal(isValidDateString('2026-13-01'), false);
  assert.equal(isEntry(entry('1', '2026-02-29', 4)), false);
});

test('uses local calendar date for the default date field', () => {
  assert.equal(getTodayIso(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
});

test('sorts recent entries and calculates diary stats', () => {
  const entries = [entry('1', '2026-01-01', 5), entry('2', '2026-01-03', 3), entry('3', '2026-01-03', 4)];
  assert.deepEqual(sortedEntries(entries).map((item) => item.id), ['3', '2', '1']);
  assert.deepEqual(getStats(entries), { total: 3, average: 4, best: entries[0] });
});
