const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},resume(){},getVoices(){return []},speak(){}}});});
  const seam=`window.bowTest={state,pause,setMotion,enterTimeChoiceV09,tick(dt){updateGame(dt)},setup(){state.mode='over';start();state.mode='playing';enterTimeChoiceV09()}};select(0);refreshHud();requestAnimationFrame(frame);`;
  const html=require('./assemble.cjs')().replace('select(0);refreshHud();requestAnimationFrame(frame);',seam);
  await page.route('http://bow.test/**',r=>r.fulfill({contentType:'text/html',body:html}));await page.goto('http://bow.test/');
  const cue=()=>page.locator('#bowBtn').evaluate(e=>e.classList.contains('bow-cue'));
  await page.evaluate(()=>bowTest.setup());assert.equal(await cue(),false);
  await page.evaluate(()=>bowTest.tick(4.9));assert.equal(await cue(),false);
  await page.evaluate(()=>{bowTest.pause();bowTest.tick(10);bowTest.pause()});assert.equal(await cue(),false,'pause does not consume wait');
  await page.evaluate(()=>bowTest.tick(.11));assert.equal(await cue(),true);
  assert.equal(await page.locator('#bowBtn').evaluate(e=>getComputedStyle(e).animationName),'bow-cue-glow');
  await page.evaluate(()=>bowTest.setMotion(false));assert.equal(await page.locator('#bowBtn').evaluate(e=>getComputedStyle(e).animationName),'none');
  await page.evaluate(()=>bowTest.setMotion(true));await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('#bowBtn').evaluate(e=>getComputedStyle(e).animationName),'none');await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>bowTest.pause());assert.equal(await cue(),false);await page.evaluate(()=>bowTest.pause());assert.equal(await cue(),true);
  await page.locator('#bowBtn').click();assert.equal(await cue(),false,'bow clears immediately');await page.locator('#bowBtn').click();assert.equal(await cue(),false,'repeat bow remains possible');
  await page.evaluate(()=>bowTest.enterTimeChoiceV09());assert.equal(await cue(),false);await page.evaluate(()=>bowTest.tick(5));assert.equal(await cue(),true);
  await page.locator('#practiceAgain').click();assert.equal(await cue(),false,'practice clears cue');
  await page.evaluate(()=>bowTest.setup());assert.equal(await cue(),false,'restart resets timer');await page.evaluate(()=>bowTest.tick(5));
  for(const size of [{width:390,height:844},{width:844,height:390}]){await page.setViewportSize(size);const r=await page.locator('#bowBtn').boundingBox();assert(r.x>=0&&r.y>=0&&r.x+r.width<=size.width&&r.y+r.height<=size.height);}
  assert.deepEqual(errors,[]);console.log('Bow cue: delay, pause, repeated bow, practice/restart, reduced motion, portrait/landscape OK');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
