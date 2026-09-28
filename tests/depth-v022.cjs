const assert=require('node:assert/strict');
const {g,s,context,elements,spoken}=require('./battle-v016.cjs');
const duel=()=>context.window.kemari.getDuel();
function match(){g.audio.set(false);g.start();g.beginMatch();s.mode='playing';}
function hit(){g.select(0);g.resetFoot();s.target=0;s.hitstop=0;s.pendingMiss=null;g.launchShot('normal',-1,[3.3,1.2,0]);s.flight=s.duration;g.kick();}
function impact(){s.hitstop=0;s.flight=s.duration;g.updateGame(.001);}
match();s.cpuHp=55;hit();impact();assert.equal(s.cpuHp,40);assert.equal(duel().phase,'break');
const hp=s.hp;g.kick();g.updateGame(1);assert.equal(s.hp,hp);assert.equal(s.cpuHp,40);g.updateScene(0);
const camera=duel().camera;g.pause();const frozen=JSON.stringify(duel());g.updateGame(10);g.updateScene(1);assert.equal(JSON.stringify(duel()),frozen,'paused transition is frozen');g.pause();g.updateGame(1.3);assert.equal(duel().phase,'back');
assert.notDeepEqual(duel().camera,[1.25,5.6,17]);const startSpacing=duel().spacing;
hit();impact();assert.equal(s.cpuHp,25);assert.equal(duel().phase,'back');g.updateGame(.1);assert(duel().spacing<startSpacing,'successful return approaches');
const advance=duel().approach;s.pendingDamage=0;s.direction=1;g.cpuReturn();assert.equal(duel().approach,advance,'unsuccessful return does not approach');
s.cpuHp=15;hit();assert.equal(duel().phase,'charge');assert.equal(s.cpuHp,15);g.updateGame(.69);assert.equal(s.cpuHp,15);assert.equal(duel().phase,'charge');g.updateGame(.02);assert.equal(duel().phase,'shot');g.updateGame(.29);assert.equal(s.cpuHp,0);assert.equal(duel().phase,'rush');
const calls=spoken.filter(u=>u.text==='Shobu ari!').length;
g.audio.enabled=true;g.audio.ctx.state='suspended';let cancellations=0;context.window.speechSynthesis.cancel=()=>cancellations++;
const seen=duel().words;assert(seen.length>0);
for(let i=0;i<30;i++){g.kick();g.updateGame(.02);g.updateScene(.02);assert(seen.includes(spoken.at(-1).text));}
assert.equal(duel().taps,30);assert.equal(cancellations,30,'each tap cancels previous speech');assert(duel().projectiles<=16);
assert.equal(spoken.filter(u=>u.text==='Shobu ari!').length,calls,'victory waits until rush ends');
g.pause();const paused=JSON.stringify(duel());g.updateGame(10);g.updateScene(1);assert.equal(JSON.stringify(duel()),paused);g.pause();
g.updateGame(4.39);assert.equal(duel().phase,'rush');g.updateGame(.02);assert.equal(duel().phase,'done');assert.equal(s.mode,'finishing');assert.equal(spoken.at(-1).text,'Shobu ari!');assert.equal(spoken.filter(u=>u.text==='Shobu ari!').length,calls+1);assert(cancellations>30);
g.updateGame(1.3);assert.equal(s.mode,'over');g.kick();assert.equal(duel().taps,30);
g.start();assert.equal(duel().phase,'front');assert.equal(duel().entered,false);assert.equal(duel().spacing,1);assert.equal(duel().taps,0);assert.equal(s.cpuHp,100);assert.equal(elements.get('#kick span').textContent,'返す');
// Reduced motion keeps the transition short and avoids orbit/tumble; restart cancels it.
match();g.setMotion(false);s.cpuHp=55;hit();impact();g.updateGame(.3);g.updateScene(0);assert(Math.abs(duel().camera[0]-Math.sin(.073)*17)<1e-9);g.start();assert.equal(duel().phase,'front');g.updateGame(3);assert.equal(duel().entered,false);g.setMotion(true);
console.log('PASS: half-HP once, contact damage, approach, charge/fast shot, cancel-per-tap rush, bounded projectiles, delayed single victory, pause, restart, reduced motion');
