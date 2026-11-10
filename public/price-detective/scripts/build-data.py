"""Rebuild deterministic browser data from the captured public ENTSO-E tables."""
from pathlib import Path
from datetime import datetime, timedelta
import csv, json, math
BASE = Path(__file__).resolve().parents[1]
def read(name): return json.loads((BASE/'sources'/name).read_text())
prices=read('entsoe-price-tables.json'); generation=read('entsoe-generation-tables.json'); loads=read('entsoe-load-tables.json')
def numeric(value):
    try: result=float(value.replace(',',''))
    except ValueError: return None
    return result if math.isfinite(result) else None
records=[]
for day in (12,13,14):
    p=[r for r in prices[str(day)] if r and r[0].startswith(f'{day}/09/2026 ')]
    g=[r for r in generation[str(day)] if r and len(r[0])==13 and r[0][5:8]==' - ']
    l=[r for r in loads[str(day)] if r and len(r[0])==13 and r[0][5:8]==' - ']
    assert len(p)==len(g)==len(l)==96,(day,len(p),len(g),len(l))
    # Table heading contains a spanning area cell that is absent in data rows.
    gh=[h for h in generation[str(day)][0] if h!='BZN|DE-LU']
    lh=[h for h in loads[str(day)][0] if h!='BZN|DE-LU']
    for i,(pr,gr,lr) in enumerate(zip(p,g,l)):
        start=datetime(2026,9,day)+timedelta(minutes=15*i)
        end=start+timedelta(minutes=15)
        interval=f'{start:%H:%M} - {end:%H:%M}'
        assert gr[0]==lr[0]==interval
        assert pr[0]==f'{start:%d/%m/%Y %H:%M} - {end:%d/%m/%Y %H:%M}'
        gvals=dict(zip(gh,gr)); lvals=dict(zip(lh,lr))
        solar=numeric(gvals['Solar(MW)']); offshore=numeric(gvals['Wind Offshore(MW)']); onshore=numeric(gvals['Wind Onshore(MW)']); demand=numeric(lvals['Actual Total Load(MW)'])
        wind=None if offshore is None or onshore is None else offshore+onshore
        residual=None if any(v is None for v in (demand,solar,wind)) else demand-solar-wind
        records.append(dict(index=len(records),day=day,hour=start.hour,minute=start.minute,time=f'{start:%Y-%m-%dT%H:%M}:00+02:00',endTime=f'{end:%Y-%m-%dT%H:%M}:00+02:00',price=numeric(pr[1]),solar=None if solar is None else round(solar/1000,5),wind=None if wind is None else round(wind/1000,5),demand=None if demand is None else round(demand/1000,5),residual=None if residual is None else round(residual/1000,5),illustrative=False))
assert len(records)==288
for i,r in enumerate(records):
    assert all(r[k] is not None for k in ('price','solar','wind','demand','residual')),r
    if i: assert datetime.fromisoformat(r['time'])-datetime.fromisoformat(records[i-1]['time'])==timedelta(minutes=15)
source=read('source-pages.json')
priceState={'sa':['BZN|10Y1001A1001A82H'],'st':'BZN','mm':True,'ma':False,'sp':'HALF','dt':'TABLE','df':'2026-09-12','tz':'CET','ii':0,'ps':100}
from urllib.parse import quote
source['price']='https://transparency.entsoe.eu/market/energyPrices?appState='+quote(json.dumps(priceState,separators=(',',':')))
source.update(priceSeries='Sequence 1 — SDAC day-ahead',resolutionMinutes=15,timezone='Europe/Berlin (CEST, UTC+2 for these dates)',units={'price':'EUR/MWh','fundamentals':'GW (source MW / 1000)'},wind='Wind Offshore + Wind Onshore',residual='Actual Total Load − Solar − Wind Offshore − Wind Onshore',status='Published ENTSO-E data; derived wind and residual load; no synthetic values',analysisLimit='Actual generation and load are retrospective outcomes, not the forecasts available at the day-ahead auction. They do not establish price causation.')
(BASE/'sources'/'provenance.json').write_text(json.dumps(source,indent=2))
(BASE/'data.js').write_text('// Published ENTSO-E data. Rebuild with python3 scripts/build-data.py.\nconst SOURCE = '+json.dumps(source,ensure_ascii=False,indent=2)+';\nconst DATA = '+json.dumps(records,ensure_ascii=False,separators=(',',':'))+';\nif(typeof module !== "undefined") module.exports={DATA,SOURCE};\n')
with (BASE/'sources'/'market-data.csv').open('w') as f:
    writer=csv.DictWriter(f,fieldnames=records[0].keys());writer.writeheader();writer.writerows(records)
for idx in (49,145,224,271):print(records[idx])
print('Validated 288 complete 15-minute records; no interpolation or missing values.')
