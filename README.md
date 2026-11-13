# SupeRR Selector – Pressure Performers

Interactive Rajasthan Royals SupeRR Selector Season 2 analytics war-room identifying the most reliable T20 batters and bowlers under match-leverage pressure.

## Setup & Local Development

```bash
npm install
npm run dev
```

Build a production static bundle (output in `dist/`, ready for Vercel or any static host):

```bash
npm run build
```

## Replacing Demo Data With Real Competition Outputs

All dashboard metrics, rankings, narratives, and methodology figures load from static JSON files in `/public/data/` via `src/data/api.ts`:

- `public/data/meta.json`
- `public/data/batters.json` (10 batters)
- `public/data/bowlers.json` (10 bowlers)
- `public/data/rr_squad.json`
- `public/data/rr_phase.json`
- `public/data/methodology.json`
- `public/data/benchmarks.json`

To switch from demo data to final competition outputs:

1. Replace the JSON files in `public/data/` using the exact same field schema.
2. Update `"status"` in each JSON file from `"DEMO"` to `"FINAL"` (or `"preliminary"` on `benchmarks.json` if benchmarks are preliminary). The top `"DEMO DATA"` ribbon automatically disappears when no loaded JSON file carries a `"DEMO"` status.

## Adding Player Photos & Brand Assets

- **Player portraits (20 players):** Place `.jpg` files at `public/players/{slug}.jpg` matching each player's `slug` in `batters.json` and `bowlers.json` (plus optional `rr_squad.json` slugs). If an image is missing, the UI automatically renders an RR-styled initials avatar.
- **Rajasthan Royals logo:** Place the crest image at `public/assets/rr-logo.png`. If omitted, the landing page renders the bundled RR emblem or an inline vector crest fallback.

## Keyboard Shortcuts

- `/` or `Cmd/Ctrl + K` — Open quick player search palette
- `G` — Open / close the model metrics glossary drawer
- `Esc` — Close open overlays

## Data-Use Notice

Contains aggregated outputs only. Raw competition data must not be committed.
