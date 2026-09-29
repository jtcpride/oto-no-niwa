const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;window.__spoken=[];Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},resume(){},getVoices(){return []},speak(u){__spoken.push(u.text)}}});});
 const html=require('./assemble.cjs')().replace('select(0);refreshHud();requestAnimationFrame(frame);',`window.ct={state,closeV027,duelV022,start,pause,setMotion,updateScene,
 tick(seconds){for(let t=0;t<seconds;t+=1/60){if(state.mode!=='paused')visualTime+=1/60;updateGame(1/60);updateScene(1/60)}},
 match(){state.mode='over';start();beginMatch();state.mode='playing';},
 drive(){for(let n=0;n<12000&&duelV022.phase!=='close';n++){
 if(['front','back'].includes(duelV022.phase)&&state.direction===-1&&state.flight>=state.duration-.01){document.querySelector('[data-symbol="'+state.target+'"]').click();document.querySelector('#kick').dispatchEvent(new PointerEvent('pointerdown'));}this.tick(1/60);}
 if(duelV022.phase!=='close')throw Error('did not reach close through rallies');},
 answer(ok=true){document.querySelector('[data-symbol="'+((closeV027.target+(ok?0:1))%4)+'"]').click();this.tick(1/60)}
 };select(0);refreshHud();`);
 await page.route('http://close.test/**',r=>r.fulfill({contentType:'text/html',body:html}));await page.goto('http://close.test/');
 const snapshot=()=>page.evaluate(()=>({stage:ct.closeV027.stage,turn:ct.closeV027.turn,score:ct.closeV027.score,phase:ct.duelV022.phase,hp:ct.state.hp,cpu:ct.state.cpuHp,damage:ct.state.pendingDamage,time:ct.closeV027.time,attempts:ct.closeV027.attempts}));
 for(const [width,height] of [[320,568],[390,844],[568,320],[844,390],[768,1024],[1024,768]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>{ct.match();ct.drive();ct.tick(.9)});
  assert.equal((await snapshot()).stage,'ask');assert.equal(await page.locator('.close-point.correct,.close-point.wrong').count(),0,'no answer reveal before input');
  const bounds=await page.locator('.close-point').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}));
  bounds.forEach(r=>assert(r.x>=0&&r.y>=0&&r.x+r.w<=width&&r.y+r.h<=height,JSON.stringify({width,height,r})));
  for(let i=1;i<4;i++)assert(bounds[i].y>=bounds[i-1].y+bounds[i-1].h,'body markers do not overlap');
  await page.screenshot({path:`../work/close-v027-${width}x${height}.png`});
  await page.evaluate(()=>{ct.tick(.4);ct.answer();ct.answer()});assert.equal((await snapshot()).score,1,'one answer only');
  await page.evaluate(()=>ct.tick(.81));assert.equal((await snapshot()).turn,1,'attack follows defense');
  await page.evaluate(()=>{ct.tick(.4);ct.answer();ct.tick(.81);ct.tick(.4);ct.answer();ct.tick(.81);ct.tick(.4);ct.answer(false);ct.tick(.81)});
  assert.equal((await snapshot()).stage,'win','3/4 wins');await page.evaluate(()=>ct.tick(.86));assert.equal((await snapshot()).phase,'charge');
 }
 await page.evaluate(()=>{ct.match();ct.drive();ct.tick(1.2);ct.pause()});const frozen=await snapshot();await page.evaluate(()=>{ct.tick(5);ct.answer()});assert.deepEqual(await snapshot(),frozen);await page.evaluate(()=>ct.pause());
 await page.evaluate(()=>{for(let i=0;i<4;i++){ct.tick(.3);ct.answer(i<2);ct.tick(.82)}});assert.equal((await snapshot()).stage,'lose','2/4 tie pushes back');
 await page.evaluate(()=>ct.tick(.86));const returned=await snapshot();assert.equal(returned.phase,'back');assert.equal(returned.hp,100);assert(returned.cpu>0);assert.equal(returned.damage,0);
 await page.evaluate(()=>ct.drive());assert.equal((await snapshot()).attempts,2,'normal rallies earn re-entry');
 await page.evaluate(()=>{ct.tick(.9);ct.tick(3.3)});assert.equal((await snapshot()).stage,'react');assert.equal((await snapshot()).score,0,'timeout counts as wrong');
 await page.evaluate(()=>{ct.start();ct.updateScene(0)});assert.equal((await snapshot()).stage,'idle');assert.equal(await page.locator('#closeCall').isVisible(),false);
 await page.evaluate(()=>{ct.setMotion(false);ct.match();ct.drive();ct.tick(1.2);ct.answer();ct.tick(.82)});assert.equal((await snapshot()).turn,1);
 assert.deepEqual(errors,[]);console.log('PASS: natural rally entry, 6 layouts, no reveal, 3/4 win, 2/4 pushback, re-entry, timeout, double input, pause/restart and effects OFF');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
