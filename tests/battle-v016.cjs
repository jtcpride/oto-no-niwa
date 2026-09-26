// Exercise the assembled game's real rules with rendering/audio replaced by no-op adapters.
const assert=require('node:assert/strict'),vm=require('node:vm'),assemble=require('./assemble.cjs');
function element(){return {style:{},dataset:{},children:[],hidden:false,textContent:'',classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},focus(){},appendChild(n){n.parent=this;this.children.push(n)},prepend(n){n.parent=this;this.children.unshift(n)},remove(){this.parent.children.splice(this.parent.children.indexOf(this),1)},get lastElementChild(){return this.children.at(-1)}};}
const elements=new Map(),symbols=Array.from({length:4},(_,i)=>Object.assign(element(),{dataset:{symbol:String(i)}}));
const document={body:element(),querySelector(s){if(!elements.has(s))elements.set(s,element());return elements.get(s)},querySelectorAll(){return symbols},createElement:element,addEventListener(){}};
const context={document,console,performance:{now:()=>1000},requestAnimationFrame(){},setTimeout(){},clearTimeout(){},window:{matchMedia:()=>({matches:false})}};vm.createContext(context);
let html=assemble().replace('renderer=new G.Renderer(canvas)','renderer={zoom:1,resize(){},render(){},project(){return [200,240]}}');
html=html.replace('select(0);refreshHud();requestAnimationFrame(frame);','window.test={state,start,beginMatch,kick,cpuReturn,updateGame,updateScene,pause,select,resetFoot,launchShot,get ceremony(){return ceremony}};select(0);refreshHud();requestAnimationFrame(frame);');
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
