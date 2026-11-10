'use strict';
const $=id=>document.getElementById(id);
const metrics={solar:{name:'Solar generation',short:'Solar',color:'#c68a23',icon:'☀',hint:'How does output change around this pattern?'},wind:{name:'Wind generation',short:'Wind',color:'#4d88b5',icon:'≈',hint:'What else is supplying the grid?'},demand:{name:'Electricity demand',short:'Demand',color:'#89729d',icon:'⌁',hint:'How much electricity is needed?'},residual:{name:'Residual load',short:'Residual load',color:'#c96348',icon:'Δ',hint:'Demand − wind − solar'}};
const patternTypes={
 minimum:{title:'Local minimum',question:'What changes around this low point? Compare the lead-in and recovery.',definition:'Lower than every other price in the 60 minutes before and after. Equal-price plateaus count once.',rank:'Lowest price first'},
 maximum:{title:'Local maximum',question:'What changes around this high point? Compare the build-up and decline.',definition:'Higher than every other price in the 60 minutes before and after. Equal-price plateaus count once.',rank:'Highest price first'},
 rise:{title:'One-hour rise',question:'What changed while the price rose? Compare the endpoints and reveal the fundamentals one at a time.',definition:'Positive price change between intervals one hour apart. Overlapping windows are suppressed.',rank:'Largest increase first'},
 fall:{title:'One-hour fall',question:'What changed while the price fell? Compare the endpoints.',definition:'Negative price change between intervals one hour apart. Overlapping windows are suppressed.',rank:'Largest decrease first'}
};
const patterns=detectPatterns(DATA);
const initialType=Object.keys(patternTypes).find(k=>patterns[k].length)||'minimum';
const initialEvent=patterns[initialType][0];
const initialIndex=initialEvent?.index||0;
let saved={};try{saved=JSON.parse(localStorage.getItem('priceDetective-patterns-v1')||'{}')}catch{}
let state={index:initialIndex,type:initialType,event:0,revealed:new Set(),a:initialEvent?.start||0,b:initialEvent?.end||0,hypothesis:typeof saved.hypothesis==='string'?saved.hypothesis:'',notes:typeof saved.notes==='string'?saved.notes:'',demo:-1};
const fmt=(n,d=2)=>Number.isFinite(n)?Number(n).toLocaleString('en-GB',{minimumFractionDigits:d,maximumFractionDigits:d}):'Unavailable';
const clock=d=>`${String(d.hour).padStart(2,'0')}:${String(d.minute).padStart(2,'0')}`;
const moment=d=>`${new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',timeZone:'Europe/Berlin'}).format(new Date(d.time))} · ${clock(d)}`;
const interval=d=>`${moment(d)}–${d.endTime.slice(11,16)} CEST`;
const extent=key=>{const values=DATA.map(d=>d[key]).filter(Number.isFinite);const step=key==='price'?100:10;return {min:Math.min(0,Math.floor(Math.min(...values)/step)*step),max:Math.max(step,Math.ceil(Math.max(...values)/step)*step)}};

