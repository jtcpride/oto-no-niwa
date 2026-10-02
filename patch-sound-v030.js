// Original, synthesized gagaku-inspired score. No recorded music or phonemes.
// Apply last so lifecycle wrappers see the final campaign/combat implementation.
window.otoPatchSoundV030=function(html){
 function once(a,b){if(html.split(a).length!==2)throw Error('v0.30 sound anchor: '+a.slice(0,75));html=html.replace(a,b);}
 once('</style>',String.raw`
 #audioResumeV030{position:fixed;z-index:90;top:calc(env(safe-area-inset-top,0px) + 58px);right:12px;max-width:min(280px,85vw);padding:10px 14px;color:#fff5d1;background:#26392f;border:1px solid #dfc37d;border-radius:8px;font:600 13px/1.4 sans-serif;box-shadow:0 3px 18px #0008}
 #audioResumeV030[hidden]{display:none}
 </style>`);
 // Changing pronunciation volume cancels the title's voice, but must still finish its transition.
 once("if(key==='voiceVolume')audio.stopVoice();","if(key==='voiceVolume')audio.stopVoice(titlePendingV020);");
 once("$('#start').addEventListener('click',start);",String.raw`
// Audio lifecycle has one frame-driven scheduler, no interval and no queued TTS.
const soundV030={successes:0,level:0,active:new Set(),sho:[],nextPulse:0,breathAt:0,beat:0,
 seed:0x6f746f,disposed:false,resumePending:null,resumeSerial:0,contextCount:0,
 needsGesture:false,speechBlocked:false,lastMove:-99,lastHit:-99,lastSuccess:-99,
 counters:{sho:0,string:0,flute:0,taiko:0,movement:0,hit:0,speech:0,recoveries:0},mixTarget:0};
const audioResumeV030=document.createElement('button');audioResumeV030.id='audioResumeV030';
audioResumeV030.type='button';audioResumeV030.textContent='音声を再開 · タップ';audioResumeV030.hidden=true;
audioResumeV030.setAttribute('aria-label','音声を再開');document.body.appendChild(audioResumeV030);
const AUDIO_PREF_V030='feg.audio.v1';
function audioPrefsV030(){try{localStorage.setItem(AUDIO_PREF_V030,JSON.stringify({version:1,enabled:audio.enabled,music:audio.musicVolume,voice:audio.voiceVolume}));}catch(e){/* Private mode may deny storage; audio still works. */}}
function soundActiveV030(){const gather=typeof campaignV030!=='undefined'&&campaignV030.phase==='gather';return !soundV030.disposed&&!document.hidden&&state.mode!=='paused'&&(['ready','playing'].includes(state.mode)||gather);}
function soundUiV030(){
 $('#sound').textContent=audio.enabled?'音 ON':'音 OFF';$('#sound').setAttribute('aria-pressed',String(audio.enabled));
 audioResumeV030.hidden=!audio.enabled||soundV030.disposed||document.hidden||state.mode==='paused'||!(soundV030.needsGesture||soundV030.speechBlocked);
}
function abortTitleSoundV030(){if(titlePendingV020){titlePendingV020=false;$('#start').disabled=false;$('#stageSelect').disabled=false;}}
function soundTargetV030(param,value,seconds=.04){const t=audio.ctx.currentTime;param.cancelScheduledValues(t);param.setTargetAtTime(value,t,seconds);}
function stopSourcesV030(kind){
 for(const entry of [...soundV030.active])if(!kind||entry.kind===kind){entry.source.onended=null;try{entry.source.stop();}catch(e){}try{entry.source.disconnect();entry.gain.disconnect();}catch(e){}soundV030.active.delete(entry);}
 soundV030.sho=soundV030.sho.filter(e=>soundV030.active.has(e));soundV030.nextPulse=0;
}
function trackSourceV030(source,gain,kind){
 // A fast rush cannot create an unbounded number of overlapping voices.
 if(soundV030.active.size>=64){const oldest=[...soundV030.active].find(e=>e.kind!=='sho');if(oldest){oldest.source.onended=null;try{oldest.source.stop();oldest.source.disconnect();oldest.gain.disconnect();}catch(e){}soundV030.active.delete(oldest);}}
 const entry={source,gain,kind};soundV030.active.add(entry);source.onended=()=>{soundV030.active.delete(entry);try{source.disconnect();gain.disconnect();}catch(e){}};return entry;
}
function soundContextStateV030(){
 if(!audio.ctx)return;
 if(audio.ctx.state!=='running'){abortTitleSoundV030();audio.stopVoice();stopSourcesV030();soundV030.needsGesture=audio.enabled;}
 else{soundV030.needsGesture=false;soundV030.resumePending=null;audio.applyMix();}
 soundUiV030();
}
audio.ensure=function(){
 if(soundV030.disposed)return;
 if(!this.ctx||this.ctx.state==='closed'){
  const C=window.AudioContext||window.webkitAudioContext;if(!C){soundV030.needsGesture=false;return;}
  if(this.ctx)this.ctx.removeEventListener('statechange',soundContextStateV030);
  stopSourcesV030();++soundV030.resumeSerial;soundV030.resumePending=null;
  // AudioContext.currentTime restarts at zero when a closed context is replaced.
  Object.assign(soundV030,{breathAt:0,lastMove:-99,lastHit:-99,lastSuccess:-99});
  try{
   this.ctx=new C();soundV030.contextCount++;this.master=this.ctx.createGain();this.master.gain.value=this.enabled?.32:0;
   this.limiterV030=this.ctx.createDynamicsCompressor();this.limiterV030.threshold.value=-14;this.limiterV030.ratio.value=5;
   this.master.connect(this.limiterV030);this.limiterV030.connect(this.ctx.destination);
   this.musicBus=this.ctx.createGain();this.fxBus=this.ctx.createGain();this.musicBus.connect(this.master);this.fxBus.connect(this.master);
   this.ctx.addEventListener('statechange',soundContextStateV030);this.applyMix();
  }catch(e){soundV030.needsGesture=true;soundUiV030();return;}
 }
 // resume() is invoked directly in start/gesture handlers, never after awaiting.
 if(this.enabled&&this.ctx.state!=='running'&&!soundV030.resumePending){
  const serial=++soundV030.resumeSerial;
  try{const promise=this.ctx.resume();soundV030.resumePending=promise;
   Promise.resolve(promise).then(()=>{if(serial!==soundV030.resumeSerial||soundV030.disposed)return;soundV030.resumePending=null;soundContextStateV030();},()=>{if(serial!==soundV030.resumeSerial)return;soundV030.resumePending=null;soundV030.needsGesture=true;soundUiV030();});
  }catch(e){soundV030.resumePending=null;soundV030.needsGesture=true;}
 }
 if(this.enabled&&this.ctx.state!=='running')soundV030.needsGesture=true;soundUiV030();
};
audio.resumeFromGesture=function(){
 if(soundV030.disposed||!this.enabled)return;
 // A previous pending Safari resume may remain unresolved after interruption.
 soundV030.resumePending=null;this.ensure();
 if('speechSynthesis' in window)try{window.speechSynthesis.resume();}catch(e){}
 soundV030.speechBlocked=false;soundV030.counters.recoveries++;soundUiV030();
};
audio.applyMix=function(){
 if(!this.ctx||!this.musicBus)return;
 const phase=typeof duelV022!=='undefined'?duelV022.phase:'front';
 const scene=['charge','breakCharge','settle'].includes(phase)?.24:phase==='break'?.5:phase==='close'?.58:1;
 // A 72% accompaniment reduction leaves word recognition in the foreground.
 soundV030.mixTarget=this.musicVolume*(this.ducked?.28:1)*scene;
 soundTargetV030(this.musicBus.gain,soundV030.mixTarget,this.ducked?.025:.18);
 soundTargetV030(this.fxBus.gain,.8,.04);soundTargetV030(this.master.gain,this.enabled?.32:0,.025);
};
audio.set=function(on){
 this.enabled=!!on;if(this.enabled){this.ensure();this.resumeFromGesture();}
 else{this.stopVoice(titlePendingV020);stopSourcesV030();soundV030.needsGesture=false;soundV030.speechBlocked=false;}
 this.applyMix();audioPrefsV030();soundUiV030();
};
audio.releaseVoice=function(token,cancel=false){
 if(token!==this.voiceToken)return;++this.voiceToken;clearTimeout(this.voiceTimer);this.voiceTimer=null;this.ducked=false;
 const done=this.voiceDone;this.voiceDone=null;
 // Invalidate callbacks before native cancellation, which may synchronously emit an error.
 if(cancel&&'speechSynthesis' in window)try{window.speechSynthesis.cancel();}catch(e){}
 this.applyMix();done?.();
};
audio.stopVoice=function(complete=false){
 const done=complete?this.voiceDone:null;
 ++this.voiceToken;clearTimeout(this.voiceTimer);this.voiceTimer=null;this.voiceDone=null;this.ducked=false;
 if('speechSynthesis' in window)try{window.speechSynthesis.cancel();}catch(e){}this.applyMix();done?.();
};
audio.speak=function(u,onDone){
 if(!this.enabled||!this.voiceVolume||soundV030.disposed||document.hidden){onDone?.();return;}
 const token=++this.voiceToken;clearTimeout(this.voiceTimer);this.voiceDone=onDone;this.ducked=true;this.applyMix();
 // Preserve the caller-selected en-US voice, rate, pitch and volume.
 u.onstart=()=>{if(token!==this.voiceToken)return;this.ducked=true;soundV030.speechBlocked=false;this.applyMix();soundUiV030();};
 u.onend=()=>this.releaseVoice(token);
 u.onerror=e=>{if(token!==this.voiceToken)return;if(e?.error==='not-allowed'||e?.error==='audio-busy'){soundV030.speechBlocked=true;soundUiV030();}this.releaseVoice(token);};
 this.voiceTimer=setTimeout(()=>this.releaseVoice(token,true),Math.max(onDone?8000:2500,u.text.length*180));
 try{window.speechSynthesis.cancel();window.speechSynthesis.resume();window.speechSynthesis.speak(u);soundV030.counters.speech++;}catch(e){soundV030.speechBlocked=true;this.releaseVoice(token);soundUiV030();}
};
function audibleV030(bus='fx'){return audio.enabled&&audio.ctx?.state==='running'&&!soundV030.disposed&&!document.hidden&&state.mode!=='paused'&&(bus!=='music'||audio.musicVolume>0);}
audio.note=function(freq,dur,vol,type='sine',delay=0,slide=0,bus='fx'){
 if(!audibleV030(bus))return;const t=this.ctx.currentTime+Math.max(0,delay),o=this.ctx.createOscillator(),g=this.ctx.createGain();
 o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0001,vol),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(g);g.connect(bus==='music'?this.musicBus:this.fxBus);trackSourceV030(o,g,bus);o.start(t);o.stop(t+dur+.03);
};
function soundNoiseV030(){soundV030.seed=(Math.imul(soundV030.seed,1664525)+1013904223)>>>0;return soundV030.seed/2147483648-1;}
function pluckV030(frequency,volume=.13,bus='music'){
 if(!audibleV030(bus))return;const c=audio.ctx,sr=c.sampleRate,len=Math.floor(sr*.95),period=Math.max(2,Math.round(sr/frequency));
 const b=c.createBuffer(1,len,sr),d=b.getChannelData(0);for(let i=0;i<period;i++)d[i]=soundNoiseV030()*.72;
 for(let i=period;i<len;i++)d[i]=.496*(d[i-period]+d[i-period+1]);
 const o=c.createBufferSource(),g=c.createGain();o.buffer=b;g.gain.value=volume;o.connect(g);g.connect(bus==='music'?audio.musicBus:audio.fxBus);
 trackSourceV030(o,g,bus);o.start();o.stop(c.currentTime+.97);soundV030.counters.string++;
}
function fluteV030(frequency,volume=.075){
 if(!audibleV030('music'))return;audio.note(frequency,.75,volume,'sine',0,frequency*1.006,'music');audio.note(frequency*2,.52,volume*.13,'triangle',.025,0,'music');soundV030.counters.flute++;
}
function taikoV030(volume=.13){if(!audibleV030('music'))return;audio.note(95,.42,volume,'sine',0,43,'music');audio.note(210,.065,volume*.32,'triangle',0,110,'music');soundV030.counters.taiko++;}
function shoV030(){
 if(soundV030.sho.length||!audibleV030('music')||!soundActiveV030())return;
 const c=audio.ctx,real=new Float32Array(9),imag=new Float32Array([0,1,.23,.13,.19,.04,.075,.015,.03]);
 const wave=c.createPeriodicWave(real,imag);const notes=ACTIVE_STAGE.id==='gion'?[220,293.66,440,493.88,587.33]:[293.66,440,493.88,587.33,659.25];
 notes.forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.setPeriodicWave(wave);o.frequency.value=f;o.detune.value=(i-2)*1.3;g.gain.value=0;
  o.connect(g);g.connect(audio.musicBus);const entry=trackSourceV030(o,g,'sho');entry.index=i;soundV030.sho.push(entry);o.start();g.gain.setTargetAtTime(.025,c.currentTime,.6);});
 soundV030.counters.sho++;
}
function successSoundV030(){
 soundV030.successes++;soundV030.level=soundV030.successes>=8?3:soundV030.successes>=5?2:soundV030.successes>=2?1:0;audio.layers=soundV030.level;
 const t=audio.ctx?.currentTime||0;
 if(t-soundV030.lastSuccess<.075)return;soundV030.lastSuccess=t;
 if(soundV030.level>=1)pluckV030([293.66,329.63,440,493.88,587.33][soundV030.successes%5],.11/Math.sqrt(1+soundV030.level*.3));
 if(soundV030.level>=2&&soundV030.successes%2===1)fluteV030([587.33,659.25,880,987.77][soundV030.successes%4],.065);
 if(soundV030.level>=3)taikoV030(.10);
}
audio.hit=function(isPlayer,rally,perfect){
 if(isPlayer&&rally>0)successSoundV030();
 if(!audibleV030())return;const t=this.ctx.currentTime;if(t-soundV030.lastHit<.04)return;soundV030.lastHit=t;
 this.note(isPlayer?310:245,.13,.16,'sine',0,90);this.note(isPlayer?1100:850,.045,.055,'triangle');
 if(perfect)this.note(1174.66,.21,.06,'sine',.015);soundV030.counters.hit++;
};
audio.movement=function(slot=0){if(!audibleV030())return;const t=this.ctx.currentTime;if(t-soundV030.lastMove<.11)return;soundV030.lastMove=t;
 this.note(145+slot*13,.065,.055,'triangle',0,65);soundV030.counters.movement++;};
audio.update=function(){}; // replaced by the one outer frame pump below
function soundPumpV030(){
 if(!soundActiveV030()||!audio.enabled||audio.ctx?.state!=='running'){if(soundV030.sho.length)stopSourcesV030('sho');return;}
 shoV030();const t=audio.ctx.currentTime;
 if(t>=soundV030.breathAt){soundV030.breathAt=t+.16;const norm=1/Math.sqrt(1+soundV030.level*.28);
  soundV030.sho.forEach(e=>soundTargetV030(e.gain.gain,(.021+.007*Math.sin(t*.7+e.index*.12))*norm,.28));audio.applyMix();}
 if(t<soundV030.nextPulse)return;soundV030.nextPulse=t+1.12;soundV030.beat++;
 // The clock phrases already-earned layers; elapsed time cannot unlock layers.
 if(soundV030.level>=1&&soundV030.beat%2===0)pluckV030([293.66,440,329.63,493.88][soundV030.beat%4],.075);
 if(soundV030.level>=2&&soundV030.beat%4===1)fluteV030([587.33,659.25,880][soundV030.beat%3],.055);
 if(soundV030.level>=3&&soundV030.beat%2===0)taikoV030(.07);
}
function resetSoundV030(){stopSourcesV030();audio.stopVoice();Object.assign(soundV030,{successes:0,level:0,beat:0,breathAt:0,lastMove:-99,lastHit:-99,lastSuccess:-99});audio.layers=0;}
const startSoundV030=start;start=function(){if(titlePendingV020||state.mode==='error')return;resetSoundV030();if(audio.enabled)audio.resumeFromGesture();const r=startSoundV030();soundPumpV030();return r;};
const matchSoundV030=beginMatch;beginMatch=function(){resetSoundV030();const r=matchSoundV030();soundPumpV030();return r;};
const pauseSoundV030=pause;pause=function(){const wasPaused=state.mode==='paused';if(wasPaused&&audio.enabled)audio.resumeFromGesture();const r=pauseSoundV030();
 if(state.mode==='paused'){stopSourcesV030();audio.stopVoice();}else soundPumpV030();soundUiV030();return r;};
const selectSoundV030=select;select=function(index){const before=state.selected,score=closeV027.score,r=selectSoundV030(index);if(closeV027.score>score)successSoundV030();if(soundActiveV030()&&state.selected!==before)audio.movement(state.selected);return r;};
const kickSoundV030=kick;kick=function(){const taps=duelV022.taps,r=kickSoundV030();if(duelV022.taps>taps)successSoundV030();return r;};
const endSoundV030=end;end=function(kind){const before=state.mode,r=endSoundV030(kind);if(state.mode!==before&&['over','finishing'].includes(state.mode))stopSourcesV030('sho');return r;};
const gameSoundV030=updateGame;updateGame=function(dt){const r=gameSoundV030(dt);soundPumpV030();return r;};
for(const id of ['musicVolume','voiceVolume'])$('#'+id).addEventListener('input',audioPrefsV030);
try{const p=JSON.parse(localStorage.getItem(AUDIO_PREF_V030)||'null');if(p&&p.version===1){
 if(typeof p.enabled==='boolean'){audio.enabled=p.enabled;audio.userChoice=true;}
 if(Number.isFinite(p.music))audio.musicVolume=Math.max(0,Math.min(1,p.music));if(Number.isFinite(p.voice))audio.voiceVolume=Math.max(0,Math.min(1,p.voice));
 }}catch(e){}
for(const [id,key,out] of [['musicVolume','musicVolume','musicValue'],['voiceVolume','voiceVolume','voiceValue']]){$('#'+id).value=String(Math.round(audio[key]*100));$('#'+out).value=$('#'+id).value;}
soundUiV030();
audioResumeV030.addEventListener('click',()=>{audio.resumeFromGesture();if(soundActiveV030()&&state.direction===-1)speakWord();soundPumpV030();});
function gestureSoundV030(){if(audio.enabled&&(soundV030.needsGesture||audio.ctx?.state==='interrupted'||audio.ctx?.state==='suspended'))audio.resumeFromGesture();}
document.addEventListener('pointerdown',gestureSoundV030,{passive:true});document.addEventListener('keydown',gestureSoundV030);
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){abortTitleSoundV030();audio.stopVoice();stopSourcesV030();if(audio.ctx?.state==='running')audio.ctx.suspend().catch(()=>{});}
 else{soundV030.needsGesture=!!(audio.enabled&&audio.ctx&&audio.ctx.state!=='running');soundUiV030();}
});
audio.dispose=function(){if(soundV030.disposed)return;soundV030.disposed=true;++soundV030.resumeSerial;soundV030.resumePending=null;audio.stopVoice();stopSourcesV030();
 if(audio.ctx){audio.ctx.removeEventListener('statechange',soundContextStateV030);if(audio.ctx.state!=='closed')audio.ctx.close().catch(()=>{});}soundUiV030();};
window.addEventListener('pagehide',e=>{abortTitleSoundV030();if(e.persisted){audio.stopVoice();stopSourcesV030();if(audio.ctx?.state==='running')audio.ctx.suspend().catch(()=>{});}else audio.dispose();});
window.addEventListener('pageshow',()=>{if(audio.enabled&&audio.ctx&&audio.ctx.state!=='running'){soundV030.needsGesture=true;soundUiV030();}});
canvas.addEventListener('webglcontextlost',()=>{audio.stopVoice();stopSourcesV030();});
$('#start').addEventListener('click',start);`);
 once('select(0);refreshHud();requestAnimationFrame(frame);',String.raw`
window.kemari.getAudioDiagnostics=()=>({version:'0.30-gagaku',contextState:audio.ctx?.state||'not-created',contexts:soundV030.contextCount,enabled:audio.enabled,
 music:audio.musicVolume,voice:audio.voiceVolume,ducked:audio.ducked,musicTarget:soundV030.mixTarget,successes:soundV030.successes,layer:soundV030.level,
 layerNames:['shō',...(soundV030.level>=1?['plucked strings']:[]),...(soundV030.level>=2?['flute']:[]),...(soundV030.level>=3?['taiko']:[])],
 activeSources:soundV030.active.size,shoVoices:soundV030.sho.length,voiceToken:audio.voiceToken,voiceTimer:!!audio.voiceTimer,
 needsGesture:soundV030.needsGesture,speechBlocked:soundV030.speechBlocked,resumeVisible:!audioResumeV030.hidden,disposed:soundV030.disposed,
 counters:{...soundV030.counters},realDeviceAcceptance:'iPhone/iPad Safari: not yet tested'});
select(0);refreshHud();requestAnimationFrame(frame);`);
 return html;
};
