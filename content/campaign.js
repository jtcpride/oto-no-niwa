// Pure, versioned progression. No DOM, timers, network or hidden win controls.
window.FEGCampaign=function(){
 'use strict';
 const version=1,opponents=['saku','sokichi','sumi','nagi','kota','luka'];
 const fresh=()=>({version,player:'toru',introComplete:false,acquired:[],completed:false,wins:{}});
 function normalize(value){
  const out=fresh();if(!value||value.version!==version)return out;
  out.introComplete=value.introComplete===true;
  out.acquired=opponents.filter(id=>Array.isArray(value.acquired)&&value.acquired.includes(id));
  out.completed=value.completed===true&&out.acquired.length===6;
  for(const id of opponents){const n=value.wins&&value.wins[id];if(Number.isSafeInteger(n)&&n>0)out.wins[id]=Math.min(9999,n);}
  return out;
 }
 function award(value,id){const out=normalize(value);if(!opponents.includes(id))return out;out.acquired=opponents.filter(x=>x===id||out.acquired.includes(x));out.wins[id]=Math.min(9999,(out.wins[id]||0)+1);return out;}
 return {version,opponents,fresh,normalize,award,orbCount:value=>1+normalize(value).acquired.length,unlocked:value=>normalize(value).acquired.length===6};
};