function save(){try{localStorage.setItem('priceDetective-patterns-v1',JSON.stringify({hypothesis:state.hypothesis,notes:state.notes}))}catch{}}
function announce(s){$('status').textContent=s}
function svgChart(key,height=225){
 const mobile=matchMedia('(max-width:760px)').matches;
 const width=mobile?360:760,left=43,right=12,top=15,bottom=27,pw=width-left-right,ph=height-top-bottom;
 // Shared GW bounds preserve visual comparability across fundamental panels.
 const bounds=key==='price'?extent(key):{min:Math.min(0,...Object.keys(metrics).map(k=>extent(k).min)),max:Math.max(...Object.keys(metrics).map(k=>extent(k).max))};
 const {min,max}=bounds;
 const x=i=>left+i/DATA.length*pw,y=v=>top+(max-v)/(max-min)*ph;
 const ticks=key==='price'?Array.from({length:Math.floor((max-min)/200)+1},(_,i)=>min+i*200).concat([0,max]).filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>a-b):[min,(max+min)/2,max];
 const color=key==='price'?'#197c65':metrics[key].color;
 // Each price is valid over a 15-minute delivery interval: draw a step, not an interpolated curve.
 const line=key==='price'?DATA.map((d,i)=>`${i?'V':'M'+x(i).toFixed(2)+','}${y(d[key]).toFixed(2)} H${x(i+1).toFixed(2)}`).join(' '):DATA.map((d,i)=>`${i?'L':'M'}${x(i).toFixed(2)},${y(d[key]).toFixed(2)}`).join(' ');
 const selected=DATA[state.index],cx=x(state.index),cy=y(selected[key]);
 const dayStarts=DATA.map((d,i)=>i===0||d.time.slice(0,10)!==DATA[i-1].time.slice(0,10)?i:null).filter(i=>i!==null);
 const labels=[...dayStarts,DATA.length]; const event=selectedEvent();
 return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${key==='price'?'ENTSO-E Sequence 1 price in EUR per MWh':metrics[key].name+' in GW'}, 15-minute data. Selected ${interval(selected)}: ${fmt(selected[key],key==='price'?2:3)}"><defs><linearGradient id="fill-${key}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity=".15"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>${dayStarts.slice(1).map(i=>`<line x1="${x(i)}" x2="${x(i)}" y1="${top}" y2="${height-bottom}" stroke="#d9e2d8" stroke-dasharray="3 4"/>`).join('')}${ticks.map(t=>`<line x1="${left}" x2="${width-right}" y1="${y(t)}" y2="${y(t)}" stroke="${t===0?'#a7b9ad':'#edf0ea'}"/><text x="${left-9}" y="${y(t)+3}" text-anchor="end">${t}</text>`).join('')}<path d="${line} L${x(key==='price'?DATA.length:DATA.length-1)},${y(0)} L${x(0)},${y(0)} Z" fill="url(#fill-${key})"/><path d="${line}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>${event?`<rect x="${x(event.start)}" y="${top}" width="${x(event.end+1)-x(event.start)}" height="${ph}" fill="#829b56" opacity=".10"/><circle cx="${x(event.index)}" cy="${y(DATA[event.index][key])}" r="5" fill="white" stroke="${color}" stroke-width="2"/>`:''}<line x1="${cx}" x2="${cx}" y1="${top}" y2="${height-bottom}" stroke="#314d43" stroke-dasharray="4 3" opacity=".65"/><circle cx="${cx}" cy="${cy}" r="5" fill="${color}" stroke="white" stroke-width="2"/>${labels.map(i=>`<text x="${x(i)}" y="${height-7}" text-anchor="${i===0?'start':i===DATA.length?'end':'middle'}">${new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',timeZone:'Europe/Berlin'}).format(new Date(i===DATA.length?DATA.at(-1).endTime:DATA[i].time))}</text>`).join('')}</svg>`;
}
function selectedEvent(){return patterns[state.type][state.event]||null}
function renderCases(){
 $('cases').innerHTML=Object.entries(patternTypes).map(([key,p])=>`<button class="case" data-pattern="${key}" aria-pressed="${key===state.type}" ${patterns[key].length?'':'disabled'}><small>${patterns[key].length} DETECTED</small><strong>${p.title}</strong><span class="case-footer">${key==='minimum'?'Low points':key==='maximum'?'High points':'Changes over time'}</span><span class="arrow">↗</span></button>`).join('');
 const p=patternTypes[state.type],e=selectedEvent();
 $('caseTitle').textContent=p.title;$('casePrompt').textContent=p.question;
 $('patternDefinition').textContent=p.definition+' '+p.rank+'. Detection describes shape, not statistical significance or cause.';
 $('occurrence').innerHTML=patterns[state.type].map((e,i)=>`<option value="${i}">${moment(DATA[e.index])} · ${e.delta===undefined?'€'+fmt(DATA[e.index].price): (e.delta>0?'+':'')+fmt(e.delta)+' €/MWh over 1h'}</option>`).join('');
 $('occurrence').value=state.event;$('occurrence').disabled=!e;
 $('eventSummary').textContent=e?`${moment(DATA[e.start])} → ${moment(DATA[e.end])} · ${e.delta===undefined?'Selected price €'+fmt(DATA[e.index].price)+'/MWh': 'Change '+(e.delta>0?'+':'')+fmt(e.delta)+' €/MWh'}${e.plateauEnd>e.index?' · Plateau ends '+clock(DATA[e.plateauEnd]):''}`:'No matching patterns in this dataset. Explore the timeline freely.';
 $('focusEvent').disabled=!e;
}
function renderCharts(){const d=DATA[state.index];$('priceValue').textContent='€'+fmt(d.price);$('momentLabel').textContent=interval(d);$('hourLabel').textContent=interval(d);$('hour').value=state.index;$('priceChart').innerHTML=svgChart('price');$('fundamentals').innerHTML=state.revealed.size?[...state.revealed].sort((a,b)=>Object.keys(metrics).indexOf(a)-Object.keys(metrics).indexOf(b)).map(k=>`<div class="fundamental"><div class="metric-head"><strong><span class="dot" style="background:${metrics[k].color}"></span>${metrics[k].name}<small class="metric-source">${k==='residual'?'DERIVED FROM ACTUALS':'ENTSO-E · ACTUAL'}</small></strong><b>${fmt(d[k],3)} GW</b></div><div class="chart" data-metric="${k}">${svgChart(k,115)}</div></div>`).join(''):'<div class="locked-chart">Your first data is waiting.<br><br>Reveal solar, wind or demand in the data panel →</div>';}
function renderEvidence(){ $('evidence').innerHTML=Object.entries(metrics).map(([k,m])=>`<button class="evidence-btn" data-evidence="${k}" aria-pressed="${state.revealed.has(k)}"><span class="evidence-icon" style="color:${m.color}">${m.icon}</span><span><strong>${m.name}</strong><small>${m.hint}</small></span><span class="plus">${state.revealed.has(k)?'✓':'+'}</span></button>`).join('');$('evidencePrompt').textContent=state.revealed.has('residual')?'Residual load is demand left after wind and solar. Does it track price in both your selected intervals? What else could affect the price?':state.revealed.has('demand')?'Compare the balance, not just one source. How much demand remains after wind and solar?':state.revealed.has('wind')?'Compare wind and solar across your selected intervals.':state.revealed.has('solar')?'Does solar change before, during or after the price movement? Find another interval that could challenge your explanation.':'A useful hypothesis makes a prediction. Which evidence would you expect to see if your idea is right?';$('revealAll').textContent=state.revealed.size===4?'Hide all':'Reveal all'; }
function renderComparison(){const a=DATA[state.a],b=DATA[state.b];$('momentA').value=state.a;$('momentB').value=state.b;const keys=['price',...Object.keys(metrics).filter(k=>state.revealed.has(k))];$('compareTable').innerHTML=`<table><caption class="sr-only">Published ENTSO-E data and derived residual load comparing ${moment(a)} to ${moment(b)}</caption><thead><tr><th>MARKET EVIDENCE</th><th>A · ${moment(a)}</th><th>B · ${moment(b)}</th><th>CHANGE B − A</th></tr></thead><tbody>${keys.map(k=>{const unit=k==='price'?' €/MWh':' GW',precision=k==='price'?2:3,delta=Number((b[k]-a[k]).toFixed(precision));return `<tr><td>${k==='price'?'Electricity price':metrics[k].name}</td><td>${fmt(a[k],precision)}${unit}</td><td>${fmt(b[k],precision)}${unit}</td><td>${delta>0?'+':''}${fmt(delta,precision)}${unit}</td></tr>`}).join('')}</tbody></table>`;let msg=state.a===state.b?'You’re comparing the same interval. Choose a different B to look for a change.':a.price===b.price?'The prices match. Are the underlying conditions similar, or can different balances produce the same price?':state.revealed.has('residual')?`Residual load changes by ${fmt(b.residual-a.residual)} GW; price changes by ${fmt(b.price-a.price)} €/MWh. Does this support your hypothesis? A matching direction is a clue, not proof of causation.`:state.revealed.has('wind')&&state.revealed.has('solar')?`Solar changes by ${fmt(b.solar-a.solar)} GW, while wind changes by ${fmt(b.wind-a.wind)} GW. Which difference would your initial hypothesis have missed?`:'What would have to change to explain the price difference? Reveal evidence above, then revisit your hypothesis.';$('compareInsight').textContent=msg;}
function render(){renderCases();renderCharts();renderEvidence();renderComparison()}
function choosePattern(type,occurrence=0){state.type=type;state.event=occurrence;$('comparisonStatus').textContent='';const e=selectedEvent();if(e){state.index=e.index;state.a=e.start;state.b=e.end}render();announce('Selected '+patternTypes[type].title)}
$('cases').addEventListener('click',e=>{const b=e.target.closest('[data-pattern]');if(b){choosePattern(b.dataset.pattern);document.querySelector(`[data-pattern="${state.type}"]`).focus()}});
$('occurrence').onchange=e=>choosePattern(state.type,+e.target.value);
$('focusEvent').onclick=()=>{const e=selectedEvent();if(e){state.index=e.index;renderCharts();announce('Returned to selected pattern')}};
function comparePreset(mode){
 const e=selectedEvent(),i=state.index;
 const findOffset=minutes=>DATA.findIndex(d=>Date.parse(d.time)===Date.parse(DATA[i].time)+minutes*60000);
 let a=i,b=i;
 if(mode==='window'&&e){a=e.start;b=e.end}
 else if(mode==='before'){a=findOffset(-60);b=i}
 else if(mode==='after'){a=i;b=findOffset(60)}
 else if(mode==='previousDay'){a=findOffset(-1440);b=i}
 if(a<0||b<0){$('comparisonStatus').textContent='That comparison extends beyond the available data. Choose another interval or use the pattern window.';announce($('comparisonStatus').textContent);return}
 state.a=a;state.b=b;$('comparisonStatus').textContent='Comparison updated: '+moment(DATA[a])+' → '+moment(DATA[b])+'.';renderComparison();
}
$('comparisonPresets').onclick=e=>{const b=e.target.closest('[data-compare]');if(b)comparePreset(b.dataset.compare)};
$('evidence').addEventListener('click',e=>{const b=e.target.closest('[data-evidence]');if(!b)return;const k=b.dataset.evidence;state.revealed.has(k)?state.revealed.delete(k):state.revealed.add(k);renderCharts();renderEvidence();renderComparison();announce(metrics[k].name+(state.revealed.has(k)?' revealed':' hidden'))});
$('revealAll').onclick=()=>{state.revealed=state.revealed.size===4?new Set():new Set(Object.keys(metrics));render()};
$('hour').oninput=e=>{state.index=+e.target.value;renderCharts()};
let lastIndex=-1;document.querySelector('.canvas').addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;inspectPointer(e)});document.querySelector('.canvas').addEventListener('click',inspectPointer);
function inspectPointer(e){const el=e.target.closest('.chart');if(!el)return;const rect=el.getBoundingClientRect();const index=Math.max(0,Math.min(DATA.length-1,Math.floor(((e.clientX-rect.left)/rect.width*(matchMedia('(max-width:760px)').matches?360:760)-43)/((matchMedia('(max-width:760px)').matches?360:760)-55)*DATA.length)));if(index!==lastIndex||index!==state.index){lastIndex=index;state.index=index;renderCharts()}}
for(const id of ['momentA','momentB']){$(id).innerHTML=DATA.map(d=>`<option value="${d.index}">${moment(d)} CEST</option>`).join('');$(id).onchange=e=>{state[id==='momentA'?'a':'b']=+e.target.value;$('comparisonStatus').textContent='';renderComparison()}}
$('swap').onclick=()=>{[state.a,state.b]=[state.b,state.a];renderComparison()};$('pinA').onclick=()=>{state.a=state.index;renderComparison();announce('Pinned '+moment(DATA[state.index])+' as A')};$('pinB').onclick=()=>{state.b=state.index;renderComparison();announce('Pinned '+moment(DATA[state.index])+' as B')};
const scrollToComparison=()=>$('comparison').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});$('compareOpen').onclick=scrollToComparison;
$('hypothesis').value=state.hypothesis;$('notes').value=state.notes;$('hypothesis').onchange=e=>{state.hypothesis=e.target.value;save()};$('notes').oninput=e=>{state.notes=e.target.value;save()};
const leads={'Cross-border flows':'Compare net imports, exports and interconnector availability. Could neighbouring markets help explain the price?','Plant availability':'Inspect conventional generation and outage schedules. How much dispatchable capacity was available at the peak?','Storage & flexibility':'Inspect battery dispatch, pumped storage and demand response. Was flexibility available when residual load rose?','Fuel costs & bids':'Inspect fuel and carbon costs and market bids. Residual load alone cannot determine the marginal clearing price.'};
$('nextQuestions').onclick=e=>{if(e.target.tagName!=='BUTTON')return;document.querySelectorAll('#nextQuestions button').forEach(b=>b.setAttribute('aria-pressed',b===e.target));$('nextAnswer').textContent=leads[e.target.textContent]};
const demoSteps=[
 {title:'Choose a pattern',duration:'0:00–0:45',copy:'Pick a low point, a high point, or a one-hour change. Select an occurrence. The shaded window gives you local context; the cursor remains free to explore.',run:()=>render()},
 {title:'Form a hypothesis',duration:'0:45–1:30',copy:'What would you expect to see if your explanation were right? Record a hypothesis before revealing more evidence.',run:()=>render()},
 {title:'Reveal one signal',duration:'1:30–2:30',copy:'Inspect solar alongside price. Does it move before, during or after the selected pattern? Actuals describe realized conditions, not the forecasts used in the auction.',run:()=>{state.revealed.add('solar');render()}},
 {title:'Check the whole balance',duration:'2:30–3:30',copy:'Add wind, demand and residual load. Which changes reinforce each other? Which offset each other? Look for evidence against your initial idea.',run:()=>{state.revealed=new Set(Object.keys(metrics));render()}},
 {title:'Choose a fair comparison',duration:'3:30–4:30',copy:'Compare the pattern window, one hour before or after the inspected interval, or the same time on the previous day. Which comparison best tests your hypothesis?',run:()=>{comparePreset('window');render()}},
 {title:'Record what remains uncertain',duration:'4:30–5:00',copy:'Revise your hypothesis, select the next evidence to seek, and download your investigation. A pattern is a starting point, not a causal explanation.',run:()=>render()}
];
function demoRender(){const s=demoSteps[state.demo];$('demo').classList.remove('hidden');$('demoCount').textContent=`GUIDED INVESTIGATION · ${state.demo+1} OF 6 · ${s.duration}`;$('demoTitle').textContent=s.title;$('demoCopy').textContent=s.copy;$('demoBack').disabled=state.demo===0;$('demoNext').textContent=state.demo===5?'Finish walkthrough ✓':'Next step →';s.run()}
$('startDemo').onclick=()=>{state.demo=0;demoRender();$('demo').scrollIntoView({block:'start',behavior:'smooth'})};$('demoNext').onclick=()=>{if(state.demo===5){$('demo').classList.add('hidden');state.demo=-1;document.querySelector('.conclusion').scrollIntoView({block:'start',behavior:'smooth'});return}state.demo++;demoRender()};$('demoBack').onclick=()=>{if(state.demo>0){state.demo--;demoRender()}};$('demoClose').onclick=()=>{$('demo').classList.add('hidden');state.demo=-1};
$('reset').onclick=()=>{state={index:initialIndex,type:initialType,event:0,revealed:new Set(),a:initialEvent?.start||0,b:initialEvent?.end||0,hypothesis:'',notes:'',demo:-1};save();$('hypothesis').value='';$('notes').value='';$('demo').classList.add('hidden');$('comparisonStatus').textContent='';document.querySelectorAll('#nextQuestions button').forEach(b=>b.setAttribute('aria-pressed','false'));$('nextAnswer').textContent='Select a lead to see what additional evidence you would need.';render();announce('Investigation reset')};
$('export').onclick=()=>{const result={title:'Price Detective investigation',dataStatus:SOURCE.status,source:SOURCE,pattern:{type:state.type,definition:patternTypes[state.type].definition,occurrence:selectedEvent()},timezone:'Europe/Berlin, CEST UTC+2',hypothesis:state.hypothesis,notes:state.notes,revealedEvidence:[...state.revealed],comparison:{A:DATA[state.a],B:DATA[state.b]},nextEvidence:document.querySelector('#nextQuestions button[aria-pressed="true"]')?.textContent||null,limitation:SOURCE.analysisLimit};const blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='price-detective-investigation.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Investigation downloaded')};
$('hour').max=DATA.length-1;
render();

let resizeTimer; window.addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(renderCharts,100)});

$('priceSource').href=SOURCE.price; $('generationSource').href=SOURCE.generation; $('loadSource').href=SOURCE.load;
