const assert=require('node:assert/strict');
process.env.FEG_TEST_STAGE='first-court';
const {g,s,context}=require('./battle-v016.cjs');
const d=g.duelV022,a=g.strideV024;
function match(){g.audio.set(false);g.start();g.beginMatch();s.mode='playing';}
function hit(wrong=false){g.select(0);g.resetFoot();s.target=wrong?1:0;s.pendingMiss=null;s.hitstop=0;if(d.phase==='front')g.launchShot('normal',-1,[3.3,1.2,0]);else{s.direction=-1;s.flightStart=[3.3,1.2,0];s.shot='normal';}s.flight=s.duration;g.kick();}
function impact(){s.hitstop=0;s.flight=s.duration;g.updateGame(.001);}
match();s.cpuHp=55;hit();impact();g.updateGame(3.41);
assert.equal(d.phase,'back');assert.equal(a.player.x,-1.2);assert.equal(a.cpu.x,1.2);assert(d.spacing>1.12,'back court begins wider than v023');
const duration=s.duration,launchPoint=JSON.stringify(g.depthPointV022([3.3,1.2,0]));
g.updateGame(.41);assert.equal(a.cpu.x,1.2,'kick precedes the step');assert.equal(a.player.x,-1.2);
g.updateGame(.48);assert.equal(a.cpu.x,0);assert.equal(a.player.x,-1.2,'opponent kick moves only opponent');assert.equal(s.duration,duration);assert.equal(JSON.stringify(g.depthPointV022([3.3,1.2,0])),launchPoint,'step cannot drag airborne launch point');
hit();const playerLaunch=JSON.stringify(g.depthPointV022(s.flightStart)),cpuX=a.cpu.x;
g.updateGame(.41);assert.equal(a.player.x,-1.2);g.updateGame(.48);assert.equal(a.player.x,0);assert.equal(a.cpu.x,cpuX,'player kick moves only player');assert.equal(JSON.stringify(g.depthPointV022(s.flightStart)),playerLaunch);
// The next incoming shot picks up the new contact locations rather than old offsets.
impact();g.updateGame(.25);assert.deepEqual(Array.from(a.flight),[0,0]);
g.updateGame(.7);g.pause();const frozen=JSON.stringify(context.window.kemari.getSteps());g.updateGame(5);g.updateScene(1);assert.equal(JSON.stringify(context.window.kemari.getSteps()),frozen);g.pause();g.updateGame(.3);
const before=a.player.x;hit(true);g.updateGame(.9);assert.equal(a.player.x,before,'body-return miss does not become an advancing kick');
// Final wind-up must finish before taking the last forward step.
s.cpuHp=10;hit();assert.equal(d.phase,'charge');const chargeX=a.player.x;g.updateGame(.69);assert.equal(a.player.x,chargeX);g.updateGame(.02);assert.equal(d.phase,'shot');assert.equal(a.player.age,0);g.updateGame(.29);assert.equal(d.phase,'rush');
g.updateGame(.6);assert(a.player.x>chargeX);assert(a.player.x<=2.4&&a.cpu.x>=-2.4,'finite minimum gap');
g.start();assert.equal(a.player.x,0);assert.equal(a.cpu.x,0);assert.equal(a.player.attack,99);assert.equal(a.pending,false);
console.log('PASS: wider reset, actor-specific post-kick steps, fixed airborne origins, new receive points, pause, no step on miss, final charge ordering, caps and restart');
