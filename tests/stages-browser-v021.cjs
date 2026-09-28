// Real production loader, stage navigation and responsive menu. TTS events are mocked.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.__spoken=[];Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},resume(){},getVoices(){return []},speak(u){__spoken.push(u.text);u.onstart?.();setTimeout(()=>u.onend?.(),100)}}})});
  await page.route('http://stages.test/**',route=>{const name=new URL(route.request().url()).pathname.slice(1)||'index.html';if(!/^(index\.html|patch-[a-z0-9-]+\.js|app[1-5]\.b64|content\/[a-z-]+\.js|characters\/[a-z-]+\.js)$/.test(name))return route.abort();return route.fulfill({contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.html')?'text/html':'text/plain',body:fs.readFileSync(path.join(root,name),'utf8')})});
  await page.goto('http://stages.test/?keep=yes');await page.waitForFunction(()=>window.kemari);
  assert.equal(await page.evaluate(()=>kemari.getStage().id),'first-court');
  await page.locator('#stageSelect').selectOption('second-court');await page.waitForURL('**stage=second-court');await page.waitForFunction(()=>window.kemari?.getStage().id==='second-court');
  assert.equal(new URL(page.url()).searchParams.get('keep'),'yes');
  assert.deepEqual(await page.locator('.symbols span').allTextContents(),['/f/','/v/','/s/','/z/']);
  assert.equal(await page.locator('.player-name .eyebrow').textContent(),'PLAYER / 藍');
  assert.equal(await page.locator('.cpu-name .eyebrow').textContent(),'CPU / 紫苑');
  for(const [width,height] of [[320,568],[390,844],[568,320],[844,390],[768,1024],[1024,768]]){
   await page.setViewportSize({width,height});
   const metrics=await page.evaluate(()=>{const select=document.querySelector('#stageSelect'),start=document.querySelector('#start'),p=document.querySelector('#intro'),s=select.getBoundingClientRect(),b=start.getBoundingClientRect(),r=p.getBoundingClientRect();return {width:document.documentElement.scrollWidth,viewport:innerWidth,selectHeight:s.height,startHeight:b.height,selectFits:s.left>=0&&s.right<=innerWidth&&s.top>=0&&s.bottom<=innerHeight,startFits:b.top>=0&&b.bottom<=innerHeight,panelFits:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}});
   assert(metrics.width<=metrics.viewport);assert(metrics.selectHeight>=44&&metrics.startHeight>=44);assert(metrics.selectFits&&metrics.startFits&&metrics.panelFits,JSON.stringify({width,height,metrics}));
   if(width===390||width===844)await page.screenshot({path:path.join(root,`../work/stages-${width}.png`)});
  }
  await page.locator('#start').click();await page.waitForFunction(()=>kemari.getState().mode==='playing');
  assert.equal(await page.locator('#intro').isVisible(),false);
  assert.deepEqual(await page.evaluate(()=>__spoken.slice(0,2)),['FIFTEENTH EVER GARDEN','fan']);
  await page.locator('#repeatWord').click();assert.equal(await page.evaluate(()=>__spoken.at(-1)),'fan');
  // Same navigation used by the result menu returns to a clean title. Dispatch avoids waiting for a whole match.
  await page.locator('#stageMenu').dispatchEvent('click');await page.waitForFunction(()=>kemari?.getState().mode==='idle');
  assert.equal(await page.locator('#intro').isVisible(),true);assert.equal(await page.locator('#stageSelect').isEnabled(),true);
  await page.locator('#stageSelect').selectOption('first-court');await page.waitForURL('**stage=first-court');await page.waitForFunction(()=>window.kemari?.getStage().id==='first-court');
  assert.deepEqual(await page.locator('.symbols span').allTextContents(),['/θ/','/ð/','/ʃ/','/ʒ/']);
  const state=await page.evaluate(()=>kemari.getState());assert.equal(state.mode,'idle');assert.equal(state.hp,100);assert.equal(state.cpuHp,100);assert.equal(state.pendingDamage,0);
  assert.deepEqual(errors,[]);console.log('PASS: production modules, both-stage navigation, query preservation, 6 layouts, title/word/repeat speech, clean stage return');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
