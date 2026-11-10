# Verification

Checked November 6, 2026.

- JavaScript syntax checks passed for app.js and data.js.
- Data checks passed: 72 consecutive hourly timestamps with explicit UTC+2 offset; residual arithmetic; all values within the fixed plot scales; four narrative anchors.
- Browser checked at desktop width and 390px mobile width. No horizontal overflow at 390px; mobile SVG uses its own 360-unit viewBox for readable labels.
- Guided flow advanced through solar, wind, demand, residual and evening comparison.
- September 12/13 midday comparison: price 0/96 EUR/MWh; solar 34/33 GW; wind 22.4/7.5 GW; demand 52.8/52.8 GW; residual −3.6/12.3 GW.
- September 14 07:00/19:00 comparison: price 350/735 EUR/MWh; residual 43.4/53.1 GW.
- Arbitrary A/B selection, identical-hour feedback and swap checked.
- Keyboard slider advances the shared hour and chart readouts.
- All six hypothesis options are selectable; hypothesis and notes persist across reload. Reset clears them and returns to price-only comparison.
- Download action produced price-detective-investigation.json.
- No browser JavaScript errors were reported in the inspected console.

Scope: checks performed in the available desktop browser, with responsive viewport testing. No full cross-browser, assistive-technology or real-device certification. Chart hover and click are complemented by a keyboard/touch slider. Real market-data validation is intentionally out of scope. Font loading is optional.
