# Caffeine Diary

A private, single-page coffee tasting log built for the brief in `brief.txt`.

## Run locally

Because the app uses native ES modules, serve this folder with any static server:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`. Entries stay in the browser's `localStorage`; there is no account or backend.

## Quality checks

Run the regression suite with:

```bash
npm test
```

It covers entry validation, sorting and statistics, plus normal, corrupt, blocked, and quota-limited browser-storage behavior.
