// Exercise the assembled game's real rules with rendering/audio replaced by no-op adapters.
const assert=require('node:assert/strict'),vm=require('node:vm'),assemble=require('./assemble.cjs');
function element(){return {style:{},dataset:{},children:[],hidden:false,textContent:'',classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},focus(){},appendChild(n){n.parent=this;this.children.push(n)},prepend(n){n.parent=this;this.children.unshift(n)},remove(){this.parent.children.splice(this.parent.children.indexOf(this),1)},get lastElementChild(){return this.children.at(-1)}};}
const elements=new Map(),symbols=Array.from({length:4},(_,i)=>Object.assign(element(),{dataset:{symbol:String(i)}}));
const document={body:element(),querySelector(s){if(!elements.has(s))elements.set(s,element());return elements.get(s)},querySelectorAll(){return symbols},createElement:element,addEventListener(){}};
const spoken=[],refereeVoice={name:"Alex",lang:"en-US"};
const context={SpeechSynthesisUtterance:class{constructor(text){this.text=text}},document,console,performance:{now:()=>1000},requestAnimationFrame(){},setTimeout(){},clearTimeout(){},window:{speechSynthesis:{cancel(){},resume(){},getVoices(){return [refereeVoice]},speak(u){spoken.push(u)}},matchMedia:()=>({matches:false})}};vm.createContext(context);
let html=assemble().replace('renderer=new G.Renderer(canvas)','renderer={zoom:1,resize(){},render(){window.renderedRotation=window.test?[...window.test.ball.rot]:null},project(){return [200,240]}}');
html=html.replace('select(0);refreshHud();requestAnimationFrame(frame);','window.test={state,ball,audio,end,setMotion,beginTimePass,beginHajime,speakCallV010,start,beginMatch,kick,cpuReturn,updateGame,updateScene,pause,select,resetFoot,launchShot,get ceremony(){return ceremony}};select(0);refreshHud();requestAnimationFrame(frame);');
for(const [,script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(script,context);
const g=context.window.test,s=g.state;
function match(){g.start();g.beginMatch();s.mode='playing';}
function hit(error=0,wrong=false){s.mode='playing';s.direction=-1;s.pendingMiss=null;s.hitstop=0;g.select(0);g.resetFoot();s.target=wrong?1:0;g.launchShot('normal',-1,[3.3,1.2,0]);s.flight=s.duration+error;g.kick();}
function arrive(){s.hitstop=0;s.flight=s.duration;g.updateGame(.001);}
match();hit(.1);assert.equal(s.cpuHp,100);assert.equal(s.pendingDamage,10);arrive();assert.equal(s.cpuHp,90);assert.equal(s.damageDealt,10);g.cpuReturn();assert.equal(s.cpuHp,90,'no duplicate damage');
hit();arrive();assert.equal(s.cpuHp,75,'perfect gives 15');
hit(0,true);arrive();assert.equal(s.cpuHp,75,'wrong symbol gives no damage');assert.equal(s.hp,85);
hit(-.5);s.flight=s.duration;g.updateGame(.001);arrive();assert.equal(s.cpuHp,75,'early miss gives no damage');
s.elapsed=1000;s.rally=100;s.flight=0;s.hitstop=0;g.updateGame(.01);assert.equal(s.mode,'playing','neither time nor rally ends match');
match();for(let i=0;i<6;i++){hit();arrive();}assert.equal(s.cpuHp,10);hit();assert.equal(s.mode,'playing','lethal kick waits for impact');arrive();assert.equal(s.cpuHp,0);assert.equal(s.damageDealt,100);assert.equal(s.mode,'finishing');assert.equal(elements.get('#resultTitle').textContent,'勝利');g.updateGame(1.3);assert.equal(s.mode,'over');
g.start();assert.equal(s.cpuHp,100);assert.equal(s.pendingDamage,0);assert.equal(s.cpuDefeated,false);s.mode='playing';hit();arrive();assert.equal(s.cpuHp,100,'practice does no damage');assert.equal(s.hp,100);
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
s.cpuHp=10;hit();arrive();g.end('win');const calls=spoken.filter(u=>u.text==='Shobu ari!');assert.equal(calls.length,beforeCalls+1,'one victory call');
for(const key of ['voice','lang','rate','pitch','volume'])assert.equal(calls.at(-1)[key],hajime[key]);
match();g.audio.set(false);s.cpuHp=10;hit();arrive();assert.equal(spoken.filter(u=>u.text==='Shobu ari!').length,calls.length,'mute suppresses victory voice');
console.log('PASS: distance-driven roll, render order, stationary/pause/reduced motion, bow transition, same referee voice, single call, mute');
