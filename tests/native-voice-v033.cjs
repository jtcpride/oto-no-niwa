'use strict';
// Production dispatchers with deterministic OS speech callbacks; no audible claim.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const assemble=require('./assemble.cjs'),{vmFixture}=require('./complete-browser-v030.cjs'),{Context}=require('./audio-fixture-v032.cjs');
const root=path.resolve(__dirname,'..'),source=assemble();
function instrument(html){return html.replace('select(0);refreshHud();requestAnimationFrame(frame);','window.__audio=audio;select(0);refreshHud();requestAnimationFrame(frame);');}
function fixture({url='http://feg-qa.test/?voice=native',html=source,unavailable=false,noContext=false,delayed=false}={}){
 let nativeCalls=0,fetches=0,current=null;
 const voices=[{name:'Fred',lang:'en-US'},{name:'Samantha',lang:'en-US'},{name:'Kyoko',lang:'ja-JP'}];
 const f=vmFixture(instrument(html),{url,mockVoice:false,beforeScripts(w){
  if(!noContext)w.AudioContext=Context;
  if(unavailable)w.SpeechSynthesisUtterance=undefined;
  w.fetch=()=>{fetches++;return Promise.resolve({ok:true,arrayBuffer:()=>Promise.resolve(new ArrayBuffer(4))});};
  w.speechSynthesis.getVoices=()=>{nativeCalls++;return voices};
  w.speechSynthesis.resume=()=>{nativeCalls++};
  w.speechSynthesis.cancel=()=>{nativeCalls++;const old=current;current=null;old?.onerror?.({error:'canceled'});};
  w.speechSynthesis.speak=u=>{nativeCalls++;current=u;w.__spoken.push(u);if(!delayed)u.onstart?.();};
 }});
 return Object.assign(f,{audio:f.w.__audio,stats:()=>f.w.kemari.getAudioDiagnostics(),nativeCalls:()=>nativeCalls,fetches:()=>fetches,voices});
}
function destroy(f){f.audio.dispose();f.close();}
const title=fixture();
assert.equal(title.stats().voiceMode,'native');assert.equal(title.stats().voiceEngine,'native');
assert.equal(title.fetches(),0,'native never fetches the recorded library');
title.click('#start');assert.equal(title.snapshot().campaign.phase,'title');
const firstTitle=title.w.__spoken.at(-1);
assert.equal(firstTitle.text,'FIFTEENTH EVER GARDEN');assert.equal(firstTitle.voice.name,'Samantha');assert.equal(firstTitle.lang,'en-US');assert.equal(firstTitle.rate,.82);assert.equal(firstTitle.pitch,1);
firstTitle.onend();assert.equal(title.snapshot().campaign.phase,'dialogue');
const firstLine=title.w.__spoken.at(-1);assert.equal(firstLine.text,'Yoh, kaette kiharimashita na.');assert.equal(firstLine.voice.name,'Fred');assert.equal(firstLine.lang,'en-US');assert.equal(firstLine.rate,.72);assert.equal(firstLine.pitch,.82);
firstTitle.onstart();firstTitle.onend();assert.equal(title.w.__spoken.at(-1),firstLine,'stale title events cannot replay dialogue');
title.click('#dialogueNext');const secondLine=title.w.__spoken.at(-1);assert.equal(secondLine.text,'Dorehodo oboete haru ka, misete moraimahyoka.');
firstLine.onend();assert.equal(title.stats().voiceStatus,'playing','replaced dialogue cannot finish newer voice');
title.click('#dialogueNext');assert.equal(title.snapshot().campaign.phase,'match');assert.equal(title.w.__spoken.at(-1).text,'think');
let completed=0;title.audio.speak({text:'think',kind:'word'},()=>completed++);const repeat1=title.w.__spoken.at(-1);
title.audio.speak({text:'think',kind:'word'},()=>completed++);const repeat2=title.w.__spoken.at(-1);
assert.notEqual(repeat1,repeat2,'same word creates a fresh utterance');repeat1.onend();assert.equal(completed,0);repeat2.onend();repeat2.onend();assert.equal(completed,1);
title.audio.speak({text:'ひゃーん',kind:'ending'});const ending=title.w.__spoken.at(-1);assert.equal(ending.lang,'ja-JP');assert.equal(ending.pitch,1.6);assert.equal(ending.rate,1.2);
// Native speech may interrupt Web Audio itself. It must not cancel its own title.
const interrupted=fixture();interrupted.click('#start');const interruptedTitle=interrupted.w.__spoken.at(-1);
interrupted.audio.ctx.state='interrupted';interrupted.audio.ctx.emit('statechange');assert.equal(interrupted.stats().voiceStatus,'playing');interruptedTitle.onend();assert.equal(interrupted.snapshot().campaign.phase,'dialogue');destroy(interrupted);
// URL overrides never become saved preferences. Returning to a bare URL uses config.
assert(![...title.storage.values()].some(value=>/voiceMode|voiceEngine|"engine"/.test(value)));
for(const [url,expected] of [['http://feg-qa.test/','recorded'],['http://feg-qa.test/?voice=recorded','recorded'],['http://feg-qa.test/?voice=unknown','recorded']]){
 const f=fixture({url});assert.equal(f.stats().voiceMode,expected);assert.equal(f.nativeCalls(),0);destroy(f);assert.equal(f.nativeCalls(),0,'recorded dispose also makes zero native calls');
}
const configured=assemble(file=>file==='content/voice-config.js'?"window.FEGVoiceConfig={engine:'native'};":fs.readFileSync(path.join(root,file),'utf8'));
const configNative=fixture({html:configured,url:'http://feg-qa.test/'});assert.equal(configNative.stats().voiceMode,'native');destroy(configNative);
const overrideRecorded=fixture({html:configured,url:'http://feg-qa.test/?voice=recorded'});assert.equal(overrideRecorded.stats().voiceMode,'recorded');assert.equal(overrideRecorded.nativeCalls(),0);destroy(overrideRecorded);
// Direct intro waits for a gesture and speaks the first line before advancing.
const intro=fixture({url:'http://feg-qa.test/?intro=1&voice=native',delayed:true});assert.equal(intro.w.__spoken.length,0);assert.match(intro.w.document.querySelector('#dialogueNext').textContent,/台詞を聞く/);
intro.click('#dialogueNext');assert.equal(intro.w.qa.campaign.dialogue,0);assert.equal(intro.stats().voiceStatus,'loading');const queuedLine=intro.w.__spoken.at(-1);assert.equal(queuedLine.text,firstLine.text);
intro.click('#dialogueNext');const newLine=intro.w.__spoken.at(-1);queuedLine.onstart();queuedLine.onend();assert.equal(intro.stats().voiceStatus,'loading');newLine.onstart();assert.equal(intro.stats().voiceStatus,'playing');destroy(intro);
for(const action of ['mute','volume','timeout','unsupported','exception']){
 const f=fixture({unavailable:action==='unsupported',delayed:action==='timeout'});
 if(action==='exception')f.w.speechSynthesis.speak=()=>{throw Error('native engine failed')};
 f.click('#start');const stale=f.w.__spoken.at(-1);
 if(action==='mute')f.click('#sound');
 if(action==='volume'){const slider=f.w.document.querySelector('#voiceVolume');slider.value='0';slider.dispatchEvent(new f.w.Event('input',{bubbles:true}));}
 if(action==='timeout')f.flush(20000);
 assert.equal(f.w.document.querySelector('#start').disabled,false,action+' cannot trap START');
 if(['timeout','unsupported','exception'].includes(action)){
  assert.equal(f.stats().voiceStatus,'error');assert(f.stats().resumeVisible);assert(f.stats().lastVoiceError);stale?.onend?.();assert.equal(f.snapshot().campaign.phase,'title');
  if(action==='timeout'){f.click('#audioResumeV030');const retry=f.w.__spoken.at(-1);assert.notEqual(retry,stale);retry.onstart();stale.onend();stale.onerror({error:'canceled'});assert.equal(f.snapshot().campaign.phase,'title','old native callbacks cannot finish retry');assert.equal(f.stats().voiceStatus,'playing');retry.onend();assert.equal(f.snapshot().campaign.phase,'dialogue');}
 }else{assert.equal(f.snapshot().campaign.phase,'dialogue');stale.onstart();stale.onend();assert.equal(f.stats().ducked,false);}
 assert.deepEqual(f.errors,[]);destroy(f);
}
// Retry owns one utterance, including when the dialogue retry button is used.
const retryDialogue=fixture({url:'http://feg-qa.test/?intro=1&voice=native'});retryDialogue.click('#dialogueNext');
retryDialogue.w.__spoken.at(-1).onerror({error:'not-allowed'});assert(retryDialogue.stats().resumeVisible);
const beforeRetry=retryDialogue.w.__spoken.length;retryDialogue.click('#audioResumeV030');assert.equal(retryDialogue.w.__spoken.length,beforeRetry+1,'retry must not speak and immediately cancel the same line twice');assert.equal(retryDialogue.w.qa.campaign.dialogue,0);destroy(retryDialogue);
// No AudioContext is required for native speech, but the first gesture still is.
const nativeOnly=fixture({noContext:true,url:'http://feg-qa.test/?intro=1&voice=native'});assert.equal(nativeOnly.w.__spoken.length,0);nativeOnly.click('#dialogueNext');assert.equal(nativeOnly.w.__spoken.at(-1).text,firstLine.text);destroy(nativeOnly);
// Actual lifecycle wrappers cancel before pause/restart/visibility/disposal.
for(const action of ['pause','restart','hide','dispose']){
 const f=fixture();f.click('#start');f.w.__spoken.at(-1).onend();f.click('#dialogueNext');f.click('#dialogueNext');
 let done=0;f.audio.speak({text:'ship',kind:'word'},()=>done++);const old=f.w.__spoken.at(-1);
 if(action==='pause')f.w.qa.pause();
 if(action==='restart')f.w.qa.start();
 if(action==='hide'){Object.defineProperty(f.w.document,'hidden',{value:true,configurable:true});f.w.document.dispatchEvent(new f.w.Event('visibilitychange'));}
 if(action==='dispose')f.audio.dispose();
 old.onstart();old.onend();assert.equal(done,0,action+' invalidates old completion');
 if(action!=='restart'){assert.equal(f.stats().voiceTimer,false);assert.equal(f.stats().voiceStatus,'idle');}
 assert.deepEqual(f.errors,[]);destroy(f);
}
assert.deepEqual(title.errors,[]);destroy(title);
console.log(JSON.stringify({passed:true,checks:['single default + visit-only overrides','zero native calls for recorded mode','native title/call/ending profiles','same-word replacement and stale callbacks','direct-intro first-line gesture','delayed native readiness','native-only without AudioContext','title mute/volume/timeout/unavailable/retry','native-driven AudioContext interruption','pause/restart/hide/dispose'],verification:'Production DOM with mocked native speech; real voice and iOS audio unverified'}));
