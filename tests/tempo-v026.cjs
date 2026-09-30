const assert=require('node:assert/strict');
const {g,s,context,elements}=require('./battle-v016.cjs');
const read=code=>Function('CONFIG','foot','sampleBall','return '+code)(g.CONFIG,g.foot,g.sampleBall);
function setup(x=0){g.audio.set(false);s.mode='over';g.start();g.beginMatch();s.mode='playing';g.select(0);g.resetFoot();g.duelV022.phase='back';g.duelV022.entered=true;g.strideV024.player.x=x;g.strideV024.cpu.x=-x;g.launchShot('normal',-1,[3.3,1.2,0]);s.hitstop=0;}
const records=[];
for(const x of [-1.2,0,1.2,2.4]){setup(x);const duration=s.duration,window=read('CONFIG.hitWindow'),distance=read('7.08-foot.x')-2*x;records.push({x,duration,window,speed:distance/duration});g.updateScene(0);const end=parseFloat(elements.get('.hit-window').style.left)+parseFloat(elements.get('.hit-window').style.width);assert(end<=100);g.pause();g.updateGame(5);assert.equal(s.duration,duration);assert.equal(read('CONFIG.hitWindow'),window);g.pause();}
for(let i=1;i<records.length;i++){assert(records[i].duration<=records[i-1].duration);assert(records[i].window>=records[i-1].window);}
assert(records[1].duration>2.45,'back court has extra hearing time');assert.equal(records.at(-1).duration,1.85);assert(Math.abs(records.at(-1).window-.34)<1e-9);
for(const error of [-.33,.33]){setup(2.4);s.target=s.selected;s.flight=s.duration+error;const rally=s.rally;g.kick();assert.equal(s.rally,rally+1,'expanded OK accepts '+error);assert.equal(s.perfect,0,'expanded OK is not perfect');}
setup(2.4);s.target=1;s.selected=0;s.flight=s.duration;g.kick();assert.equal(s.hp,85,'IPA still required');
setup(2.4);s.flight=s.duration+.341;g.updateGame(.001);assert.equal(s.hp,85,'late outside window misses');
setup(2.4);s.flight=s.duration-.341;g.kick();assert.equal(s.pendingMiss,'early');
setup(2.4);const a=read('sampleBall(1.10)[0]'),b=read('sampleBall(1.17)[0]');assert(b<a,'late ball keeps moving');
g.start();assert.equal(read('CONFIG.hitWindow'),.36,'practice resets');g.beginMatch();assert.equal(read('CONFIG.hitWindow'),.18,'front resets');assert.equal(s.duration,2.45);
console.log('PASS tempo: distance/speed, minimum flight, wider OK boundaries, IPA, perfect, pause/reset and timing bar',JSON.stringify(records));
