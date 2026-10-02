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
console.log(JSON.stringify({passed:true,checks:['mute during title','voice volume during title','BFCache title restart','stale title callbacks'],verification:'Production DOM with mocked native speech; real listening and devices unverified'}));
