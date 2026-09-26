window.otoPatchPaceV013=function(html){
function replaceOnce(from,to){if(html.split(from).length!==2)throw new Error('v0.13 patch anchor: '+from.slice(0,72));html=html.replace(from,to);}
replaceOnce("version:'0.12.0-mix-and-kick-flight'","version:'0.13.0-steady-ball-pace'");
replaceOnce('<title>音の庭 — v0.12.0</title>','<title>音の庭 — v0.13.0 STEADY PACE</title>');
replaceOnce('発音記号蹴鞠 · v0.12.0 PRACTICE','発音記号蹴鞠 · v0.13.0 STEADY PACE');
replaceOnce("$('#start').addEventListener('click',start);",String.raw`
// Slower, steady rally pace gives the player room to hear the word and move.
CONFIG.startFlight=2.45;CONFIG.minFlight=2.26;CONFIG.acceleration=.011;CONFIG.minShotTime=2.20;CONFIG.maxShotTime=2.60;CONFIG.maxSeconds=75;
flightDuration=function(){return Math.max(CONFIG.minFlight,CONFIG.startFlight-state.rally*CONFIG.acceleration);};
const launchV013=launchShot;
launchShot=function(kind,direction,startPoint){
 launchV013(kind,direction,startPoint);
 // Timing and kick style shape the arc and depth; they no longer rush or delay contact.
 state.duration=flightDuration();
 if(direction===-1){
  const style=KICKS_V012[flightStyleV012];
  state.arc=1.70+(style?.arc||0)*.10;
  flightCurveV012*=.50;
  flightSkewV012=0;
 }
};
const sampleV013=sampleBall;
sampleBall=function(progress=state.flight/state.duration){
 if(!['practice','match'].includes(ceremony))return sampleV013(progress);
 const t=Math.max(0,Math.min(1.18,progress)),q=Math.min(1,t),a=state.flightStart;
 const incoming=state.direction===-1,endX=incoming?-3.78+foot.x:3.3,endY=incoming?.68:1.2;
 // Keep horizontal travel even through the small late-hit window: no eased-in arrival.
 const travel=incoming?t:q,arch=4*q*(1-q),bend=Math.sin(Math.PI*q);
 return [a[0]+(endX-a[0])*travel,
 a[1]+(endY-a[1])*q+arch*state.arc*(1+flightSkewV012*(1-2*q))-Math.max(0,t-1)*1.4,
 a[2]*(1-q)+(incoming?state.aimZ:0)*q+flightCurveV012*bend+state.wobble*Math.sin(q*3*Math.PI)*bend];
};
$('#start').addEventListener('click',start);`);
replaceOnce('window.kemari.getAudioMix=',`window.kemari.getPace=()=>({flightSeconds:state.duration,gameSeconds:CONFIG.maxSeconds,horizontalSpeed:Math.abs((-3.78+foot.x)-state.flightStart[0])/state.duration});
window.kemari.getAudioMix=`);
replaceOnce("$('#time').textContent=45;announce('READY'", "$('#time').textContent=CONFIG.maxSeconds;announce('READY'");
return html;
};
