'use strict';
// Production DOM + campaign integration with native speech mocked.
// This is not browser rendering, audible mixing, or iPhone/iPad acceptance.
const assert=require('node:assert/strict');
const assemble=require('./assemble.cjs');
const {vmFixture}=require('./complete-browser-v030.cjs');
const source=assemble();
function titleFixture(){
 const f=vmFixture(source,{url:'http://feg-qa.test/'}),speech=f.w.speechSynthesis;
 let current=null;speech.cancel=()=>{current=null};speech.speak=u=>{current=u;f.w.__spoken.push(u);u.onstart?.()};
 f.click('#start');assert.equal(f.snapshot().campaign.phase,'title');
 assert.equal(f.w.document.querySelector('#start').disabled,true);
 return {...f,utterance:current};
}
for(const change of ['mute','voice-volume']){
 const f=titleFixture(),u=f.utterance;
 if(change==='mute')f.click('#sound');
 else{const slider=f.w.document.querySelector('#voiceVolume');slider.value='0';slider.dispatchEvent(new f.w.Event('input',{bubbles:true}));}
 assert.equal(f.snapshot().campaign.phase,'dialogue',change+' during title must continue to the Kyoto welcome');
 assert.equal(f.w.document.querySelector('#start').disabled,false);
 u.onstart();u.onend();f.flush(10000);
 assert.equal(f.snapshot().campaign.phase,'dialogue','cancelled title cannot trigger another transition');
 assert.equal(f.w.kemari.getAudioDiagnostics().ducked,false);assert.deepEqual(f.errors,[]);f.close();
}
const restored=titleFixture(),oldTitle=restored.utterance;
const hide=new restored.w.Event('pagehide');Object.defineProperty(hide,'persisted',{value:true});restored.w.dispatchEvent(hide);
restored.w.dispatchEvent(new restored.w.Event('pageshow'));
assert.equal(restored.w.document.querySelector('#start').disabled,false,'BFCache restore offers a fresh START gesture');
oldTitle.onstart();oldTitle.onend();assert.equal(restored.snapshot().campaign.phase,'title','hidden title cannot advance campaign');
restored.click('#start');assert.equal(restored.w.__spoken.length,2,'restored title can be spoken again');
restored.w.__spoken[1].onend();assert.equal(restored.snapshot().campaign.phase,'dialogue');assert.deepEqual(restored.errors,[]);restored.close();
// Exercise the actual recorded-voice lifecycle as well as the presentation mock.
const {Context}=require('./audio-fixture-v032.cjs');
async function settle(){for(let i=0;i<40;i++)await Promise.resolve();}
(async()=>{
 let finishFirst;const first='Yoh, kaette kiharimashita na.';
 const instrumented=source.replace('select(0);refreshHud();requestAnimationFrame(frame);','window.__audio=audio;select(0);refreshHud();requestAnimationFrame(frame);');
 const f=vmFixture(instrumented,{url:'http://feg-qa.test/?intro=1',mockVoice:false,beforeScripts(w){
  w.AudioContext=Context;
  // Resolve the filename from the manifest embedded in the assembled product.
  const data=JSON.parse(source.match(/const voiceClipsV032=(\{[^\n]+\});/)[1]),firstPath=data[first].file;
  w.fetch=url=>url===firstPath?new Promise(resolve=>{finishFirst=()=>resolve({ok:true,arrayBuffer:()=>Promise.resolve(new ArrayBuffer(4))})}):Promise.resolve({ok:true,arrayBuffer:()=>Promise.resolve(new ArrayBuffer(4))});
  for(const name of ['speak','cancel','resume'])w.speechSynthesis[name]=()=>{throw Error('Unexpected OS speech '+name)};
 }});
 assert.equal(f.w.kemari.getAudioDiagnostics().contexts,0);assert.match(f.w.document.querySelector('#dialogueNext').textContent,/台詞を聞く/);
 f.click('#dialogueNext');await settle();assert.equal(f.w.qa.campaign.dialogue,0);assert.equal(f.w.kemari.getAudioDiagnostics().lastVoiceText,first);assert.equal(f.w.kemari.getAudioDiagnostics().voiceStatus,'loading');
 finishFirst();await settle();assert.equal(f.w.kemari.getAudioDiagnostics().voiceStatus,'playing');const stale=f.w.__audio.voiceRequest.u.onend;
 f.click('#dialogueNext');await settle();assert.equal(f.w.qa.campaign.dialogue,1);assert.equal(f.w.kemari.getAudioDiagnostics().voiceStatus,'playing');stale();assert.equal(f.w.kemari.getAudioDiagnostics().voiceStatus,'playing');
 f.click('#dialogueNext');await settle();assert.equal(f.snapshot().campaign.phase,'match');assert.equal(f.w.kemari.getAudioDiagnostics().lastVoiceText,'think');assert.deepEqual(f.errors,[]);f.w.__audio.dispose();f.close();
 console.log(JSON.stringify({passed:true,checks:['mute during title','voice volume during title','BFCache title restart','stale title callbacks','direct intro first gesture plays line one','delayed clip readiness retains first line','real recorded lifecycle with zero native speech','dialogue replacement and practice transition'],verification:'Production DOM + mocked PCM decoding; real listening and devices unverified'}));
})().catch(e=>{console.error(e);process.exitCode=1});
