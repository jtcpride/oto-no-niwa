const assert=require('node:assert/strict');
process.env.FEG_TEST_STAGE='first-court';
const {g,s,context,elements,spoken}=require('./battle-v016.cjs');
const d=g.duelV022,f=g.feelV023;
function match(){g.audio.set(false);g.start();g.beginMatch();s.mode='playing';}
function hit(){g.select(0);g.resetFoot();s.target=0;s.pendingMiss=null;s.hitstop=0;g.launchShot('normal',-1,[3.3,1.2,0]);s.flight=s.duration;g.kick();}
function impact(){s.hitstop=0;s.flight=s.duration;g.updateGame(.001);}
function frozen(){return JSON.stringify({d,f,hp:s.hp,cpu:s.cpuHp,flight:s.flight,body:g.player.body.pos});}
function pauseCheck(){g.updateScene(0);g.pause();const a=frozen();g.updateGame(2);g.kick();g.updateScene(0);assert.equal(frozen(),a);g.pause();}
match();hit();impact();assert.equal(s.cpuHp,85);assert.equal(d.phase,'impact');const word=s.word;pauseCheck();g.updateGame(.23);assert.equal(s.word,word);g.updateGame(.02);assert.equal(d.phase,'front');assert(s.duration>=2.28);assert.equal(s.flight,0,'impact dwell is outside the next answer window');
s.cpuHp=55;hit();impact();assert.equal(d.phase,'break');pauseCheck();g.updateGame(2.4);assert.equal(d.phase,'break');g.updateGame(.26);assert.equal(d.phase,'back');
const spacing=d.spacing;hit();impact();g.updateGame(.25);g.updateGame(.4);assert(d.approach>0);assert(d.spacing<spacing);const approach=d.approach;
s.pendingDamage=0;s.direction=1;g.cpuReturn();assert.equal(d.approach,approach,'miss adds no pressure');
s.cpuHp=15;hit();assert.equal(d.phase,'charge');
g.audio.applyMix();assert(Math.abs(g.audio.musicBus.gain.value-g.audio.musicVolume*.18)<1e-9,'charge music recedes without changing user volume');
// Temporary visual transforms restore exactly, including nested charge poses.
g.updateScene(0);const body=JSON.stringify(g.player.body.pos);for(let i=0;i<100;i++)g.updateScene(0);assert.equal(JSON.stringify(g.player.body.pos),body);pauseCheck();
g.updateGame(.71);assert.equal(d.phase,'shot');g.updateGame(.29);assert.equal(d.phase,'rush');g.kick();assert.equal(d.taps,0,'earned rush has an impact beat before controls open');g.updateGame(.36);
g.audio.enabled=true;g.audio.ctx.state='suspended';let cancelled=0;context.window.speechSynthesis.cancel=()=>cancelled++;
f.recent=['think','fish','vision'];g.kick();assert.equal(spoken.at(-1).text,'vision','most recent first');assert(Math.abs(g.audio.musicBus.gain.value-g.audio.musicVolume*.6*.4)<1e-9,'rush protects speech in music bus');
for(let i=0;i<20;i++){g.kick();g.updateGame(.02);g.updateScene(.02);}
assert.equal(d.taps,21);assert.equal(cancelled,21,'every tap cancels the previous word');assert.equal(f.word,'think');
spoken.at(-1).onend();g.updateGame(.26);g.kick();assert.equal(spoken.at(-1).text,'vision');assert.equal(cancelled,22);pauseCheck();
// No onend: the next tap still replaces the utterance, with no speech queue.
const beforeFallback=cancelled;g.updateGame(1.26);g.kick();assert.equal(spoken.at(-1).text,'fish');assert.equal(cancelled,beforeFallback+1);
g.updateGame(5.35-d.time+.001);assert.equal(d.phase,'settle');const taps=d.taps;g.kick();assert.equal(d.taps,taps);pauseCheck();g.updateGame(.86);assert.equal(s.mode,'finishing');assert.equal(spoken.at(-1).text,'Shobu ari!');g.updateGame(1.3);assert.equal(s.mode,'over');
g.start();assert.equal(d.phase,'front');assert.equal(f.recent.length,0);assert.equal(f.word,'');
match();g.setMotion(false);s.cpuHp=55;hit();impact();g.updateGame(.61);assert.equal(d.phase,'back');g.updateScene(0);assert.equal(context.window.kemari.getDuel().camera[0],Math.sin(.073)*17);g.setMotion(true);
console.log('PASS first-court: impact dwell, protected answer time, success pressure, reversible poses, latest words, cancel-on-tap speech, pause/restart/reduced motion, rush landing and victory');
