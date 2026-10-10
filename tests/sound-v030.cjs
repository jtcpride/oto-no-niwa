// Deterministic WebAudio fixed-voice lifecycle tests. No audible acceptance claim.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),patchContext={window:{FEGVoiceClips:Object.fromEntries(['think','ship','vision','word','FIFTEENTH EVER GARDEN'].map(text=>[text,{file:text+'.mp3',kind:'word'}]))}};vm.createContext(patchContext);vm.runInContext(fs.readFileSync(path.join(root,'content/voice-config.js'),'utf8'),patchContext);vm.runInContext(fs.readFileSync(path.join(root,'patch-sound-v030.js'),'utf8'),patchContext);
const skeleton="<style></style><script>function speakWord(word=state.word,onDone){return;}\nfunction speakCallV010(text){return;}\nif(key==='voiceVolume')audio.stopVoice();$('#start').addEventListener('click',start);select(0);refreshHud();requestAnimationFrame(frame);</script>";
const patched=patchContext.window.otoPatchSoundV030(skeleton);
const runtime=patched.slice(patched.indexOf('// Audio lifecycle'),patched.indexOf("$('#start').addEventListener('click',start);"));
const diagnostics=patched.slice(patched.indexOf('window.kemari.getAudioDiagnostics='),patched.indexOf('select(0);refreshHud();requestAnimationFrame(frame);'));
const {Events,Element,Context}=require('./audio-fixture-v032.cjs');
function make(saved,options={}){
 const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},doc=new Events(),win=new Events(),storage=new Map(),timers=new Map();let serial=0;
 if(saved)storage.set('feg.audio.v1',JSON.stringify(saved));doc.hidden=false;doc.body=new Element();doc.createElement=()=>new Element();
 const speech={queue:[],cancelCount:0,resumeCount:0,cancel(){this.cancelCount++;this.queue=[];},resume(){this.resumeCount++;},speak(u){this.queue.push(u);u.onstart?.();}};
 const c={document:doc,window:win,AudioContext:Context,Float32Array,Math,Promise,Set,Number,JSON,console,
 localStorage:{getItem(k){return storage.get(k)||null},setItem(k,v){storage.set(k,v)}},setTimeout(f){const id=++serial;timers.set(id,f);return id},clearTimeout(id){timers.delete(id)},
 audio:{enabled:false,userChoice:false,musicVolume:.8,voiceVolume:.85,voiceToken:0,ctx:null},state:{mode:'idle',direction:-1,selected:0,rally:0,misses:0},
 titlePendingV020:false,duelV022:{phase:'front',taps:0},closeV027:{score:0,stage:'idle'},ACTIVE_STAGE:{id:'gion'},canvas:new Element(),
 $:get,refreshHud(){},requestAnimationFrame(){}};
 Object.assign(win,{AudioContext:class extends Context{constructor(){super();this.deferDecode=options.deferDecode;this.failDecode=options.failDecode;}},speechSynthesis:speech,kemari:{}});c.fetch=options.fetch||(()=>Promise.resolve({ok:true,arrayBuffer:()=>Promise.resolve(new ArrayBuffer(4))}));
 c.start=function(){c.audio.ensure();if(!c.audio.userChoice)c.audio.set(true);c.state.mode='ready';};
 c.beginMatch=function(){c.state.mode='playing';c.state.rally=0;c.audio.hit(false,0,false);};
 c.pause=function(){c.state.mode=c.state.mode==='paused'?'playing':'paused';};
 c.select=function(index){if(c.closeV027.stage==='ask'){c.closeV027.stage='react';if(index===1)c.closeV027.score++;}else c.state.selected=index;};
 c.kick=function(){if(c.state.mode!=='playing')return;if(c.duelV022.phase==='rush')c.duelV022.taps++;else c.audio.hit(true,++c.state.rally,false);};
 c.rescue=function(){c.state.misses=(c.state.misses||0)+1;c.audio.hit(true,0,false);};
 c.end=function(){c.state.mode='over';};c.updateGame=function(){};c.speakWord=function(){c.audio.speak({text:'think',kind:'word',lang:'en-US',rate:.82,pitch:1,volume:c.audio.voiceVolume});};
 vm.createContext(c);vm.runInContext(runtime+'\n'+diagnostics,c);return {c,get,storage,timers,speech,stats:()=>c.window.kemari.getAudioDiagnostics()};
}
async function settle(){for(let i=0;i<30;i++)await Promise.resolve();}
(async()=>{
 const h=make(),{c}=h,a=c.audio;assert.equal(h.stats().contexts,0,'load never creates an autoplay context');
 c.start();await settle();c.updateGame(.1);assert.equal(h.stats().contextState,'running');assert.equal(h.stats().shoVoices,5);
 for(let i=0;i<90;i++){a.ctx.currentTime+=1;c.updateGame(1);}assert.equal(h.stats().layer,0,'elapsed time cannot unlock instruments');
 c.beginMatch();for(let i=1;i<=8;i++){a.ctx.currentTime+=.2;c.kick();assert.equal(h.stats().successes,i);assert.equal(h.stats().layer,i>=8?3:i>=5?2:i>=2?1:0);}
 assert.equal(h.stats().scoreSection,'rally');c.updateGame(.1);assert.equal(h.stats().shoVoices,0,'regular rally has no sustained chord');assert(h.stats().counters.string&&h.stats().counters.tsuzumi);assert(h.stats().strikePitch>293.66,'successful returns raise the strike register');
 const old=h.stats().successes;a.hit(true,0,false);a.hit(false,20,true);assert.equal(h.stats().successes,old);
 c.closeV027.stage='ask';c.select(0);assert.equal(h.stats().successes,old);c.closeV027.stage='ask';c.select(1);assert.equal(h.stats().successes,old+1);
 c.duelV022.phase='rush';c.kick();c.updateGame(.1);assert.equal(h.stats().successes,old+2);assert(h.stats().counters.flute&&h.stats().counters.taiko,'Rush keeps its existing earned instrumentation');
 const sho=a.ctx.created.filter(n=>n.wave&&!n.stopped);let done=0;const first={text:'think'};a.speak(first,()=>done++);await settle();
 assert.equal(h.stats().voiceStatus,'playing');assert.equal(h.speech.cancelCount,0);assert.equal(h.speech.queue.length,0,'no OS TTS calls');
 const prior=a.ctx.created.filter(n=>n.kind==='buffer'&&n.started).at(-1),stale=first.onend;
 assert(prior.connections[0].connections.includes(a.voiceBus),'voice reaches shared AudioContext voice bus');
 assert(a.voiceBus.connections.includes(a.master),'voice and music share master output');
 const second={text:'ship'};a.speak(second);assert(prior.stopped,'rush replacement stops previous PCM immediately');await settle();stale();assert.equal(done,0);assert(a.ducked);assert(sho.every(n=>!n.stopped),'speech never restarts BGM');
 for(const [phase,factor] of [['front',1],['rush',1],['close',.58],['break',.5],['charge',.24],['breakCharge',.24],['settle',.24]]){c.duelV022.phase=phase;a.applyMix();assert.equal(h.stats().musicTarget,.82*factor,'speech cannot attenuate '+phase);}
 second.onend();assert(!a.ducked);c.duelV022.phase='rush';
 const repeatA={text:'think'},repeatB={text:'think'};let repeatedDone=0;a.speak(repeatA,()=>repeatedDone++);await settle();const oldRepeat=a.ctx.created.filter(n=>n.kind==='buffer'&&n.started).at(-1);a.speak(repeatB,()=>repeatedDone++);await settle();assert(oldRepeat.stopped);repeatA.onend();assert.equal(repeatedDone,0);repeatB.onend();repeatB.onend();assert.equal(repeatedDone,1,'same-word repeat completes only the newest request');
 const delayed=make(null,{deferDecode:true});delayed.c.start();let titleDone=0;const title={text:'FIFTEENTH EVER GARDEN'};delayed.c.audio.speak(title,()=>titleDone++);await settle();
 assert.equal(delayed.stats().voiceStatus,'loading');assert.equal(titleDone,0,'delayed readiness cannot silently skip title');assert.equal(delayed.stats().ducked,false);
 delayed.c.audio.ctx.decodes[0].resolve({duration:3});await settle();assert.equal(delayed.stats().voiceStatus,'playing');title.onend();assert.equal(titleDone,1);title.onend();assert.equal(titleDone,1,'completion exactly once');delayed.c.audio.dispose();
 const failure=make(null,{failDecode:true});failure.c.start();failure.c.titlePendingV020=true;failure.get('#start').disabled=true;let failedDone=0;failure.c.audio.speak({text:'think'},()=>failedDone++);await settle();assert.equal(failure.stats().voiceStatus,'error');assert(failure.stats().resumeVisible);assert.equal(failure.get('#start').disabled,false,'failed title unlocks START');assert.equal(failedDone,0,'decode failure waits for explicit retry');
 failure.c.audio.ctx.failDecode=false;failure.c.audio.resumeFromGesture();await settle();assert.equal(failure.stats().voiceStatus,'playing');assert(!failure.stats().speechBlocked);failure.c.audio.voiceRequest.u.onend();assert.equal(failedDone,1);failure.c.audio.dispose();
 // A replacement requested while decoding cancels pending old playback as well.
 const pending=make(null,{deferDecode:true});pending.c.start();pending.c.audio.speak({text:'think'});await settle();pending.c.audio.speak({text:'ship'});await settle();
 pending.c.audio.ctx.decodes[0].resolve({duration:1});await settle();assert.equal(pending.stats().counters.speech,0);
 pending.c.audio.ctx.decodes[1].resolve({duration:1});await settle();assert.equal(pending.stats().counters.speech,1);assert.equal(pending.stats().lastVoiceText,'ship');pending.c.audio.dispose();
 const stalled=make();stalled.c.start();let retryDone=0;stalled.c.audio.speak({text:'think'},()=>retryDone++);await settle();const stalledNode=stalled.c.audio.ctx.created.filter(n=>n.kind==='buffer'&&n.started).at(-1),lateStalledEnd=stalledNode.onended;stalled.c.audio.voiceRequest.u.onerror(Error('stalled'));stalled.c.audio.resumeFromGesture();await settle();lateStalledEnd();assert.equal(stalled.stats().voiceStatus,'playing','old PCM callback cannot finish retry');assert.equal(retryDone,0);stalled.c.audio.voiceRequest.u.onend();assert.equal(retryDone,1);stalled.c.audio.dispose();
 const legacyHitSource=fs.readFileSync(path.join(__dirname,'fixtures/baseline-v0291.html'),'utf8').match(/hit\(isPlayer,rally,perfect\)\{([^\n]+)\}/)[1];
 const legacyHit=new Function('isPlayer','rally','perfect',legacyHitSource),kickAudio=make();kickAudio.c.start();kickAudio.c.state.mode='playing';kickAudio.c.duelV022.phase='rush';let actual=[];kickAudio.c.audio.note=(...args)=>{if(args[6]!=='music')actual.push(args)};
 for(const isPlayer of [false,true])for(const rally of [0,3,4,8])for(const perfect of [false,true]){const expected=[];legacyHit.call({note:(...args)=>expected.push(args)},isPlayer,rally,perfect);actual=[];kickAudio.c.audio.ctx.currentTime+=.2;kickAudio.c.audio.hit(isPlayer,rally,perfect);assert.deepEqual(actual,expected);}
 kickAudio.c.audio.dispose();
 // The score repeats real input offsets, never snaps a live hit to the drum.
 const music=make(),m=music.c,ma=m.audio,stats=music.stats; m.start();await settle();m.beginMatch();m.updateGame(0);
 const advance=seconds=>{for(let left=seconds;left>1e-8;left-=Math.min(1/120,left)){const dt=Math.min(1/120,left);ma.ctx.currentTime+=dt;m.updateGame(dt);}};
 advance(.137);m.kick();const one=stats().session.notes[0],firstPitch=stats().strikePitch;
 assert(Math.abs(one.at-.137/.56)<1e-8,'off-grid timing captured unchanged');assert.equal(one.next-one.at,8);
 advance(.271);ma.hit(false,1,false);assert(stats().strikePitch>firstPitch,'CPU joins the same pitch ladder');
 advance(.113);m.kick();assert(stats().session.notes[1].pitch>stats().session.notes[0].pitch);assert.equal(stats().session.layer,1);
 const echoes=stats().counters.echo;advance((one.next-stats().session.position)*.56-.005);assert.equal(stats().counters.echo,echoes,'no early echo');advance(.01);assert.equal(stats().counters.echo,echoes+1,'first echo lands eight beats after its live kick');
 const pos=stats().session.position,noteCount=stats().session.notes.length;m.pause();ma.ctx.currentTime+=20;m.pause();m.updateGame(0);
 assert.equal(stats().session.position,pos,'pause does not advance the loop');assert.equal(stats().session.notes.length,noteCount,'pause preserves the phrase');
 for(let i=0;i<7;i++){advance(.2);m.kick();}assert.equal(stats().session.notes.length,6,'six recent kicks bound the phrase');assert.equal(stats().session.layer,3);
 m.duelV022.phase='back';advance(2);assert(stats().session.bpm>130);assert(stats().counters.shamisen>0);
 const beforeReply=stats().counters.reply;m.speakWord();await settle();ma.voiceRequest.u.onend();advance(.11);assert.equal(stats().counters.reply,beforeReply+1,'natural reading receives one musical reply');
 m.speakWord();await settle();const replaced=ma.voiceRequest.u;m.speakWord();await settle();replaced.onend();advance(.2);assert.equal(stats().counters.reply,beforeReply+1,'cancelled reading cannot answer over the new voice');ma.stopVoice();
 m.rescue('symbol');assert.equal(stats().session.layer,0);assert.equal(stats().session.notes.length,0);assert.equal(stats().session.strikes,0);assert(stats().session.bpm>130,'miss preserves the back-court drum tempo');
 const quiet=stats().counters.shamisen;advance(1);assert.equal(stats().counters.shamisen,quiet,'miss strips earned accompaniment');assert(stats().counters.tsuzumi>0);
 m.kick();assert.equal(stats().session.layer,0);advance(.2);m.kick();assert.equal(stats().session.layer,1,'correct returns rebuild the score');
 const beforeRush={echo:stats().counters.echo,shamisen:stats().counters.shamisen};m.duelV022.phase='rush';advance(2);assert.equal(stats().counters.echo,beforeRush.echo);assert.equal(stats().counters.shamisen,beforeRush.shamisen,'Rush has no new loop layer');
 m.beginMatch();assert.equal(stats().session.notes.length,0);assert.equal(stats().session.streak,0);assert.equal(stats().session.bpm,60/.56);ma.dispose();
 a.speak({text:'vision'});await settle();c.pause();assert.equal(h.stats().activeSources,0);assert.equal(h.stats().voiceTimer,false);c.pause();c.updateGame(.1);assert.equal(h.stats().shoVoices,5);assert.equal(h.stats().contexts,1);
 a.ctx.state='interrupted';a.ctx.emit('statechange');assert.equal(h.stats().activeSources,0);assert(h.stats().resumeVisible);a.ctx.blockResume=true;a.resumeFromGesture();await settle();assert(h.stats().resumeVisible);
 a.ctx.blockResume=false;a.resumeFromGesture();await settle();c.updateGame(.1);assert(!h.stats().resumeVisible);assert.equal(h.stats().shoVoices,5);
 c.document.hidden=true;c.document.emit('visibilitychange');assert.equal(h.stats().activeSources,0);c.document.hidden=false;c.document.emit('visibilitychange');assert(h.stats().needsGesture);a.resumeFromGesture();await settle();c.updateGame(.1);
 for(let i=0;i<300;i++)a.note(440,.1,.05);assert(h.stats().activeSources<=64);assert.equal(h.stats().shoVoices,5);
 a.userChoice=true;a.set(false);c.start();c.beginMatch();c.updateGame(.1);assert.equal(a.enabled,false);assert.equal(h.stats().activeSources,0);
 a.musicVolume=.23;a.voiceVolume=.61;h.get('#musicVolume').emit('input');h.get('#voiceVolume').emit('input');const prefs=JSON.parse(h.storage.get('feg.audio.v1'));assert.deepEqual(prefs,{version:1,enabled:false,music:.23,voice:.61});
 const muted=make(prefs);muted.c.start();muted.c.beginMatch();assert.equal(muted.c.audio.enabled,false);assert.equal(muted.c.audio.musicVolume,.23);muted.c.audio.dispose();
 h.get('#audioBalanceV0375').emit('click');assert.equal(a.enabled,false,'preset preserves mute');assert.equal(a.musicVolume,.82);assert.equal(a.voiceVolume,.72);assert.equal(h.get('#musicVolume').value,'82');assert.equal(h.get('#voiceVolume').value,'72');
 const interrupted=make();interrupted.c.start();interrupted.c.titlePendingV020=true;let interruptedDone=0;interrupted.c.audio.speak({text:'FIFTEENTH EVER GARDEN'},()=>interruptedDone++);await settle();
 const oldTitle=interrupted.c.audio.voiceRequest.u;interrupted.c.audio.ctx.state='interrupted';interrupted.c.audio.ctx.emit('statechange');assert(!interrupted.c.titlePendingV020);oldTitle.onend();assert.equal(interruptedDone,0);interrupted.c.audio.dispose();
 const closed=make();closed.c.start();const oldContext=closed.c.audio.ctx;oldContext.state='closed';oldContext.emit('statechange');closed.c.audio.resumeFromGesture();await settle();assert.equal(closed.stats().contexts,2);assert.equal(oldContext.listeners.statechange.length,0);closed.c.audio.dispose();
 a.set(true);c.beginMatch();c.updateGame(.1);a.dispose();await settle();assert.equal(h.stats().activeSources,0);assert.equal(h.stats().contextState,'closed');a.resumeFromGesture();assert.equal(h.stats().contexts,1);
 console.log(JSON.stringify({passed:true,checks:['single context and shared voice bus','zero OS speech calls','delayed decode/title completion','immediate rush cancellation before and after decode','first-class decode error and explicit retry','steady music across all phases','historical kick regression','success layers','unquantized eight-beat kick loop','shared pitch ladder','bounded fading musical memory','back-court tempo and shamisen','natural completion reply and stale cancellation','miss thins and successes rebuild','Rush accompaniment isolated','pause/mute/restart','context interruption and replacement','visibility recovery','bounded sources','stale callbacks','dispose'],verification:'VM mocked Web Audio; no physical-device listening claim'}));
})().catch(e=>{console.error(e);process.exitCode=1});
