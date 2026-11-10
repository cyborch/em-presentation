const assert=require('node:assert/strict');
const {detectPatterns}=require('../patterns.js');
const make=prices=>prices.map((price,i)=>({price,time:new Date(Date.UTC(2026,0,1,0,i*15)).toISOString()}));
let p=detectPatterns(make([9,8,7,6,0,6,7,8,9]));
assert.equal(p.minimum.length,1);assert.equal(p.minimum[0].index,4);assert.equal(p.maximum.length,0);
p=detectPatterns(make([9,8,7,6,0,0,6,7,8,9]));assert.equal(p.minimum.length,1);assert.equal(p.minimum[0].plateauEnd,5);
p=detectPatterns(make(Array(20).fill(7)));for(const values of Object.values(p))assert.equal(values.length,0);
p=detectPatterns(make(Array.from({length:20},(_,i)=>i)));assert.equal(p.minimum.length,0);assert.equal(p.maximum.length,0);assert(p.rise.every(e=>e.delta===4));assert.equal(p.fall.length,0);
const gap=make([9,8,7,6,0,6,7,8,9]);gap[4].price=null;assert.equal(detectPatterns(gap).minimum.length,0);
const missing=make([9,8,7,6,0,6,7,8,9]);missing.splice(4,1);assert.equal(detectPatterns(missing).minimum.length,0);
const {DATA}=require('../data.js');p=detectPatterns(DATA);
assert.equal(p.minimum[0].index,56);assert.equal(p.maximum[0].index,271);
for(const type of ['minimum','maximum'])for(const e of p[type]){
 const other=DATA.slice(e.start,e.end+1).filter((_,i)=>i+e.start<e.index||i+e.start>e.plateauEnd);
 assert(other.every(d=>type==='minimum'?d.price>DATA[e.index].price:d.price<DATA[e.index].price));
}
for(const type of ['rise','fall'])for(const e of p[type]){
 assert.equal(Date.parse(DATA[e.end].time)-Date.parse(DATA[e.start].time),3600000);
 assert.equal(e.delta,DATA[e.end].price-DATA[e.start].price);
 assert(type==='rise'?e.delta>0:e.delta<0);
}
console.log('PASS: extrema, plateaus, flat series, boundaries, missing data and ranked one-hour changes.');
