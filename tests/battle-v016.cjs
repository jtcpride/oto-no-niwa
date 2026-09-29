// Exercise the assembled game's real rules with rendering/audio replaced by no-op adapters.
const assert=require('node:assert/strict'),vm=require('node:vm'),assemble=require('./assemble.cjs');
function element(){return {style:{},dataset:{},children:[],hidden:false,textContent:'',classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},focus(){},appendChild(n){n.parent=this;this.children.push(n)},prepend(n){n.parent=this;this.children.unshift(n)},remove(){this.parent.children.splice(this.parent.children.indexOf(this),1)},get lastElementChild(){return this.children.at(-1)}};}
const elements=new Map(),symbols=Array.from({length:4},(_,i)=>Object.assign(element(),{dataset:{symbol:String(i)}}));
const document={body:element(),querySelector(s){if(!elements.has(s))elements.set(s,element());return elements.get(s)},querySelectorAll(){return symbols},createElement:element,addEventListener(){}};
const spoken=[],refereeVoice={name:"Alex",lang:"en-US"};
const context={URL,URLSearchParams,SpeechSynthesisUtterance:class{constructor(text){this.text=text}},document,console,performance:{now:()=>1000},requestAnimationFrame(){},setTimeout(fn,ms){if(ms===500)fn();},clearTimeout(){},window:{location:{href:'http://kemari.test/?stage='+(process.env.FEG_TEST_STAGE||'first-court'),search:'?stage='+(process.env.FEG_TEST_STAGE||'first-court')},speechSynthesis:{cancel(){},resume(){},getVoices(){return [refereeVoice]},speak(u){spoken.push(u)}},matchMedia:()=>({matches:false})}};vm.createContext(context);
let html=assemble().replace('renderer=new G.Renderer(canvas)','renderer={zoom:1,resize(){},render(){window.renderedRotation=window.test?[...window.test.ball.rot]:null},project(){return [200,240]}}');
html=html.replace('select(0);refreshHud();requestAnimationFrame(frame);','window.test={state,ball,audio,player,cpu,duelV022,feelV023,newQuestion,chooseWord,showAnswerCardV010,queueRetryV010,PRACTICE_SET,SOUNDS,WORD_IPA_V010,ACTIVE_STAGE,ACTIVE_DECK,PLAYER_CHARACTER,CPU_CHARACTER,end,setMotion,beginTimePass,beginHajime,speakCallV010,start,beginMatch,kick,cpuReturn,updateGame,updateScene,pause,select,resetFoot,launchShot,get ceremony(){return ceremony}};select(0);refreshHud();requestAnimationFrame(frame);');
for(const [,script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(script,context);
const g=context.window.test,s=g.state;
function match(){g.start();g.beginMatch();s.mode='playing';}
function hit(error=0,wrong=false){if(g.duelV022.phase==='impact')g.updateGame(.25);if(g.duelV022.phase==='break')g.updateGame(2.66);s.mode='playing';s.direction=-1;s.pendingMiss=null;s.hitstop=0;g.select(0);g.resetFoot();s.target=wrong?1:0;g.launchShot('normal',-1,[3.3,1.2,0]);s.flight=s.duration+error;g.kick();}
function finishRush(){g.updateGame(5.36);if(g.duelV022.phase==='settle')g.updateGame(.86);}
function arrive(){if(g.duelV022.phase==='charge'){g.updateGame(.71);assert.equal(g.duelV022.phase,'shot');g.updateGame(.29);return;}s.hitstop=0;s.flight=s.duration;g.updateGame(.001);}
match();hit(.1);assert.equal(s.cpuHp,100);assert.equal(s.pendingDamage,10);arrive();assert.equal(s.cpuHp,90);assert.equal(s.damageDealt,10);g.cpuReturn();assert.equal(s.cpuHp,90,'no duplicate damage');
hit();arrive();assert.equal(s.cpuHp,75,'perfect gives 15');
hit(0,true);arrive();assert.equal(s.cpuHp,75,'wrong symbol gives no damage');assert.equal(s.hp,85);
hit(-.5);s.flight=s.duration;g.updateGame(.001);arrive();assert.equal(s.cpuHp,75,'early miss gives no damage');
s.elapsed=1000;s.rally=100;s.flight=0;s.hitstop=0;g.updateGame(.01);assert.equal(s.mode,'playing','neither time nor rally ends match');
match();for(let i=0;i<6;i++){hit();arrive();}assert.equal(s.cpuHp,10);hit();assert.equal(s.mode,'playing','lethal kick waits for impact');assert.equal(g.duelV022.phase,'charge');g.pause();const chargeFrozen=[g.duelV022.phase,g.duelV022.time,s.cpuHp,s.flight,s.pendingDamage];g.updateGame(5);g.kick();assert.deepEqual([g.duelV022.phase,g.duelV022.time,s.cpuHp,s.flight,s.pendingDamage],chargeFrozen,'pause freezes charge');g.pause();arrive();assert.equal(s.cpuHp,0);assert.equal(s.damageDealt,100);assert.equal(g.duelV022.phase,'rush');assert.equal(s.mode,'playing','rush precedes victory');assert.equal(s.victoryAnnounced,false);assert.equal(g.duelV022.rushRemaining,5);g.pause();const rushFrozen=[g.duelV022.time,g.duelV022.rushRemaining,g.duelV022.taps,s.damageDealt];g.updateGame(8);g.kick();assert.deepEqual([g.duelV022.time,g.duelV022.rushRemaining,g.duelV022.taps,s.damageDealt],rushFrozen,'pause freezes rush and rejects taps');g.pause();g.cpuReturn();assert.equal(s.damageDealt,100,'rush does not duplicate lethal damage');finishRush();assert.equal(g.duelV022.phase,'done');assert.equal(s.mode,'finishing');assert.equal(elements.get('#resultTitle').textContent,'勝利');g.updateGame(1.3);assert.equal(s.mode,'over');
g.start();assert.equal(s.cpuHp,100);assert.equal(s.pendingDamage,0);assert.equal(s.cpuDefeated,false);assert.equal(g.duelV022.phase,'front');assert.equal(g.duelV022.entered,false);assert.equal(g.duelV022.taps,0);s.mode='playing';hit();arrive();assert.equal(s.cpuHp,100,'practice does no damage');assert.equal(s.hp,100);
match();for(let i=0;i<7;i++){hit(0,true);if(s.mode==='playing')arrive();}assert.equal(s.hp,0);assert.equal(s.mode,'over');assert.equal(elements.get('#resultTitle').textContent,'敗北');
match();hit();g.pause();const frozen=[s.cpuHp,s.flight,s.pendingDamage];g.updateGame(5);assert.deepEqual([s.cpuHp,s.flight,s.pendingDamage],frozen);g.pause();arrive();assert.equal(s.cpuHp,85);
g.start();g.updateScene(0);assert.equal(s.cpuHp,100);assert.equal(s.damageDealt,0);
console.log('PASS: impact damage, perfect bonus, misses, no time/rally ending, KO, loss, practice, pause, restart');

// Floor rolling must follow distance, be visible in the current render, and freeze on pause.
g.start();s.mode='playing';g.beginTimePass();s.flight=s.duration;g.updateScene(0);const base=[...g.ball.rot];
for(const post of [.1,.4,.8,1.2,1.8,2.2]){s.flight=s.duration+post;g.updateScene(.016);const distance=-3.3-g.ball.pos[0];assert(Math.abs(g.ball.rot[2]-base[2]-distance/.245)<1e-9,'distance drives rolling');assert.deepEqual(Array.from(context.window.renderedRotation),Array.from(g.ball.rot),'rotation applied before drawing');assert(g.ball.pos[1]>=.245,'ball clears floor');}
const stopped=JSON.stringify(g.ball.rot);g.updateScene(.5);assert.equal(JSON.stringify(g.ball.rot),stopped,'no travel means no rotation');g.pause();g.updateGame(.2);g.updateScene(.2);assert.equal(JSON.stringify(g.ball.rot),stopped,'pause freezes roll');g.pause();
g.setMotion(false);s.flight+=.1;g.updateScene(.1);assert.equal(JSON.stringify(g.ball.rot),stopped,'reduced motion is respected');g.setMotion(true);
g.updateGame(.3);assert.equal(g.ceremony,'choice','rolling still reaches bow choice');
// Match-end call uses exactly the same voice, language, rate, pitch and volume as HAJIME.
match();g.audio.enabled=true;g.beginHajime();const hajime=spoken.findLast(u=>u.text==='Hajime!');assert(hajime);match();g.audio.enabled=true;
const beforeCalls=spoken.filter(u=>u.text==='Shobu ari!').length;
s.cpuHp=10;hit();arrive();assert.equal(g.duelV022.phase,'rush');assert.equal(spoken.filter(u=>u.text==='Shobu ari!').length,beforeCalls,'no victory call before rush ends');finishRush();g.end('win');const calls=spoken.filter(u=>u.text==='Shobu ari!');assert.equal(calls.length,beforeCalls+1,'one victory call');
for(const key of ['voice','lang','rate','pitch','volume'])assert.equal(calls.at(-1)[key],hajime[key]);
match();g.audio.set(false);s.cpuHp=10;hit();arrive();finishRush();assert.equal(spoken.filter(u=>u.text==='Shobu ari!').length,calls.length,'mute suppresses victory voice');
console.log('PASS: distance-driven roll, render order, stationary/pause/reduced motion, bow transition, same referee voice, single call, mute');

// Shared mobile mix: check actual bus targets, voice callbacks, stale events and mute.
const a=g.audio;
assert.equal(a.musicVolume,.8);assert.equal(a.voiceVolume,.85);
const gain=()=>({value:1,setTargetAtTime(v){this.value=v}});
context.window.AudioContext=class{
 constructor(){this.currentTime=0;this.destination={};this.state='running'}
 createGain(){return {gain:gain(),connect(){}}}
 createDynamicsCompressor(){return {connect(){}}}
 resume(){return Promise.resolve()}
};
a.set(true);assert.equal(a.master.gain.value,.32);assert.equal(a.musicBus.gain.value,.8);assert.equal(a.fxBus.gain.value,.8);
a.speak({text:'first'});const first=spoken.at(-1);
assert.equal(a.musicBus.gain.value,.48);assert.equal(a.fxBus.gain.value,.8,'voice must not suppress kick cues');
a.speak({text:'second'});first.onend();assert.equal(a.ducked,true,'old voice must not release current voice');spoken.at(-1).onerror();assert.equal(a.musicBus.gain.value,.8,'error restores music');
a.speak({text:'third'});spoken.at(-1).onend();assert.equal(a.musicBus.gain.value,.8,'end restores music');
a.musicVolume=0;a.applyMix();a.speak({text:'fourth'});assert.equal(a.musicBus.gain.value,0,'ducking respects music slider zero');
a.set(false);assert.equal(a.master.gain.value,0);assert.equal(a.ducked,false);const count=spoken.length;a.speak({text:'muted'});assert.equal(spoken.length,count);
a.set(true);assert.equal(a.master.gain.value,.32,'re-enable retains new game gain');a.voiceVolume=0;a.speak({text:'silent voice'});assert.equal(spoken.length,count);
console.log('PASS: mobile defaults, bus gains, audible kick during speech, stale/end/error callbacks, zero sliders, mute/re-enable');


// Title speech must finish before practice, and use the same voice as the first word.
const titleVoice={name:'Samantha',lang:'en-US'};
context.window.speechSynthesis.getVoices=()=>[refereeVoice,titleVoice];
a.voiceVolume=.85;a.musicVolume=.8;a.userChoice=false;s.mode='idle';
g.start();const title=spoken.at(-1);
assert.equal(title.text,'FIFTEENTH EVER GARDEN');assert.equal(title.voice,titleVoice);
assert.equal(s.mode,'idle','keep title screen while speaking');assert.equal(elements.get('#start').disabled,true);
const titleCount=spoken.length;g.start();assert.equal(spoken.length,titleCount,'ignore repeated start while title is speaking');
let practiceStart;context.setTimeout=(fn,ms)=>{if(ms===500)practiceStart=fn};
title.onend();assert.equal(s.mode,'idle');assert.equal(elements.get('#intro').hidden,true);assert.equal(spoken.length,titleCount,'no practice word during the 500ms gap');assert(practiceStart);g.start();assert.equal(spoken.length,titleCount);title.onend();practiceStart();context.setTimeout=(fn,ms)=>{if(ms===500)fn();};assert.equal(s.mode,'ready');assert.equal(elements.get('#start').disabled,false);
const firstWord=spoken.at(-1);assert.notEqual(firstWord.text,title.text);
for(const key of ['voice','lang','rate','pitch','volume'])assert.equal(title[key],firstWord[key]);
const afterTitle=spoken.length;title.onend();assert.equal(spoken.length,afterTitle,'late title end cannot restart play');
a.stopVoice();s.mode='idle';g.start();spoken.at(-1).onerror();assert.equal(s.mode,'ready','speech error cannot block start');
a.stopVoice();s.mode='idle';a.userChoice=true;a.set(false);const beforeSilent=spoken.length;g.start();assert.equal(s.mode,'ready');assert.equal(spoken.length,beforeSilent,'mute skips title and word');
a.set(true);a.voiceVolume=0;s.mode='idle';g.start();assert.equal(s.mode,'ready','zero voice skips wait');
a.voiceVolume=.85;s.mode='idle';let watchdog;context.setTimeout=(fn,ms)=>{if(ms===8000)watchdog=fn;else if(ms===500)fn()};g.start();assert.equal(s.mode,'idle');assert(watchdog);watchdog();assert.equal(s.mode,'ready','missing speech callbacks cannot strand title');
console.log('PASS: title/word voice equality, completion before play, double start, stale end, error, mute, zero voice, watchdog');

module.exports={g,s,elements,spoken,context};
