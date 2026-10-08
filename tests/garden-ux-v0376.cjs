'use strict';
// Exercise the garden's actual controls, then native modal focus/touch/layout in
// Chrome. Speech is mocked; this is not physical iPhone/iPad acceptance.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assemble=require('./assemble.cjs'),{vmFixture,sourceSeam,VIEWPORTS}=require('./complete-browser-v030.cjs');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.env.FEG_GARDEN_EVIDENCE_DIR||path.join(ROOT,'../work/garden-ux-v0376'));
const ORIGIN='http://garden-ux.test',places={jingu:'平安神宮',gendo:'三十三間堂',chion:'知恩院',sanjo:'三条',shinkyogoku:'新京極',million:'百万遍',gion:'祇園'};
const content={window:{}};for(const file of ['characters.js','stages.js'])vm.runInNewContext(fs.readFileSync(path.join(ROOT,'content',file),'utf8'),content);
const stages=content.window.FEGContent.stages,characters=content.window.FEGContent.characters;
const ready={version:1,introComplete:true,acquired:[],completed:false,wins:{}};
const full={...ready,acquired:['saku','sokichi','sumi','nagi','kota','luka']};
const report={startedAt:new Date().toISOString(),checks:[],screenshots:[],errors:[],limitations:['Chrome viewport emulation and mocked voice only; physical iPhone/iPad touch and audible sound are unverified.']};
fs.mkdirSync(OUT,{recursive:true});
function check(name,detail={}){report.checks.push({name,pass:true,...detail})}
const storage=save=>new Map([['feg.campaign.v1',JSON.stringify(save)]]);
function vmCases(){
 const html=assemble();let f=vmFixture(html,{url:ORIGIN+'/'});
 assert(f.w.document.querySelector('#intro p').textContent.includes('京都駅'));
 assert(f.w.document.querySelector('#start').textContent.includes('京都駅から始める'));
 f.click('#start');assert.equal(f.snapshot().campaign.phase,'dialogue');assert.equal(f.snapshot().campaign.intro,true);f.close();check('fresh START goes to Kyoto Station dialogue');
 f=vmFixture(html,{url:ORIGIN+'/?view=garden'});
 assert.equal(f.w.document.querySelector('#gardenChoice').open,false);f.click('#gardenGo');assert.equal(f.w.__qaNavigate,undefined,'closed confirmation cannot navigate');
 f.click('[data-stage="gendo"]');assert(f.w.document.querySelector('#gardenPrerequisite').textContent.includes('最初は京都駅'));assert.equal(f.w.document.querySelector('#gardenPrerequisite').hidden,false);
 f.click('#gardenGo');const firstURL=new URL(f.w.__qaNavigate);assert.equal(firstURL.searchParams.get('stage'),'jingu');assert.equal(firstURL.searchParams.get('intro'),'1');assert.deepEqual(f.errors,[]);f.close();check('fresh garden makes first-match prerequisite explicit');
 f=vmFixture(html,{url:ORIGIN+'/',storage:storage(ready)});assert(f.w.document.querySelector('#start').textContent.includes('石庭へ'));f.click('#start');assert.equal(f.snapshot().campaign.phase,'garden');f.close();check('returning START opens opponent selection');
 f=vmFixture(html,{url:ORIGIN+'/?view=garden',storage:storage(ready)});
 const saved=JSON.stringify(f.snapshot().campaign.save);
 assert.equal(f.w.document.querySelectorAll('.campaign-stone[aria-pressed="true"]').length,0,'no default opponent');
 for(const stage of stages.filter(s=>s.id!=='gion')){
  f.click('[data-stage="'+stage.id+'"]');assert.equal(f.w.document.querySelector('#gardenChoice').open,true);
  assert.equal(f.w.document.querySelector('#gardenName').textContent,characters.find(c=>c.id===stage.opponent).name);
  assert.equal(f.w.document.querySelector('#gardenPlace').textContent,places[stage.id]);
  assert.equal(f.w.document.querySelector('#gardenPrerequisite').hidden,true);assert.equal(f.w.__qaNavigate,undefined);
  f.click('#gardenCancel');assert.equal(f.w.document.querySelector('#gardenChoice').open,false);
  assert.equal(f.w.document.activeElement.dataset.stage,stage.id);assert.equal(f.w.document.querySelectorAll('.campaign-stone[aria-pressed="true"]').length,0);
  assert.equal(JSON.stringify(f.snapshot().campaign.save),saved);assert.equal(f.w.kemari.getAudioDiagnostics().disposed,false);
 }
 assert.equal(f.w.document.querySelector('#gardenFinal'),null);assert.deepEqual(f.errors,[]);f.close();check('six opponents show correct names/places; cancellation restores focus without progress or audio disposal');
 for(const stage of stages.filter(s=>s.id!=='gion')){
  f=vmFixture(html,{url:ORIGIN+'/?view=garden',storage:storage(ready)});f.click('[data-stage="'+stage.id+'"]');f.click('#gardenGo');
  const url=new URL(f.w.__qaNavigate);assert.equal(url.searchParams.get('stage'),stage.id);assert.equal(url.searchParams.has('intro'),false);assert.equal(f.w.kemari.getAudioDiagnostics().disposed,true);assert.deepEqual(f.errors,[]);f.close();
 }
 check('all six confirmed selections route freely to their own stage after Kyoto Station');
 f=vmFixture(html,{url:ORIGIN+'/?view=garden',storage:storage(full)});f.click('[data-stage="jingu"]');assert(f.w.document.querySelector('#gardenStatus').textContent.includes('継承済み'));f.click('#gardenClose');
 f.click('#stationAgain');assert.equal(f.w.document.querySelector('#gardenPlace').textContent,'京都駅');f.click('#gardenCancel');
 f.click('#gardenFinal');assert.equal(f.w.document.querySelector('#gardenPlace').textContent,'祇園');assert.equal(f.w.__qaNavigate,undefined);f.click('#gardenGo');assert.equal(new URL(f.w.__qaNavigate).searchParams.get('stage'),'gion');assert.deepEqual(f.errors,[]);f.close();check('replay, Kyoto replay and unlocked GION use the same confirmation');
}
async function browserCases(){
 const {chromium}=require('playwright');let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,ignoreDefaultArgs:['--enable-unsafe-swiftshader']});
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,recordVideo:{dir:OUT,size:{width:390,height:844}}}),page=await context.newPage();
  context.setDefaultTimeout(10000);page.on('pageerror',e=>report.errors.push(e.message));
  await context.addInitScript(save=>{
   window.__qaNativeRAF=requestAnimationFrame.bind(window);if(location.pathname.startsWith('/__'))window.requestAnimationFrame=()=>0;window.__qaSpoken=[];
   Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel(){},resume(){},speak(u){window.__qaSpoken.push(u.text);u.onstart?.();setTimeout(()=>u.onend?.(),20)}}});
   if(!localStorage.getItem('feg.campaign.v1'))localStorage.setItem('feg.campaign.v1',JSON.stringify(save));
  },full);
  const beforeFile=path.join(OUT,'before.html'),after=sourceSeam(assemble());
  await context.route(ORIGIN+'/**',async route=>{
   const url=new URL(route.request().url());
   if(url.pathname==='/__after.html')return route.fulfill({contentType:'text/html',body:after});
   if(url.pathname==='/__before.html')return route.fulfill({contentType:'text/html',body:sourceSeam(fs.readFileSync(beforeFile,'utf8'))});
   const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html',file=path.resolve(ROOT,relative);
   if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:'Not found'});
   const type=relative.endsWith('.js')?'text/javascript':relative.endsWith('.html')?'text/html':relative.endsWith('.json')?'application/json':'application/octet-stream';
   return route.fulfill({contentType:type,body:fs.readFileSync(file)});
  });
  const go=async url=>{await page.goto(ORIGIN+url);await page.waitForFunction(()=>!!window.kemari?.getCampaign(),null,{polling:50});if(await page.evaluate(()=>!!window.qa))await page.evaluate(()=>qa.draw())};
  const shot=async name=>{await page.evaluate(async()=>{window.qa?.draw();await new Promise(resolve=>__qaNativeRAF(()=>__qaNativeRAF(resolve)))});await page.screenshot({path:path.join(OUT,name+'.png')});report.screenshots.push(name+'.png')};
  if(fs.existsSync(beforeFile)){
   await go('/__before.html?view=garden');await shot('before-garden-390x844');await page.setViewportSize({width:568,height:320});await page.evaluate(()=>qa.draw());await shot('before-garden-568x320');
  }
  await go('/__after.html?view=garden');
  const gpu=await page.evaluate(()=>{qa.draw();return qa.renderStats()});assert(gpu.sampledColors>8&&!/swiftshader|software rasterizer|llvmpipe/i.test(gpu.renderer));check('actual hardware WebGL garden',{gpu});
  for(const [width,height] of VIEWPORTS){
   await page.setViewportSize({width,height});await page.evaluate(()=>qa.draw());await shot('after-garden-'+width+'x'+height);
   await page.locator('[data-stage="shinkyogoku"]').tap();await page.waitForFunction(()=>document.querySelector('#gardenChoice').open);
   assert.equal(await page.locator('#gardenName').innerText(),characters.find(c=>c.id==='kota').name);assert.equal(await page.locator('#gardenPlace').innerText(),'新京極');
   const layout=await page.evaluate(()=>{
    const r=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,right:b.right,bottom:b.bottom,w:b.width,h:b.height}};
    const d=document.querySelector('#gardenChoice');return {modal:r(d),scroll:d.scrollHeight,height:d.clientHeight,controls:[...d.querySelectorAll('button')].map(e=>({id:e.id,...r(e)})),text:[...d.querySelectorAll('h3,p:not([hidden])')].map(e=>({text:e.textContent,...r(e)})),focus:document.activeElement.id,overflow:document.documentElement.scrollWidth};
   });
   const fits=r=>r.x>=0&&r.y>=0&&r.right<=width+1&&r.bottom<=height+1;
   assert(fits(layout.modal));assert(layout.scroll<=layout.height+1,'no modal scrolling at '+width+'x'+height);assert.equal(layout.focus,'gardenGo');assert(layout.overflow<=width+1);
   for(const c of layout.controls){assert(fits(c));assert(c.w>=44&&c.h>=44,'44px touch target '+c.id)}for(const t of layout.text)assert(fits(t),'text fits '+t.text);
   await shot('choice-'+width+'x'+height);
   // Native dialog may hand focus to Chrome's own UI after its last button.
   // It must never let Tab reach an underlying garden/audio control.
   for(let i=0;i<4;i++){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement===document.body||document.querySelector('#gardenChoice').contains(document.activeElement)),true,'background controls stay inert')}
   await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#gardenChoice').open);assert.equal(await page.evaluate(()=>document.activeElement.dataset.stage),'shinkyogoku');
   check('native dialog touch, fit, focus and Escape '+width+'x'+height,{layout});
  }
  await page.setViewportSize({width:390,height:844});await page.locator('[data-stage="million"]').tap();await page.setViewportSize({width:844,height:390});await page.evaluate(()=>qa.draw());
  assert.equal(await page.locator('#gardenPlace').innerText(),'百万遍');assert.equal(await page.locator('#gardenChoice').evaluate(d=>d.open),true);await page.locator('#gardenCancel').tap();
  await page.locator('[data-stage="gendo"]').tap();await page.mouse.click(5,5);await page.waitForFunction(()=>!document.querySelector('#gardenChoice').open);assert.equal(await page.evaluate(()=>document.activeElement.dataset.stage),'gendo');check('rotation preserves choice; Cancel and backdrop return to the selected stone');
  // The production loader is separate from the accelerated seam.
  await page.setViewportSize({width:390,height:844});await go('/?view=garden&voice=native');
  assert.equal(await page.locator('#gardenChoice').evaluate(d=>d.open),false);const saved=await page.evaluate(()=>localStorage.getItem('feg.campaign.v1'));
  await page.locator('[data-stage="sanjo"]').tap();await shot('production-choice-390x844');await page.locator('#gardenCancel').tap();assert.equal(await page.evaluate(()=>localStorage.getItem('feg.campaign.v1')),saved);
  await page.locator('[data-stage="sanjo"]').tap();await page.locator('#gardenGo').tap();await page.waitForURL('**stage=sanjo');await page.waitForFunction(()=>window.kemari?.getCampaign().phase==='stage-card',null,{polling:50});
  assert((await page.locator('#start').innerText()).includes('対戦を始める'));await page.locator('#start').tap();await page.waitForFunction(()=>window.kemari.getCampaign().phase==='dialogue',null,{polling:50});await shot('production-opponent-dialogue');
  await page.locator('#dialogueNext').tap();await page.locator('#dialogueNext').tap();await page.waitForFunction(()=>window.kemari.getCampaign().phase==='match',null,{polling:50});await page.locator('#practiceCard').waitFor({state:'visible'});await shot('production-practice');check('production loader: select, cancel unchanged save, confirm, opponent dialogue, PRACTICE');
  await page.evaluate(()=>localStorage.removeItem('feg.campaign.v1')); // Next load: fresh progress through production entry.
  // Empty acquired full-save seed is intentionally replaced before loading.
  await page.evaluate(()=>localStorage.setItem('feg.campaign.v1',JSON.stringify({version:1,introComplete:false,acquired:[],completed:false,wins:{}})));
  await go('/?view=garden&voice=native');await page.locator('#stationAgain').tap();assert.equal(await page.locator('#gardenPlace').innerText(),'京都駅');await page.locator('#gardenGo').tap();await page.waitForURL('**intro=1');await page.waitForFunction(()=>window.kemari?.getCampaign().phase==='dialogue',null,{polling:50});assert((await page.locator('.campaign-dialogue .ja').innerText()).includes('よう帰ってきはりましたな'));await shot('production-first-kyoto');check('production first-match confirmation reaches original Kyoto Station dialogue');
  assert.deepEqual(report.errors,[]);await context.close();
 }finally{await browser?.close()}
}
(async()=>{try{vmCases();if(process.argv.includes('--browser'))await browserCases();report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(OUT,'verification.json'),JSON.stringify(report,null,2)+'\n');console.log('PASS: garden UX '+report.checks.length+' checks'+(process.argv.includes('--browser')?' including real Chrome/native dialog':''));}catch(error){report.errors.push(error.stack);fs.writeFileSync(path.join(OUT,'verification.json'),JSON.stringify(report,null,2)+'\n');console.error(error);process.exitCode=1}})();
