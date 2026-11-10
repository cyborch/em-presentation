# Price Detective — ENTSO-E data edition

Interactive investigation of Germany–Luxembourg (DE-LU) day-ahead electricity prices, September 12–14, 2026. Updated November 10, 2026 with published ENTSO-E prices, actual solar and wind generation, and actual total load. No synthetic market values remain.

## Run

Open `index.html` in a modern browser. No installation, build, API key or account is required. Keep the files and `sources` folder together.

Optional local server, from this folder:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765. Stop with Ctrl+C. Data is bundled, so the app works offline. Google Fonts is optional and falls back to system fonts.

## Reusable investigation components

The storytelling follows a workflow rather than a fixed sequence of German market events. The source dataset remains the same verified ENTSO-E snapshot.

- **Pattern browser:** local minima, local maxima, one-hour rises and one-hour falls are computed from the loaded series. Each category shows a count and offers a ranked occurrence selector.
- **Context window:** highlights the selected pattern in all charts. The cursor can inspect other intervals without changing the selected pattern; Return to pattern restores its focal interval.
- **Progressive evidence:** reveal solar, wind, demand and residual load in any order. Prompts ask for supporting and conflicting signals rather than telling the user the answer.
- **Comparison builder:** compare the selected pattern window, one hour before/after the inspected interval, the same time on the previous day, or any manually chosen pair. Missing comparison periods produce a clear message and leave the existing pair intact.
- **Hypothesis notebook:** record a tentative explanation, identify missing evidence, and export the investigation with its pattern type, definition, occurrence and source metadata.

### Pattern definitions

Local minima/maxima must be strictly below/above prices throughout the 60 minutes on either side. Equal-price plateaus count once, with context measured outside the plateau. Incomplete edge windows and gaps are excluded. Minima rank by lowest price, maxima by highest price. Flat series yield no extrema.

One-hour changes compare interval-start prices 60 minutes apart. Rises and falls rank by absolute change; overlapping windows are suppressed greedily in magnitude order. They do not require every intervening interval to move monotonically. These are descriptive patterns, not statistical anomalies or proof of causation.

`patterns.js` contains the date-independent detector. It accepts a regularly sampled sequence of `{time, price}` records. The UI retains this electricity dataset’s units, source details and timezone; this update does not add a dataset uploader or claim to be a general-purpose data platform.

## Five-minute walkthrough

The guide applies to the currently selected pattern and can be started from any occurrence. It adds evidence without clearing existing notes or forcing a predefined event sequence. Back revisits the guidance; it does not undo evidence the user has revealed.

| Time | Step | User question |
| --- | --- | --- |
| 0:00–0:45 | Choose a pattern and occurrence | What makes this interval worth exploring? |
| 0:45–1:30 | Form a hypothesis | What would I expect to see if my explanation were right? |
| 1:30–2:30 | Reveal one signal | Does it change before, during or after the pattern? |
| 2:30–3:30 | Add the whole balance | Which changes reinforce or offset each other? |
| 3:30–4:30 | Choose a comparison | Which baseline best tests my hypothesis? |
| 4:30–5:00 | Reflect and export | What remains unexplained, and what evidence do I need next? |

Notes use a separate browser-storage key for this edition. Previous edition notes remain stored under their earlier key. Reset clears this edition’s notes only.

## Sources and interpretation

See `sources/provenance.json` for exact source URLs and series definitions. Original public table cells are preserved in three `entsoe-*-tables.json` files. Captured from the ENTSO-E Transparency Platform on November 10, 2026 using the DE-LU bidding-zone selection (EIC `10Y1001A1001A82H`). The ENTSO-E site may revise its published values later; this is a static snapshot, not a live feed.

All data uses the same 15-minute delivery intervals. The source timezone setting is CET/CEST; these September dates are CEST, UTC+2. Both start and end timestamps include an explicit offset. No averaging, interpolation, resampling or gap filling was needed. Source MW is divided by 1,000 for GW. Computed values retain five decimal places in the dataset; the interface shows fundamentals to three and prices to two. Deltas are calculated before display rounding, so displayed operands may differ from the displayed delta by 0.001 GW.

“Actual” follows the source’s series name, not a guarantee that every number is a direct measurement. ENTSO-E notes that generation values can combine measured, planning and extrapolation data and be revised with settlement data.

**Crucial limitation:** day-ahead prices were determined before these realized conditions. Actual generation and load are useful retrospective evidence, but they are not the forecasts and bids available at auction time. The prototype does not establish causal attribution or explain the full price spike. Residual load is not a measure of total supply shortage.

## Rebuild and verify

Python 3 and Node.js are needed only for rebuilding/checking, not for running the prototype:

```sh
python3 scripts/build-data.py
node scripts/verify-data.cjs
node scripts/verify-patterns.cjs
node --check app.js
```

The build script validates dates, table column mappings, complete 15-minute coverage, numeric values and interval alignment before writing `data.js` and `sources/market-data.csv`.

Files: `index.html`, `styles.css`, `app.js`, `patterns.js`, `data.js`, `sources/`, `scripts/`, `README.md`, `VERIFY.md`.
