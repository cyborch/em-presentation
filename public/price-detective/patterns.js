/* Reusable pattern detection for regularly sampled price series. No dataset dates or values. */
function detectPatterns(data, { radiusMinutes = 60, rampMinutes = 60 } = {}) {
  const at = i => Date.parse(data[i].time);
  const valid = i => Number.isFinite(data[i]?.price) && Number.isFinite(at(i));
  const step = data.length > 1 ? at(1) - at(0) : 0;
  const result = { minimum: [], maximum: [], rise: [], fall: [] };
  if (!(step > 0)) return result;
  const radius = Math.max(1, Math.round(radiusMinutes * 60000 / step));
  const ramp = Math.max(1, Math.round(rampMinutes * 60000 / step));
  const continuous = (a,b) => {
    for(let i=a;i<=b;i++) if(!valid(i)||(i>a && at(i)-at(i-1)!==step)) return false;
    return true;
  };
  // Equal-value plateaus count once, provided both surrounding windows exist.
  for(let i=0;i<data.length;){
    if(!valid(i)){i++;continue}
    let end=i;
    while(end+1<data.length && valid(end+1) && data[end+1].price===data[i].price && at(end+1)-at(end)===step) end++;
    const a=i-radius,b=end+radius;
    if(a>=0 && b<data.length && continuous(a,b)){
      const outside=[...data.slice(a,i),...data.slice(end+1,b+1)].map(d=>d.price);
      const value=data[i].price;
      for(const [type,match] of [['minimum',outside.every(v=>v>value)],['maximum',outside.every(v=>v<value)]]){
        if(match) result[type].push({type,index:i,plateauEnd:end,start:a,end:b,score:Math.min(...outside.map(v=>Math.abs(v-value)))});
      }
    }
    i=end+1;
  }
  for(let i=ramp;i<data.length;i++){
    if(!continuous(i-ramp,i)) continue;
    const delta=data[i].price-data[i-ramp].price;
    if(delta!==0) result[delta>0?'rise':'fall'].push({type:delta>0?'rise':'fall',index:i,start:i-ramp,end:i,delta,score:Math.abs(delta)});
  }
  // Extrema sort by price level; ramps by magnitude. Suppress overlapping ramps.
  result.minimum.sort((a,b)=>data[a.index].price-data[b.index].price||a.index-b.index);
  result.maximum.sort((a,b)=>data[b.index].price-data[a.index].price||a.index-b.index);
  for(const type of ['rise','fall']){
    const selected=[];
    for(const event of result[type].sort((a,b)=>b.score-a.score||a.index-b.index))
      if(selected.every(other=>event.end<=other.start||event.start>=other.end)) selected.push(event);
    result[type]=selected;
  }
  return result;
}
if(typeof module!=='undefined') module.exports={detectPatterns};
