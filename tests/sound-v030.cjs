// Deterministic WebAudio / WebSpeech lifecycle tests. No audible acceptance claim.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),patchContext={window:{}};vm.createContext(patchContext);vm.runInContext(fs.readFileSync(path.join(root,'patch-sound-v030.js'),'utf8'),patchContext);
const skeleton="<style></style><script>if(key==='voiceVolume')audio.stopVoice();$('#start').addEventListener('click',start);select(0);refreshHud();requestAnimationFrame(frame);</script>";
const patched=patchContext.window.otoPatchSoundV030(skeleton);
const runtime=patched.slice(patched.indexOf('// Audio lifecycle'),patched.indexOf("$('#start').addEventListener('click',start);"));
const diagnostics=patched.slice(patched.indexOf('window.kemari.getAudioDiagnostics='),patched.indexOf('select(0);refreshHud();requestAnimationFrame(frame);'));
class Events{constructor(){this.listeners={};}addEventListener(n,f){(this.listeners[n]??=[]).push(f);}removeEventListener(n,f){this.listeners[n]=(this.listeners[n]||[]).filter(x=>x!==f);}emit(n,e={}){for(const f of this.listeners[n]||[])f(e);}}
class Element extends Events{constructor(){super();this.hidden=false;this.value='';this.attrs={};}setAttribute(k,v){this.attrs[k]=v;}appendChild(){}}
class Param{constructor(){this.value=0;this.calls=[];}setValueAtTime(v,t){this.value=v;this.calls.push(['value',v,t]);}setTargetAtTime(v,t,c){this.value=v;this.calls.push(['target',v,t,c]);}exponentialRampToValueAtTime(v,t){this.value=v;}cancelScheduledValues(){}}
class Node{constructor(ctx,kind){this.ctx=ctx;this.kind=kind;this.gain=new Param();this.frequency=new Param();this.detune=new Param();this.threshold=new Param();this.ratio=new Param();this.connections=[];this.stopped=false;}connect(n){this.connections.push(n);return n;}disconnect(){this.connections=[];}start(){this.started=true;}stop(){this.stopped=true;}setPeriodicWave(w){this.wave=w;}}
class Context extends Events{constructor(){super();this.state='suspended';this.currentTime=0;this.sampleRate=8000;this.destination={};this.created=[];this.resumeCalls=0;}make(k){const n=new Node(this,k);this.created.push(n);return n;}createGain(){return this.make('gain');}createDynamicsCompressor(){return this.make('limiter');}createOscillator(){return this.make('oscillator');}createPeriodicWave(r,i){return {r,i};}createBufferSource(){return this.make('buffer');}createBuffer(channels,n,rate){const a=new Float32Array(n);return {getChannelData(){return a},sampleRate:rate};}resume(){this.resumeCalls++;if(this.blockResume)return Promise.reject(new Error('gesture required'));this.state='running';this.emit('statechange');return Promise.resolve();}suspend(){this.state='suspended';this.emit('statechange');return Promise.resolve();}close(){this.state='closed';return Promise.resolve();}}
function make(saved){
 const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},doc=new Events(),win=new Events(),storage=new Map(),timers=new Map();let serial=0;
 if(saved)storage.set('feg.audio.v1',JSON.stringify(saved));doc.hidden=false;doc.body=new Element();doc.createElement=()=>new Element();
 const speech={queue:[],cancelCount:0,resumeCount:0,cancel(){this.cancelCount++;this.queue=[];},resume(){this.resumeCount++;},speak(u){this.queue.push(u);u.onstart?.();}};
 const c={document:doc,window:win,AudioContext:Context,Float32Array,Math,Promise,Set,Number,JSON,console,
 localStorage:{getItem(k){return storage.get(k)||null},setItem(k,v){storage.set(k,v)}},setTimeout(f){const id=++serial;timers.set(id,f);return id},clearTimeout(id){timers.delete(id)},
 audio:{enabled:false,userChoice:false,musicVolume:.8,voiceVolume:.85,voiceToken:0,ctx:null},state:{mode:'idle',direction:-1,selected:0,rally:0},
 titlePendingV020:false,duelV022:{phase:'front',taps:0},closeV027:{score:0,stage:'idle'},ACTIVE_STAGE:{id:'gion'},canvas:new Element(),
 $:get,refreshHud(){},requestAnimationFrame(){}};
 Object.assign(win,{AudioContext:Context,speechSynthesis:speech,kemari:{}});
 c.start=function(){c.audio.ensure();if(!c.audio.userChoice)c.audio.set(true);c.state.mode='ready';};
 c.beginMatch=function(){c.state.mode='playing';c.state.rally=0;c.audio.hit(false,0,false);};
 c.pause=function(){c.state.mode=c.state.mode==='paused'?'playing':'paused';};
 c.select=function(index){if(c.closeV027.stage==='ask'){c.closeV027.stage='react';if(index===1)c.closeV027.score++;}else c.state.selected=index;};
 c.kick=function(){if(c.state.mode!=='playing')return;if(c.duelV022.phase==='rush')c.duelV022.taps++;else c.audio.hit(true,++c.state.rally,false);};
 c.end=function(){c.state.mode='over';};c.updateGame=function(){};c.speakWord=function(){c.audio.speak({text:'think',lang:'en-US',rate:.82,pitch:1,volume:c.audio.voiceVolume});};
 vm.createContext(c);vm.runInContext(runtime+'\n'+diagnostics,c);return {c,get,storage,timers,speech,stats:()=>c.window.kemari.getAudioDiagnostics()};
}
(async()=>{
 const h=make(),{c}=h,a=c.audio;assert.equal(h.stats().contexts,0,'load never creates an autoplay context');
 c.start();await Promise.resolve();c.updateGame(.1);assert.equal(h.stats().contextState,'running');assert.equal(h.stats().shoVoices,5,'one sustained five-note cluster after gesture');
 for(let i=0;i<90;i++){a.ctx.currentTime+=1;c.updateGame(1);}assert.equal(h.stats().layer,0,'time cannot unlock instruments');assert.equal(h.stats().counters.string,0);assert.equal(h.stats().shoVoices,5,'no duplicate cluster across frames');
 c.beginMatch();for(let i=1;i<=8;i++){a.ctx.currentTime+=.2;c.kick();assert.equal(h.stats().successes,i);assert.equal(h.stats().layer,i>=8?3:i>=5?2:i>=2?1:0);}
 assert(h.stats().counters.string>0&&h.stats().counters.flute>0&&h.stats().counters.taiko>0,'success tiers sound');
 const old=h.stats().successes;a.hit(true,0,false);a.hit(false,20,true);assert.equal(h.stats().successes,old,'miss/CPU event cannot unlock layers');
 c.closeV027.stage='ask';c.select(0);assert.equal(h.stats().successes,old);c.closeV027.stage='ask';c.select(1);assert.equal(h.stats().successes,old+1,'only correct close answer advances audio');
 c.duelV022.phase='rush';c.kick();assert.equal(h.stats().successes,old+2,'rush interaction drives score');c.duelV022.phase='front';
 c.closeV027.stage='idle';c.select(2);assert(h.stats().counters.movement>0,'movement has its own event');
 const voice={name:'Chosen Voice',lang:'en-US'},u={text:'think',voice,lang:'en-US',rate:.82,pitch:1,volume:.85};let done=0;
 a.speak(u,()=>done++);const stale=u.onend;assert.equal(h.stats().musicTarget,.8*.28);assert.equal(u.voice,voice,'selected voice preserved');
 const v={text:'ship'};a.speak(v);assert.equal(h.speech.queue.length,1,'replacement cannot queue speech');stale();assert.equal(a.ducked,true,'stale completion cannot unduck newer voice');assert.equal(done,0);v.onend();assert.equal(a.ducked,false);
 a.speak({text:'vision'});c.pause();assert.equal(h.stats().activeSources,0);assert.equal(h.stats().voiceTimer,false);assert.equal(h.timers.size,0);c.pause();c.updateGame(.1);assert.equal(h.stats().shoVoices,5);assert.equal(h.stats().contexts,1);
 // Native context interruption must expose an explicit recovery control.
 a.ctx.state='interrupted';a.ctx.emit('statechange');assert.equal(h.stats().activeSources,0);assert(h.stats().resumeVisible);a.ctx.blockResume=true;a.resumeFromGesture();await Promise.resolve();await Promise.resolve();assert(h.stats().resumeVisible,'rejected resume remains actionable');
 a.ctx.blockResume=false;a.resumeFromGesture();await Promise.resolve();c.updateGame(.1);assert.equal(h.stats().resumeVisible,false);assert.equal(h.stats().shoVoices,5);assert.equal(h.stats().contexts,1);
 const blocked={text:'word'};a.speak(blocked);blocked.onerror({error:'not-allowed'});assert(h.stats().resumeVisible);a.resumeFromGesture();assert(!h.stats().resumeVisible);
 c.document.hidden=true;c.document.emit('visibilitychange');assert.equal(h.stats().activeSources,0);assert.equal(h.stats().voiceTimer,false);c.document.hidden=false;c.document.emit('visibilitychange');assert(h.stats().needsGesture);a.resumeFromGesture();await Promise.resolve();c.updateGame(.1);assert.equal(h.stats().shoVoices,5);
 for(let i=0;i<300;i++)a.note(440,.1,.05);assert(h.stats().activeSources<=64,'bounded sources under repeated input');assert.equal(h.stats().shoVoices,5);
 a.userChoice=true;a.set(false);assert.equal(h.stats().activeSources,0);c.start();c.beginMatch();c.updateGame(.1);assert.equal(a.enabled,false,'restart preserves explicit mute');assert.equal(h.stats().activeSources,0);
 a.musicVolume=.23;a.voiceVolume=.61;h.get('#musicVolume').emit('input');h.get('#voiceVolume').emit('input');const prefs=JSON.parse(h.storage.get('feg.audio.v1'));assert.deepEqual(prefs,{version:1,enabled:false,music:.23,voice:.61});
 const quiet=make({version:1,enabled:true,music:0,voice:0});quiet.c.start();quiet.c.beginMatch();quiet.c.updateGame(.1);assert.equal(quiet.c.audio.musicVolume,0);assert.equal(quiet.c.audio.voiceVolume,0);assert.equal(quiet.stats().shoVoices,0,'zero music remains silent');quiet.c.audio.dispose();
 const gather=make();gather.c.campaignV030={phase:'gather'};gather.c.audio.set(true);gather.c.state.mode='idle';gather.c.updateGame(.1);assert.equal(gather.stats().shoVoices,5,'GION gather begins with sho even before match');assert.equal(gather.stats().layer,0);gather.c.campaignV030.phase='garden';gather.c.updateGame(.1);assert.equal(gather.stats().shoVoices,0,'return to garden stops sustained music');gather.c.audio.dispose();
 const hiddenTitle=make();hiddenTitle.c.titlePendingV020=true;hiddenTitle.c.document.hidden=true;hiddenTitle.c.document.emit('visibilitychange');assert.equal(hiddenTitle.c.titlePendingV020,false,'interrupted title can be started again');assert.equal(hiddenTitle.get('#start').disabled,false);
 const deniedStorage=make();deniedStorage.c.localStorage.setItem=()=>{throw new Error('denied')};deniedStorage.c.start();assert.equal(deniedStorage.stats().contextState,'running','denied persistence does not prevent audio');deniedStorage.c.audio.dispose();
 const muted=make(prefs);muted.c.start();muted.c.beginMatch();assert.equal(muted.c.audio.enabled,false);assert.equal(muted.c.audio.musicVolume,.23);assert.equal(muted.c.audio.voiceVolume,.61);assert.equal(muted.stats().activeSources,0);
 // The watchdog must remove a stalled native utterance, not only lift ducking.
 const delayed=make();delayed.c.start();let timedDone=0;const delayedWord={text:'FIFTEENTH EVER GARDEN'};
 delayed.c.audio.speak(delayedWord,()=>timedDone++);const timeout=delayed.timers.get(delayed.c.audio.voiceTimer);timeout();
 assert.equal(delayed.speech.queue.length,0,'watchdog cancels native speech before releasing the game');assert.equal(timedDone,1);
 delayedWord.onstart();delayedWord.onend();assert.equal(delayed.stats().ducked,false,'late native callbacks cannot restore stale ducking');assert.equal(timedDone,1);
 delayed.c.audio.dispose();
 // A replaced context starts its clock at zero; old throttles must not suppress cues.
 const reopened=make();reopened.c.start();reopened.c.audio.ctx.currentTime=150;reopened.c.beginMatch();
 for(let i=0;i<8;i++){reopened.c.audio.ctx.currentTime+=.2;reopened.c.kick();}reopened.c.select(2);reopened.c.updateGame(.1);
 const former=reopened.c.audio.ctx,oldCounts=reopened.stats().counters;former.state='closed';former.emit('statechange');reopened.c.audio.resumeFromGesture();await Promise.resolve();
 reopened.c.kick();reopened.c.select(3);reopened.c.updateGame(.1);
 assert.equal(reopened.stats().contexts,2);assert.equal(reopened.stats().counters.hit,oldCounts.hit+1,'replacement context immediately plays hit');
 assert.equal(reopened.stats().counters.movement,oldCounts.movement+1,'replacement context immediately plays movement');
 assert(reopened.stats().counters.string>oldCounts.string,'replacement context immediately plays earned layers');reopened.c.audio.dispose();
 // A promise belonging to a dead context cannot block or poison its replacement.
 const pending=make();pending.c.start();await Promise.resolve();let rejectOld;
 const abandoned=pending.c.audio.ctx;abandoned.resume=()=>new Promise((resolve,reject)=>{rejectOld=reject});
 abandoned.state='interrupted';abandoned.emit('statechange');pending.c.audio.ensure();abandoned.state='closed';abandoned.emit('statechange');
 pending.c.audio.ensure();await Promise.resolve();assert.equal(pending.stats().contexts,2);assert.equal(pending.stats().contextState,'running');
 rejectOld(new Error('old context closed'));await Promise.resolve();await Promise.resolve();
 assert.equal(pending.stats().needsGesture,false,'rejected old resume cannot expose a false recovery prompt');
 assert.equal(abandoned.listeners.statechange.length,0,'replaced context listener removed');pending.c.audio.dispose();
 const interruptedTitle=make();interruptedTitle.c.start();interruptedTitle.c.titlePendingV020=true;interruptedTitle.get('#start').disabled=true;let interruptedDone=0;
 const interruptedWord={text:'FIFTEENTH EVER GARDEN'};interruptedTitle.c.audio.speak(interruptedWord,()=>interruptedDone++);
 interruptedTitle.c.audio.ctx.state='interrupted';interruptedTitle.c.audio.ctx.emit('statechange');
 assert.equal(interruptedTitle.c.titlePendingV020,false);assert.equal(interruptedTitle.get('#start').disabled,false);assert.equal(interruptedTitle.speech.queue.length,0);
 interruptedWord.onstart();interruptedWord.onend();assert.equal(interruptedDone,0,'interrupted title requires another user gesture');assert.equal(interruptedTitle.stats().ducked,false);interruptedTitle.c.audio.dispose();
 a.set(true);c.beginMatch();c.updateGame(.1);assert.equal(h.stats().successes,0,'match resets progression');assert.equal(h.stats().shoVoices,5);a.dispose();await Promise.resolve();assert.equal(h.stats().activeSources,0);assert.equal(h.stats().contextState,'closed');assert.equal(h.stats().voiceTimer,false);c.updateGame(.1);a.resumeFromGesture();assert.equal(h.stats().contexts,1,'disposed engine cannot recreate itself');
 assert.throws(()=>patchContext.window.otoPatchSoundV030('<html></html>'),/anchor/,'missing assembly hooks fail loudly');
 console.log(JSON.stringify({passed:true,checks:['gesture activation','success-driven layers','separate movement/hit events','speech ducking and immediate replacement','watchdog cancels stalled speech','no stale callbacks','pause/resume','interrupted and rejected resume','visibility recovery','closed context recreation and stale resume','interrupted title retry','bounded sources','restart/persistent mute and volumes','dispose'],verification:'VM API mocks only; real iPhone/iPad and audible mix unverified'}));
})().catch(e=>{console.error(e);process.exitCode=1});
