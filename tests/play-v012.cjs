// Run with NODE_PATH pointing to Playwright, or a local playwright installation.
// Test-only control seam is injected into assembled HTML; no autoplay ships in the game.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const assemble=require('./assemble.cjs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;window.__spoken=[];Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},resume(){},getVoices(){return []},speak(u){window.__spoken.push(u);u.onstart?.();}}});});
 let html=assemble().replace('select(0);refreshHud();requestAnimationFrame(frame);',`window.testGame={state,audio,player,cpu,ball,start,select,kick,pause,speakWord,speakCallV010,launchShot,sampleBall,updateScene,updateGame,resetFoot,beginMatch,beginTimePass,bowV09,
 tick(dt){visualTime+=dt;updateGame(dt);updateScene(dt);},get ceremony(){return ceremony},get fails(){return [bodyHitV010,knockdownV010]},
 setup(slot,error=0){start();beginMatch();state.mode='playing';select(slot);resetFoot();state.target=slot;state.word=PRACTICE_SET[slot].word;state.hitstop=0;launchShot('normal',-1,[3.3,1.2,0]);state.flight=state.duration+error;updateScene(0);},
 recover(){player.kick=0;bodyHitV010=0;knockdownV010=0;state.mode='ready';state.ready=100;updateScene(0);}
 };select(0);refreshHud();requestAnimationFrame(frame);`);
 await page.route('http://kemari.test/**',route=>route.fulfill({contentType:'text/html',body:html}));await page.goto('http://kemari.test/');
 assert.equal(await page.evaluate(()=>window.kemari.version),'0.15.1-compact-ui');
 await page.locator('#start').click();
 const cases=await page.evaluate(()=>{const g=testGame,results=[];for(let slot=0;slot<4;slot++)for(const error of [-.15,0,.15]){g.setup(slot,error);const contact=g.sampleBall();g.kick();g.updateScene(0);const start=g.sampleBall(0),mid=g.sampleBall(.5),end=g.sampleBall(1);results.push({slot,error,contact,start,mid,end,duration:g.state.duration,style:kemari.getKick().style,kind:g.state.shot});}return results;});
 for(const c of cases){assert.deepEqual(c.start,c.contact,'no teleport on successful return');assert(Math.hypot(...c.end.map((v,i)=>v-[3.3,1.2,0][i]))<1e-9);assert(c.duration>=.7&&c.duration<=2.5);assert(c.mid.every(Number.isFinite));}
 for(let slot=0;slot<4;slot++){const a=cases.filter(c=>c.slot===slot);assert(a[0].mid[1]>a[1].mid[1]&&a[1].mid[1]>a[2].mid[1],'early rises, late drives');assert(a.every(c=>Math.abs(c.duration-a[0].duration)<1e-9),'timing does not change flight time');}
 assert.equal(new Set(cases.filter(c=>c.error===0).map(c=>c.mid[2].toFixed(2))).size,4,'four different depth paths');
 const stable=await page.evaluate(()=>{const g=testGame;g.setup(0,0);g.recover();const snapshot=()=>JSON.stringify(kemari.getKick().nodes),base=snapshot();for(let i=0;i<100;i++){g.setup(i%4,[-.15,0,.15][i%3]);g.kick();for(let n=0;n<55;n++)g.updateScene(1/60);g.recover();}g.setup(0,0);g.recover();return {same:base===snapshot(),y:g.player.n.pos[1]};});
 assert(stable.same,'all touched nodes restore exactly');assert.equal(stable.y,.12);
 const failures=await page.evaluate(()=>{const g=testGame;g.setup(0);const roots=[];for(let i=0;i<3;i++){g.state.direction=-1;g.state.flight=g.state.duration;g.state.target=1;g.kick();for(let n=0;n<110;n++)g.tick(1/120);roots.push({kick:g.player.kick,root:[...g.player.n.pos],head:[...g.player.head.rot],body:[...g.player.body.rot]});}g.start();g.state.mode='playing';g.state.flight=g.state.duration;g.state.target=1;g.kick();for(let n=0;n<100;n++)g.tick(1/120);return {roots,practiceTimer:g.fails[0]};});
 assert(failures.roots.every(r=>r.kick===0&&r.root[1]===.12&&Math.abs(r.head[2])<.2));assert.equal(failures.practiceTimer,0,'practice failure recovers too');assert(failures.roots.every(r=>Math.abs(r.root[2]+.7)<.53&&r.body.every(v=>Math.abs(v)<.6)),'no legacy tumbling overlay');
 const audioResult=await page.evaluate(()=>{const a=testGame.audio;a.set(true);a.voiceVolume=.8;testGame.speakWord('think');const u=__spoken.at(-1),old=u.onend;testGame.speakWord('ship');old();const staleProtected=a.ducked;__spoken.at(-1).onend();const released=!a.ducked;testGame.speakWord('vision');a.set(false);const muted=!a.enabled&&!a.ducked;const count=__spoken.length;testGame.speakWord('think');testGame.speakCallV010('Time');return {volume:Number(u.volume.toFixed(3)),staleProtected,released,muted,noSpeech:count===__spoken.length};});
 assert.deepEqual(audioResult,{volume:.8,staleProtected:true,released:true,muted:true,noSpeech:true});
 await page.locator('#musicVolume').fill('25');await page.locator('#voiceVolume').fill('60');
 assert.deepEqual(await page.evaluate(()=>[kemari.getAudioMix().music,kemari.getAudioMix().voice]),[.25,.6]);
 // Match pause must leave the ball and the animation frozen.
 const paused=await page.evaluate(()=>{const g=testGame;g.setup(2);g.kick();g.updateScene(.12);g.pause();const a=JSON.stringify([g.ball.pos,g.ball.rot,kemari.getKick().nodes]);for(let i=0;i<30;i++)g.updateScene(1/60);return a===JSON.stringify([g.ball.pos,g.ball.rot,kemari.getKick().nodes]);});assert(paused,'pause freezes scene');
 // Screenshots of each follow-through and mobile layout for human visual review.
 fs.mkdirSync('../work',{recursive:true});
 for(let i=0;i<4;i++){await page.evaluate(i=>{testGame.setup(i);testGame.kick();testGame.updateScene(.17);},i);await page.screenshot({path:`../work/kick-${i}.png`});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{testGame.start();testGame.updateScene(0);});await page.screenshot({path:'../work/mobile.png'});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'mobile horizontal overflow');
 // Exercise the actual index loader and public controls, without a test control seam.
 const live=await browser.newPage({viewport:{width:1280,height:900}});live.on('pageerror',e=>errors.push(e.message));
 await live.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},resume(){},getVoices(){return []},speak(u){u.onstart?.();setTimeout(()=>u.onend?.(),450);}}});});
 await live.clock.install();await live.clock.pauseAt(new Date(Date.now()+1000));
 await live.route('http://kemari-live.test/**',route=>{const name=new URL(route.request().url()).pathname.slice(1)||'index.html';if(!/^(index\.html|patch-[a-z0-9-]+\.js|app[1-5]\.b64)$/.test(name))return route.abort();route.fulfill({contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.html')?'text/html':'text/plain',body:fs.readFileSync(name,'utf8')});});
 await live.goto('http://kemari-live.test/');await live.waitForFunction(()=>!!window.kemari);
 await live.locator('#start').click();await live.clock.runFor(1500);
 for(let i=0;i<8;i++){
  const s=await live.evaluate(()=>kemari.getState());assert.equal(s.direction,-1);
  assert(await live.locator('[data-symbol="'+s.target+'"]').isEnabled());await live.locator('[data-symbol="'+s.target+'"]').dispatchEvent('click');
  await live.clock.runFor(Math.max(0,(s.duration-s.flight)*1000));await live.locator('#kick').dispatchEvent('pointerdown');
  const out=await live.evaluate(()=>kemari.getState());assert.equal(out.direction,1,'public practice kick succeeds');
  await live.clock.runFor((out.duration+.18)*1000);
 }
 await live.clock.runFor(4500);assert(await live.locator('#bowBtn').isVisible(),'TIME reaches bow choice');
 await live.locator('#bowBtn').dispatchEvent('click');await live.clock.runFor(6500);
 // State must now be in the match and input still works after the ceremony.
 const match=await live.evaluate(()=>kemari.getState());assert.equal(match.mode,'playing');assert.equal(match.config.hitWindow,.18);
 await live.locator('#pause').click();const frozen=await live.evaluate(()=>kemari.getState().flight);await live.clock.runFor(1500);assert.equal(await live.evaluate(()=>kemari.getState().flight),frozen);
 await live.locator('#resume').click();await live.clock.runFor(200);assert.notEqual(await live.evaluate(()=>kemari.getState().mode),'paused');
 await live.screenshot({path:'../work/live-match.png'});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,trajectoryCases:cases.length,stable,audioResult,failures,productionLoaderAndCeremony:true},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
