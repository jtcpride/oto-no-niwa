// Original gagaku-inspired score, with interchangeable recorded / native speech.
// Apply last so lifecycle wrappers see the final campaign/combat implementation.
window.otoPatchSoundV030=function(html){
 if(!['recorded','native'].includes(window.FEGVoiceConfig?.engine))throw Error('Load content/voice-config.js before patch-sound-v030.js');
 function once(a,b){if(html.split(a).length!==2)throw Error('v0.30 sound anchor: '+a.slice(0,75));html=html.replace(a,b);}
 // Keep the existing gameplay wrappers; replace their underlying dispatchers.
 const wordSpeaker=html.match(/function speakWord\(word=state.word,onDone\)\{[^\n]+\}/)?.[0];
 const callSpeaker=html.match(/function speakCallV010\(text\)\{[^\n]+\}/)?.[0];
 if(!wordSpeaker||!callSpeaker)throw Error('v0.32 fixed voice dispatch anchors missing');
 once(wordSpeaker,"function speakWord(word=state.word,onDone){if(!word){onDone?.();return;}audio.speak({text:word,kind:'word'},onDone);}");
 once(callSpeaker,"function speakCallV010(text){if(text)audio.speak({text,kind:'call'});}");
 html=html.replace("if(!('speechSynthesis' in window)){$('#repeatWord').disabled=true;announce('音声を使えません','このブラウザでは単語読み上げに未対応',1.6);}","if(!audio.voiceSupported()){$('#repeatWord').disabled=true;announce('音声を使えません','このブラウザでは選択中の音声方式に未対応',1.6);}");
 once('</style>',String.raw`
 #audioResumeV030{position:fixed;z-index:90;top:calc(env(safe-area-inset-top,0px) + 58px);right:12px;max-width:min(280px,85vw);padding:10px 14px;color:#fff5d1;background:#26392f;border:1px solid #dfc37d;border-radius:8px;font:600 13px/1.4 sans-serif;box-shadow:0 3px 18px #0008}
 #audioResumeV030[hidden]{display:none}
 </style>`);
 // Changing pronunciation volume cancels the title's voice, but must still finish its transition.
 once("if(key==='voiceVolume')audio.stopVoice();","if(key==='voiceVolume')audio.stopVoice(titlePendingV020);");
 once("$('#start').addEventListener('click',start);",String.raw`
// Audio lifecycle has one frame-driven scheduler and no queued voice playback.
const voiceConfigV033=__VOICE_CONFIG_V033__;
const voiceModeV033=(()=>{try{const value=new URL(window.location.href).searchParams.get('voice');if(value==='recorded'||value==='native')return value;}catch(e){}return voiceConfigV033.engine;})();
let nativeGestureV033=false;
const voiceClipsV032=__VOICE_CLIPS_V032__;
const voiceBytesV032=new Map(),voiceBuffersV032=new Map(),voiceLoadsV032=new Map();
const soundV030={successes:0,level:0,active:new Set(),sho:[],nextPulse:0,breathAt:0,beat:0,
 seed:0x6f746f,disposed:false,resumePending:null,resumeSerial:0,contextCount:0,
 needsGesture:false,speechBlocked:false,voiceStatus:'idle',lastVoiceError:'',lastVoiceText:'',lastMove:-99,lastHit:-99,lastSuccess:-99,
 counters:{sho:0,string:0,flute:0,taiko:0,movement:0,hit:0,speech:0,recoveries:0},mixTarget:0};
const audioResumeV030=document.createElement('button');audioResumeV030.id='audioResumeV030';
audioResumeV030.type='button';audioResumeV030.textContent='音声を再開 · タップ';audioResumeV030.hidden=true;
audioResumeV030.setAttribute('aria-label','音声を再開');document.body.appendChild(audioResumeV030);
const AUDIO_PREF_V030='feg.audio.v1';
function audioPrefsV030(){try{localStorage.setItem(AUDIO_PREF_V030,JSON.stringify({version:1,enabled:audio.enabled,music:audio.musicVolume,voice:audio.voiceVolume}));}catch(e){/* Private mode may deny storage; audio still works. */}}
function soundActiveV030(){const gather=typeof campaignV030!=='undefined'&&campaignV030.phase==='gather';return !soundV030.disposed&&!document.hidden&&state.mode!=='paused'&&(['ready','playing'].includes(state.mode)||gather);}
function soundUiV030(){
 $('#sound').textContent=audio.enabled?'音 ON':'音 OFF';$('#sound').setAttribute('aria-pressed',String(audio.enabled));
 audioResumeV030.textContent=soundV030.speechBlocked?'音声を再試行 · タップ':'音声を再開 · タップ';
 audioResumeV030.hidden=!audio.enabled||soundV030.disposed||document.hidden||state.mode==='paused'||!(soundV030.needsGesture||soundV030.speechBlocked);
}
function abortTitleSoundV030(){if(titlePendingV020){titlePendingV020=false;$('#start').disabled=false;$('#stageSelect').disabled=false;}}
function soundTargetV030(param,value,seconds=.04){const t=audio.ctx.currentTime;param.cancelScheduledValues(t);param.setTargetAtTime(value,t,seconds);}
function stopSourcesV030(kind){
 for(const entry of [...soundV030.active])if(!kind||entry.kind===kind){entry.source.onended=null;try{entry.source.stop();}catch(e){}try{entry.source.disconnect();entry.gain.disconnect();}catch(e){}soundV030.active.delete(entry);}
 soundV030.sho=soundV030.sho.filter(e=>soundV030.active.has(e));if(kind!=='voice')soundV030.nextPulse=0;
}
function trackSourceV030(source,gain,kind){
 // A fast rush cannot create an unbounded number of overlapping voices.
 if(soundV030.active.size>=64){const oldest=[...soundV030.active].find(e=>e.kind!=='sho'&&e.kind!=='voice');if(oldest){oldest.source.onended=null;try{oldest.source.stop();oldest.source.disconnect();oldest.gain.disconnect();}catch(e){}soundV030.active.delete(oldest);}}
 const entry={source,gain,kind};soundV030.active.add(entry);source.onended=()=>{soundV030.active.delete(entry);try{source.disconnect();gain.disconnect();}catch(e){}};return entry;
}
function soundContextStateV030(){
 if(!audio.ctx)return;
 if(audio.ctx.state!=='running'){if(voiceModeV033==='recorded'){abortTitleSoundV030();audio.stopVoice();}stopSourcesV030();soundV030.needsGesture=audio.enabled;}
 else{soundV030.needsGesture=false;soundV030.resumePending=null;audio.applyMix();startVoiceV032();}
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
   // Reserve headroom for speech without compressing the quiet score on each
   // word. The limiter only catches unusually loud combined transients.
   this.limiterV030=this.ctx.createDynamicsCompressor();this.limiterV030.threshold.value=-3;this.limiterV030.ratio.value=5;
   this.master.connect(this.limiterV030);this.limiterV030.connect(this.ctx.destination);
   this.musicBus=this.ctx.createGain();this.fxBus=this.ctx.createGain();this.voiceBus=this.ctx.createGain();this.voiceBus.gain.value=2.4;
   this.musicBus.connect(this.master);this.fxBus.connect(this.master);this.voiceBus.connect(this.master);
   this.ctx.addEventListener('statechange',soundContextStateV030);this.applyMix();preloadVoiceBuffersV032();
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
 soundV030.resumePending=null;nativeGestureV033=true;this.ensure();
 if(soundV030.speechBlocked&&this.voiceRequest){const {u,onDone}=this.voiceRequest;this.speak(u,onDone);}else startVoiceV032();
 soundV030.counters.recoveries++;soundUiV030();
};
audio.voiceSupported=function(){return voiceModeV033==='native'?!!(window.speechSynthesis&&window.SpeechSynthesisUtterance):!!(window.AudioContext||window.webkitAudioContext);};
audio.canPlayVoice=function(){return voiceModeV033==='native'?nativeGestureV033&&this.voiceSupported():this.ctx?.state==='running';};
audio.applyMix=function(){
 if(!this.ctx||!this.musicBus)return;
 const phase=typeof duelV022!=='undefined'?duelV022.phase:'front';
 const scene=['charge','breakCharge','settle'].includes(phase)?.24:phase==='break'?.5:phase==='close'?.58:1;
 // Recorded voices share the score's context; native speech keeps its earlier
 // 60% music bed. The OS may additionally interrupt native speech/music on iOS.
 const nativeDuck=voiceModeV033==='native'&&this.ducked;
 soundV030.mixTarget=this.musicVolume*Math.min(scene,nativeDuck?.60:1);
 soundTargetV030(this.musicBus.gain,soundV030.mixTarget,nativeDuck?.06:.18);
 soundTargetV030(this.fxBus.gain,.8,.04);soundTargetV030(this.master.gain,this.enabled?.32:0,.025);
};
audio.set=function(on){
 this.enabled=!!on;if(this.enabled){this.ensure();this.resumeFromGesture();}
 else{this.stopVoice(titlePendingV020);stopSourcesV030();soundV030.needsGesture=false;soundV030.speechBlocked=false;}
 this.applyMix();audioPrefsV030();soundUiV030();
};
audio.releaseVoice=function(token,cancel=false){
 if(token!==this.voiceToken)return;const done=this.voiceDone;this.stopVoice();done?.();
};
audio.stopVoice=function(complete=false){
 const done=complete?this.voiceDone:null;
 ++this.voiceToken;clearTimeout(this.voiceTimer);this.voiceTimer=null;this.voiceDone=null;this.voiceRequest=null;this.ducked=false;
 if(voiceModeV033==='native')try{window.speechSynthesis?.cancel();}catch(e){}
 stopSourcesV030('voice');soundV030.voiceStatus='idle';soundV030.speechBlocked=false;this.applyMix();soundUiV030();done?.();
};
function voiceBytesForV032(text){
 const clip=voiceClipsV032[text];if(!clip)return Promise.reject(Error('Missing voice clip: '+text));
 if(voiceBytesV032.has(text))return voiceBytesV032.get(text);
 const controller=typeof AbortController!=='undefined'?new AbortController():null;
 const timeout=setTimeout(()=>controller?.abort(),12000);
 const request=Promise.resolve().then(()=>fetch(clip.file,{signal:controller?.signal,cache:'force-cache'})).then(r=>{if(!r.ok)throw Error('Voice HTTP '+r.status);return r.arrayBuffer();}).catch(e=>{if(voiceBytesV032.get(text)===request)voiceBytesV032.delete(text);throw e;}).finally(()=>clearTimeout(timeout));
 voiceBytesV032.set(text,request);return request;
}
function voiceBufferForV032(text){
 if(voiceBuffersV032.has(text))return Promise.resolve(voiceBuffersV032.get(text));
 if(voiceLoadsV032.has(text))return voiceLoadsV032.get(text);
 const context=audio.ctx;
 const request=voiceBytesForV032(text).then(bytes=>new Promise((resolve,reject)=>{context.decodeAudioData(bytes.slice(0),resolve,reject);})).then(buffer=>{if(!buffer?.duration)throw Error('Empty voice clip');voiceBuffersV032.set(text,buffer);return buffer;}).catch(e=>{voiceBytesV032.delete(text);throw e;}).finally(()=>{if(voiceLoadsV032.get(text)===request)voiceLoadsV032.delete(text);});
 voiceLoadsV032.set(text,request);return request;
}
function voiceFailedV032(request,error){
 if(request.token!==audio.voiceToken||request.failed)return;request.failed=true;clearTimeout(audio.voiceTimer);audio.voiceTimer=null;audio.ducked=false;stopSourcesV030('voice');
 if(voiceModeV033==='native'){try{window.speechSynthesis?.cancel();}catch(e){}}
 else{voiceLoadsV032.delete(request.u.text);voiceBytesV032.delete(request.u.text);}
 abortTitleSoundV030();
 soundV030.voiceStatus='error';soundV030.lastVoiceError=String(error?.message||error?.error||error);soundV030.speechBlocked=true;audio.applyMix();soundUiV030();
}
function startVoiceV032(){
 const request=audio.voiceRequest;if(!request||request.failed||request.started||request.token!==audio.voiceToken)return;
 if(voiceModeV033==='native'){startNativeVoiceV033(request);return;}
 if(!request.buffer)return;
 if(audio.ctx?.state!=='running'){soundV030.needsGesture=true;soundUiV030();return;}
 if(!audio.enabled||document.hidden||state.mode==='paused'||soundV030.disposed)return;
 try{const source=audio.ctx.createBufferSource(),gain=audio.ctx.createGain();source.buffer=request.buffer;gain.gain.value=audio.voiceVolume;
  source.connect(gain);gain.connect(audio.voiceBus);const entry=trackSourceV030(source,gain,'voice'),onend=request.u.onend;
  source.onended=()=>{soundV030.active.delete(entry);try{source.disconnect();gain.disconnect();}catch(e){}onend?.();};
  source.start();request.started=true;request.u.onstart?.();
  clearTimeout(audio.voiceTimer);audio.voiceTimer=setTimeout(()=>voiceFailedV032(request,Error('Voice playback stalled')),Math.ceil(request.buffer.duration*1000)+2000);
 }catch(e){stopSourcesV030('voice');voiceFailedV032(request,e);}
}
function startNativeVoiceV033(request){
 if(request.submitted||!audio.enabled||document.hidden||state.mode==='paused'||soundV030.disposed)return;
 if(!audio.voiceSupported()){voiceFailedV032(request,Error('Native speech unavailable'));return;}
 try{
  const u=request.u,ending=u.kind==='ending',call=u.kind==='call';
  const utterance=new window.SpeechSynthesisUtterance(u.text);request.submitted=true;
  utterance.lang=u.lang||(ending?'ja-JP':'en-US');utterance.rate=u.rate??(ending?1.2:call?.72:.82);utterance.pitch=u.pitch??(ending?1.6:call?.82:1);utterance.volume=audio.voiceVolume;
  const voices=window.speechSynthesis.getVoices(),us=voices.filter(v=>/^en-US/i.test(v.lang));
  const preferred=ending?voices.find(v=>/^ja/i.test(v.lang)):call?us.find(v=>/Daniel|Alex|Fred|Aaron/i.test(v.name)):us.find(v=>/Samantha|Ava/i.test(v.name))||us.find(v=>/Alex|Daniel/i.test(v.name));
  const voice=u.voice||preferred||(!ending&&(us[0]||voices.find(v=>/^en/i.test(v.lang))));if(voice)utterance.voice=voice;
  utterance.onstart=()=>{if(request.failed||request.token!==audio.voiceToken)return;request.started=true;u.onstart?.();};
  utterance.onend=u.onend;utterance.onerror=u.onerror;
  // Native engines occasionally omit all callbacks. Re-enable START and show
  // retry on timeout, so neither unsupported speech nor a stalled title traps UI.
  clearTimeout(audio.voiceTimer);audio.voiceTimer=setTimeout(()=>voiceFailedV032(request,Error('Native speech timed out')),Math.min(20000,Math.max(request.onDone?8000:2500,u.text.length*180)));
  window.speechSynthesis.resume();window.speechSynthesis.speak(utterance);
 }catch(e){voiceFailedV032(request,e);}
}
audio.speak=function(u,onDone){
 if(!this.enabled||!this.voiceVolume||soundV030.disposed||document.hidden||state.mode==='paused'){onDone?.();return;}
 this.stopVoice();this.ensure();const token=++this.voiceToken;this.voiceDone=onDone;
 const request={token,u,onDone,buffer:null,started:false};this.voiceRequest=request;soundV030.voiceStatus='loading';soundV030.lastVoiceText=u.text;soundV030.lastVoiceError='';
 u.onstart=()=>{if(request.failed||token!==this.voiceToken)return;this.ducked=true;soundV030.voiceStatus='playing';soundV030.speechBlocked=false;soundV030.counters.speech++;this.applyMix();soundUiV030();};
 u.onend=()=>{if(!request.failed)this.releaseVoice(token);};
 u.onerror=e=>voiceFailedV032(request,e);
 if(voiceModeV033==='native'){startVoiceV032();return;}
 this.voiceTimer=setTimeout(()=>voiceFailedV032(request,Error('Voice preparation timed out')),15000);
 if(!this.ctx){voiceFailedV032(request,Error('Web Audio unavailable'));return;}
 voiceBufferForV032(u.text).then(buffer=>{if(token!==this.voiceToken)return;request.buffer=buffer;startVoiceV032();},e=>voiceFailedV032(request,e));
};
function currentVoiceTextsV032(){return [...new Set([...(typeof ACTIVE_DECK!=='undefined'?ACTIVE_DECK.sounds.flatMap(s=>s.words.map(w=>typeof w==='string'?w:w.text)):[]),...Object.keys(voiceClipsV032).filter(text=>voiceClipsV032[text].kind!=='word')])];}
function preloadVoiceBuffersV032(){if(voiceModeV033!=='recorded'||typeof fetch!=='function')return;for(const text of currentVoiceTextsV032())voiceBufferForV032(text).catch(()=>{});}
// Fetch ahead without creating an autoplay context; decode after the first gesture.
if(voiceModeV033==='recorded'&&typeof fetch==='function')for(const text of currentVoiceTextsV032())voiceBytesForV032(text).catch(()=>{});
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
 // Restore the pre-v0.30 electronic kick for both sides, including rally accents.
 this.note(isPlayer?440:330,.18,.36,'sine',0,isPlayer?180:140);this.note(isPlayer?880:660,.24,.12,'triangle');
 if(rally>=4)this.note(82,.3,.32,'sine');if(rally>=8)this.note(1320,.1,.08,'triangle');
 if(perfect)this.note(1174.66,.36,.15,'sine',.02);soundV030.counters.hit++;
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
audioResumeV030.addEventListener('click',()=>{audio.resumeFromGesture();if(!audio.voiceRequest&&typeof campaignV030!=='undefined'&&campaignV030.phase==='dialogue')speakDialogueLineV030();else if(!audio.voiceRequest&&soundActiveV030()&&state.direction===-1)speakWord();soundPumpV030();});
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
window.kemari.getAudioDiagnostics=()=>({version:'0.33-reversible-voice',voiceMode:voiceModeV033,voiceEngine:voiceModeV033==='native'?'native':'decoded-clips',voiceStatus:soundV030.voiceStatus,lastVoiceText:soundV030.lastVoiceText,lastVoiceError:soundV030.lastVoiceError,decodedVoices:voiceBuffersV032.size,contextState:audio.ctx?.state||'not-created',contexts:soundV030.contextCount,enabled:audio.enabled,
 music:audio.musicVolume,voice:audio.voiceVolume,ducked:audio.ducked,musicTarget:soundV030.mixTarget,successes:soundV030.successes,layer:soundV030.level,
 layerNames:['shō',...(soundV030.level>=1?['plucked strings']:[]),...(soundV030.level>=2?['flute']:[]),...(soundV030.level>=3?['taiko']:[])],
 activeSources:soundV030.active.size,shoVoices:soundV030.sho.length,voiceToken:audio.voiceToken,voiceTimer:!!audio.voiceTimer,
 needsGesture:soundV030.needsGesture,speechBlocked:soundV030.speechBlocked,resumeVisible:!audioResumeV030.hidden,disposed:soundV030.disposed,
 counters:{...soundV030.counters},realDeviceAcceptance:'iPhone/iPad Safari: not yet tested'});
select(0);refreshHud();requestAnimationFrame(frame);`);
 return html.replace('__VOICE_CLIPS_V032__',JSON.stringify(window.FEGVoiceClips||{})).replace('__VOICE_CONFIG_V033__',JSON.stringify(window.FEGVoiceConfig));
};
