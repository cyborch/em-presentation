# Verification — ENTSO-E edition

Checked November 10, 2026.

## Data

- Captured the public ENTSO-E tables for each of September 12, 13 and 14, 2026 in the DE-LU bidding zone, with the CET/CEST display setting.
- 96 quarter-hour rows per day in each of the price, generation and load datasets.
- All 288 records reconcile to Sequence 1 price, solar, offshore + onshore wind, and Actual Total Load cells in the preserved source tables.
- Continuous ISO timestamps with UTC+2 offset, no duplicate or missing intervals, and correct midnight boundaries.
- MW-to-GW conversion and derived residual arithmetic verified independently against the source cells.
- Negative minimum −€0.48/MWh retained. September 14 morning maximum €348.30 at 08:00; three-day maximum €740.01 at 19:45.
- `node scripts/verify-data.cjs` passes; JavaScript syntax check passes.

## Pattern detection and interface

- Detector tests pass for strict extrema, plateaus, flat series, monotonic data, incomplete boundaries, missing prices and time gaps.
- Existing dataset yields 10 local minima, 7 local maxima, 34 non-overlapping one-hour rises and 39 non-overlapping one-hour falls.
- The lowest local minimum is September 12 at 14:00 (−€0.48/MWh); highest local maximum September 14 at 19:45 (€740.01/MWh).
- Browser checked: switching pattern types, selecting a second occurrence, synchronized evidence, automatic comparison windows, previous-day preset and generic guide retaining the selected pattern.
- The largest rise compares September 14 18:15 to 19:15: €306.36 to €700.07/MWh, a €393.71 increase.
- Mobile 390px: occurrence picker usable with no horizontal page overflow; unavailable previous-day comparison reports the boundary without changing A/B.
- No browser JavaScript errors reported in the inspected session.

Scope: the underlying ENTSO-E data is unchanged. Detection is descriptive, not an anomaly-significance model. Date-independent pattern logic is reusable for regularly sampled series; the surrounding app still uses this dataset’s source information, electricity units and timezone.
