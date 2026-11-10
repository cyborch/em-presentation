# Price Detective

A runnable, independent UX concept for the Electricity Maps case brief. Germany, September 12–14, 2026. All hourly values are illustrative, not historical measurements.

## Run

Open `index.html` in a modern browser. No installation, build step, API key or account is needed. Keep the four application files in the same folder.

For a local server (recommended for consistent browser storage):

```sh
cd price-detective
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open http://127.0.0.1:8765. Stop the server with Ctrl+C. The UI works offline; the optional Google Fonts stylesheet falls back to system fonts when unavailable.

## Explore

- Select one of the four case cards to jump to an event.
- Hover or click a chart, or use the hour slider. All revealed charts share the same selected hour. Keyboard users can focus the slider and use arrow keys.
- Reveal solar, wind, demand and residual load individually, in any order. Reveal all / Hide all is a shortcut.
- Choose a hypothesis and add notes. Only the hypothesis and notes are saved locally, when browser storage is available. No information is sent to a server.
- Compare any two of the 72 hours using the A/B selectors, pin the currently inspected hour, or swap A and B. Hidden evidence remains hidden in the comparison.
- Select a next evidence lead and download the investigation as JSON.
- Reset clears notes and returns to the starting state. Export first if you want to preserve notes.

## Five-minute demo

Use **Five-minute walkthrough** to follow six manually advanced steps. The time labels are pacing guidance, not an automatic timer. Back revisits a step; closing the guide leaves the current exploration intact. Scroll down to compare when prompted.

| Time | Action | Presenter prompt |
| --- | --- | --- |
| 0:00–0:45 | Inspect September 12 midday. Choose a hypothesis. | “The price is zero. What would you look at first?” |
| 0:45–1:30 | Reveal solar. Scrub the chart. | “The shapes line up. Is that enough to explain the price?” |
| 1:30–2:30 | Reveal wind. Compare September 12 and 13 at midday. | “Solar is almost the same. What changed?” |
| 2:30–3:30 | Reveal demand and residual load. Inspect September 14 at 07:00. | “How much demand remains after wind and solar?” |
| 3:30–4:30 | Compare 07:00 and 19:00 on September 14. | “Residual load rises, but does that explain the size of the price jump?” |
| 4:30–5:00 | Revise the hypothesis; choose another evidence lead. Export. | “What would we need to test this explanation with real data?” |

The central learning move is the counterexample: similar midday solar, different wind and price. The user can revise an explanation rather than simply read an answer.

## Data and limitations

The provided brief supplies four narrative anchors: zero price on September 12 at midday; a smaller midday dip on September 13; a morning peak around €350/MWh and an evening peak above €700/MWh on September 14. Exact hour choices, all 72 prices, and every fundamental value are synthetic. This prototype does not verify those historical claims or attempt to estimate the real market.

`data.js` separates the illustrative data from the interface. Each record contains `index`, `day`, `hour`, an ISO `time` with explicit `+02:00` offset, `price` in EUR/MWh, `solar`, `wind`, `demand`, `residual` in GW, and `illustrative: true`. Residual is demand minus wind minus solar. Negative residual is allowed; it is not a claim that total supply exceeded total demand. Conventional generation, imports, exports, storage, outages, market bids and fuel costs are not modeled.

To replace the synthetic data, supply 72 ordered hourly records with the same schema, reconcile source intervals and CEST time, recalculate residual, and attach source/provenance metadata. Review all narrative labels and chart bounds before using real values: the current price scale is fixed at 0–800 EUR/MWh and fundamentals at −15–75 GW. Real negative prices or values outside these bounds require scale changes. The prototype is deliberately not a general production data viewer.

## Files

- `index.html` — semantic page and controls
- `styles.css` — responsive visual system
- `data.js` — synthetic hourly series
- `app.js` — linked SVG charts, evidence, comparison, notes, export and guide
- `VERIFY.md` — checks and known scope

No backend, tracking, external data APIs or application dependencies. Google Fonts is the sole optional external resource. Remove the first CSS line for a fully network-free version.
