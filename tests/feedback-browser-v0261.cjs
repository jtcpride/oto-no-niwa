const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},resume(){},getVoices(){return []},speak(){}}}));
 const html=require('./assemble.cjs')().replace('select(0);refreshHud();requestAnimationFrame(frame);',`window.feedbackTest={setup(){state.mode='over';start();beginMatch();state.mode='playing';},hit(){state.direction=-1;state.pendingMiss=null;select(0);resetFoot();state.target=0;state.flight=state.duration;kick();updateScene(0);}};select(0);refreshHud();`);
 await page.route('http://feedback.test/**',r=>r.fulfill({contentType:'text/html',body:html}));await page.goto('http://feedback.test/');
 for(const [width,height] of [[320,568],[390,844],[568,320],[844,390],[768,1024],[1024,768]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>{feedbackTest.setup();feedbackTest.hit();feedbackTest.hit()});await page.waitForTimeout(180);
  const x=await page.evaluate(()=>{const box=s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,display:getComputedStyle(e).display,opacity:getComputedStyle(e).opacity,text:e.textContent}};return {feed:box('#sportFeed'),row:box('#sportFeed .sport-item'),hp:box('#hpValue'),card:box('#practiceCard')}});
  assert(x.row.text.startsWith('PERFECT ×2'));assert.notEqual(x.feed.display,'none');assert.equal(x.row.opacity,'1');assert(x.row.y>=x.hp.y+x.hp.h);assert(x.row.x>=0&&x.row.x+x.row.w<=width&&x.row.y+x.row.h<=height);
  const overlap=x.row.x<x.card.x+x.card.w&&x.row.x+x.row.w>x.card.x&&x.row.y<x.card.y+x.card.h&&x.row.y+x.row.h>x.card.y;assert(!overlap,JSON.stringify({width,height,...x}));
  await page.screenshot({path:`../work/feedback-v0261-${width}x${height}.png`});
 }
 await page.waitForTimeout(1400);assert.equal(await page.locator('#sportFeed .sport-item').count(),0);assert.deepEqual(errors,[]);console.log('PASS: actual PERFECT ×2 visible beneath HP alongside answer card, 6 layouts without overlap, timed removal');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
