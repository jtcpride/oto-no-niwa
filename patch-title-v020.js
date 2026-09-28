window.otoPatchTitleV020=function(html){
function replaceOnce(from,to){if(html.split(from).length!==2)throw new Error('v0.20 patch anchor: '+from.slice(0,72));html=html.replace(from,to);}
replaceOnce("version:'0.19.0-mobile-audio'","version:'0.20.0-fifteenth-ever-garden'");
replaceOnce('<title>音の庭 — v0.19.0</title>','<title>FIFTEENTH EVER GARDEN — v0.20.0</title>');
replaceOnce('<h1>音の庭</h1>','<h1>FIFTEENTH<br>EVER GARDEN</h1>');
replaceOnce('<h2>聞いて、<br><em>蹴り返す。</em></h2>','<h2>FIFTEENTH<br><em>EVER GARDEN</em></h2>');
replaceOnce('<button id="start" class="primary">はじめる <span>↗</span></button>','<button id="start" class="primary">START <span>↗</span></button>');
replaceOnce('</style>',`\n/* Keep the existing typefaces and colors, with room for two English lines. */
.brand h1{font-size:18px;line-height:1.15;letter-spacing:.06em;white-space:nowrap}
#intro h2{font-size:clamp(22px,5.4vw,40px);line-height:1.18;letter-spacing:.03em;white-space:nowrap}
@media(max-width:680px){.brand{gap:6px}.brand .crest{display:none}.brand h1{font-size:13px;letter-spacing:.03em}}
@media(orientation:landscape) and (max-height:600px){.brand h1{font-size:13px}#intro h2{font-size:26px}}
</style>`);
replaceOnce('/Samantha|Ava|Alex|Daniel/i.test(v.name))','/Samantha|Ava/i.test(v.name))||voices.find(v=>/^en-US/i.test(v.lang)&&/Alex|Daniel/i.test(v.name))');
// The title goes through the word speaker itself: identical voice, rate, pitch and volume.
replaceOnce('function speakWord(word=state.word){','function speakWord(word=state.word,onDone){');
replaceOnce("if(!word||!audio.enabled||audio.voiceVolume===0||!('speechSynthesis' in window))return;","if(!word||!audio.enabled||audio.voiceVolume===0||!('speechSynthesis' in window)){onDone?.();return;}");
replaceOnce("audio.speak(u);}catch(e){console.warn('speech synthesis failed',e);}","audio.speak(u,onDone);}catch(e){console.warn('speech synthesis failed',e);onDone?.();}");
replaceOnce('this.ducked=false;this.applyMix();};','this.ducked=false;this.applyMix();const done=this.voiceDone;this.voiceDone=null;done?.();};');
replaceOnce('audio.speak=function(u){if(!this.enabled||!this.voiceVolume)return;','audio.speak=function(u,onDone){if(!this.enabled||!this.voiceVolume){onDone?.();return;}this.voiceDone=onDone;');
replaceOnce('Math.max(2500,u.text.length*180)','Math.max(onDone?8000:2500,u.text.length*180)');
replaceOnce("$('#start').addEventListener('click',start);",String.raw`
const startV020=start;
let titlePendingV020=false;
start=function(){
 if(titlePendingV020||state.mode==='error')return;
 if(state.mode!=='idle')return startV020();
 audio.ensure();if(!audio.userChoice)audio.set(true);
 titlePendingV020=true;$('#start').disabled=true;
 let finished=false;
 const finish=()=>{
  if(finished||!titlePendingV020)return;
  finished=true;
  setOverlay(null);
  setTimeout(()=>{
   titlePendingV020=false;$('#start').disabled=false;
   startV020();
  },500);
 };
 speakWord('FIFTEENTH EVER GARDEN',finish);
};
$('#start').addEventListener('click',start);`);
return html;
};
