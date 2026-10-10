'use strict';
// Production rescue/close/impact routing with a deterministic audio clock.
// Signal, audible balance and devices are separate browser/device checks.
const assert=require('node:assert/strict'),assemble=require('./assemble.cjs');
const {vmFixture}=require('./complete-browser-v030.cjs'),{Context}=require('./audio-fixture-v032.cjs');
const anchor='select(0);refreshHud();requestAnimationFrame(frame);';
const source=assemble().replace(anchor,`window.sessionQA={audio,session:sessionV0377,sound:soundV030,
 setup(){campaignV030.phase='match';audio.userChoice=true;audio.set(true);state.mode='over';start();beginMatch();state.mode='playing';soundPumpV030();},
 rescue(){rescue('symbol')},practice(){ceremony='practice'},impact(){duelV022.phase='impact';duelV022.time=0;feelV023.resumePhase='back'}
};`+anchor);
const f=vmFixture(source,{beforeScripts:w=>{w.AudioContext=Context}}),q=f.w.qa,m=f.w.sessionQA;
function advance(seconds){for(let left=seconds;left>1e-8;){const dt=Math.min(1/120,left);m.audio.ctx.currentTime+=dt;q.tick(dt);left-=dt;}}
function build(){m.setup();for(let i=0;i<8;i++){m.audio.ctx.currentTime+=.2;m.audio.hit(true,i+1,false)}assert.equal(m.session.level,3);assert.equal(m.session.notes.length,6);}
try{
 build();m.practice();const misses=q.state.misses;m.rescue();assert.equal(q.state.misses,misses,'PRACTICE preserves its no-damage rule');assert.equal(m.session.level,0);assert.equal(m.session.notes.length,0,'practice rescue still thins music');
 build();q.state.hp=1;m.rescue();assert.equal(q.state.mode,'over');assert.equal(m.session.level,0);assert.equal(m.session.notes.length,0,'lethal rescue clears the phrase');
 build();q.duel.phase='close';Object.assign(q.close,{stage:'ask',time:3.19,turn:0,target:0,score:0});advance(.03);assert.equal(q.close.stage,'react');assert.equal(q.close.correct,false);assert.equal(m.session.level,0);assert.equal(m.session.notes.length,0,'close timeout thins without a select event');
 build();q.duel.phase='back';m.session.beatSeconds=.44;m.session.position=.9;m.session.nextBeat=1;m.session.lastTime=m.audio.ctx.currentTime;m.session.phase='back';
 const drum=m.sound.counters.tsuzumi;m.impact();advance(.23);assert.equal(q.duel.phase,'impact');assert.equal(m.session.beatSeconds,.44,'impact holds the back-court tempo');assert(m.session.position>1.4);assert(m.sound.counters.tsuzumi>drum,'drum continues through impact');
 assert.deepEqual(f.errors,[]);console.log(JSON.stringify({passed:true,checks:['practice rescue without miss counter','lethal rescue','close timeout without select','back-court impact preserves musical pulse'],verification:'Production VM routing, mocked audio; no audible/device claim'}));
}finally{m.audio.dispose();f.close()}
