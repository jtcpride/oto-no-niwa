window.otoPatchTempoV026=function(html){
 function replaceOnce(a,b){if(html.split(a).length!==2)throw Error('v0.26 anchor: '+a.slice(0,60));html=html.replace(a,b);}
 replaceOnce("version:'0.25.1-bow-cue'","version:'0.26.0-closing-tempo'");
 replaceOnce('FIFTEENTH EVER GARDEN — v0.25.1','FIFTEENTH EVER GARDEN — v0.26.0');
 // A wider late window must remain visible, and the ball must keep moving through it.
 replaceOnce('const marker=incoming?Math.min(.99,p*.86):0;', 'const timingScale=Math.min(.86,.98/(1+CONFIG.hitWindow/state.duration));const marker=incoming?Math.min(.99,p*timingScale):0;');
 replaceOnce('const w=CONFIG.hitWindow/state.duration*.86*100,pw=CONFIG.perfectWindow/state.duration*.86*100;', 'const w=CONFIG.hitWindow/state.duration*timingScale*100,pw=CONFIG.perfectWindow/state.duration*timingScale*100;');
 replaceOnce("$('.hit-window').style.left=(86-w)+'%';", "$('.hit-window').style.left=(timingScale*100-w)+'%';");
 replaceOnce("$('.perfect-window').style.left=(86-pw)+'%';", "$('.perfect-window').style.left=(timingScale*100-pw)+'%';");
 replaceOnce("if(!['practice','match'].includes(ceremony))return sampleV013(progress);\n "+'const t=Math.max(0,Math.min(1.18,progress)),q=Math.min(1,t),a=state.flightStart;', "if(!['practice','match'].includes(ceremony))return sampleV013(progress);\n "+'const t=Math.max(0,Math.min(Math.max(1.18,1+CONFIG.hitWindow/state.duration),progress)),q=Math.min(1,t),a=state.flightStart;');
 replaceOnce("$('#start').addEventListener('click',start);",String.raw`
const launchTempoV026=launchShot;
launchShot=function(kind,direction,point){
 const r=launchTempoV026(kind,direction,point);
 if(ceremony!=='match')return r;
 CONFIG.hitWindow=NORMAL_HIT_WINDOW;
 if(feelEnabledV023&&duelV022.phase==='back'){
  // Keep the front-court horizontal speed, using the pinned receive/launch offsets.
  // The floor deliberately limits the acceleration so spoken prompts retain breathing room.
  const base=flightDuration(),span=3.3-(-3.78+foot.x);
  const distance=Math.max(.1,span+strideV024.flight[1]-strideV024.flight[0]);
  state.duration=Math.max(1.5,base*distance/span);
  const pressure=clamp01V011((base-state.duration)/(base-1.5));
  CONFIG.hitWindow=NORMAL_HIT_WINDOW+.16*pressure;
 }
 return r;
};
$('#start').addEventListener('click',start);`);
 return html;
};
