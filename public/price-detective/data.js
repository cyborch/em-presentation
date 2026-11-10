/* Synthetic hourly CEST observations. No historical measurements.
   Replace DATA with 72 records using the same field names and explicit timezone. */
const DATA = (() => {
  const prices = [
    [58,53,49,45,46,51,64,73,61,42,19,5,0,0,3,15,39,71,94,110,97,84,71,62],
    [78,73,70,68,72,84,112,141,129,115,106,99,96,98,103,119,143,177,205,218,187,148,119,101],
    [116,108,103,112,141,210,295,350,279,217,175,150,136,142,171,228,335,503,675,735,564,371,247,175]
  ];
  return prices.flatMap((dayPrices,day)=> dayPrices.map((price,hour)=> {
    const solar = Math.round(Math.max(0,Math.sin((hour-6)/12*Math.PI))*[34,33,26][day]*10)/10;
    const wind = Math.round(([22,9,6][day]+Math.sin(hour/4+day)*[3,2,2][day])*10)/10;
    const demand = Math.round(([46,46,55][day]+Math.sin((hour-7)/24*Math.PI*2)*7+(hour>=17&&hour<=20?5:0))*10)/10;
    return {index:day*24+hour,day:day+12,hour,time:`2026-09-${day+12}T${String(hour).padStart(2,'0')}:00:00+02:00`,price,solar,wind,demand,residual:Math.round((demand-solar-wind)*10)/10,illustrative:true};
  }));
})();
if(typeof module !== 'undefined') module.exports=DATA;
