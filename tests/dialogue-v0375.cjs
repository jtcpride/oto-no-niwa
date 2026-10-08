'use strict';
// Dialogue lifecycle is exercised through the production DOM controls. Browser
// mode additionally measures the actual CSS and hardware WebGL at phone sizes.
// Speech is mocked at the shared call dispatcher; acoustic/device QA is separate.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assemble=require('./assemble.cjs'),{sourceSeam,vmFixture}=require('./complete-browser-v030.cjs');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.env.FEG_DIALOGUE_EVIDENCE_DIR||path.join(ROOT,'../work/match-polish-v0375-dialogue'));
const content={window:{}};vm.runInNewContext(fs.readFileSync(path.join(ROOT,'content/stages.js'),'utf8'),content);
const stages=content.window.FEGContent.stages,station=[{en:'Welcome back to Kyoto.',ja:'よう帰ってきはりましたな。',spoken:'Yoh, kaette kiharimashita na.'},{en:'Shall we see what you remember?',ja:'どれほど覚えてはるか、見せてもらいまひょか。',spoken:'Dorehodo oboete haru ka, misete moraimahyoka.'}];
const fullSave={version:1,introComplete:true,acquired:['saku','sokichi','sumi','nagi','kota','luka'],completed:false,wins:{}};
const report={startedAt:new Date().toISOString(),checks:[],screenshots:[],errors:[],limitations:['Shared voice dispatcher is mocked; actual audible speech, physical iPhone/iPad and Safari are unverified.']};
fs.mkdirSync(OUT,{recursive:true});
function record(name,detail={}){report.checks.push({name,pass:true,...detail});}
function vmDialogue(){
 const html=assemble();
 for(const stage of stages){
  const f=vmFixture(html,{url:'http://dialogue.test/?stage='+stage.id,storage:new Map([['feg.campaign.v1',JSON.stringify(fullSave)]])});
  const save=JSON.stringify(f.snapshot().campaign.save);f.click('#start');
  if(stage.id==='gion'){
   assert.equal(f.snapshot().campaign.phase,'gather');assert.equal(f.snapshot().campaign.godmode,false);
   f.tick(3);assert.equal(f.snapshot().campaign.godmode,true);assert.equal(f.w.__qaFrame.cpuVisible,false,'godmode precedes shadow');
   f.tick(.5);assert.equal(f.w.__qaFrame.cpuVisible,true,'shadow revealed after transformation');f.tick(.9);
  }
  assert.equal(f.snapshot().campaign.phase,'dialogue');
  const first=f.w.qa.campaign.dialogueNeedsGesture;
  if(first){f.click('#dialogueNext');assert.equal(f.w.qa.campaign.dialogue,0,'first voice gesture retains first line');}
  for(const [index,line] of stage.dialogue.entries()){
   assert.equal(f.w.qa.campaign.dialogue,index);assert.equal(f.w.document.querySelector('.en').textContent,line.en);assert.equal(f.w.document.querySelector('.ja').textContent,line.ja);
   assert.equal(f.w.__spoken.at(-1).text,line.spoken);assert.equal(f.w.__spoken.at(-1).kind,'call','romanized line uses fixed male call path');
   const frozen=f.snapshot();f.tick(2);assert.deepEqual(f.snapshot(),frozen,'reading cannot start practice or change progression');
   f.click('#dialogueNext');
  }
  assert.equal(f.snapshot().campaign.phase,'match');assert.equal(f.w.qa.ceremony,'practice');assert.equal(f.w.document.querySelector('#campaignUI').hidden,true);
  assert.equal(JSON.stringify(f.snapshot().campaign.save),save,'dialogue has no award side effect');
  const spokenBefore=f.w.__spoken.filter(u=>stage.dialogue.some(l=>l.spoken===u.text)).length;
  f.w.qa.state.mode='over';f.click('#restart');assert.equal(f.snapshot().campaign.phase,'match');assert.equal(f.w.qa.ceremony,'practice');
  assert.equal(f.w.__spoken.filter(u=>stage.dialogue.some(l=>l.spoken===u.text)).length,spokenBefore,'same-page retry does not reread dialogue');
  assert.equal(f.w.qa.state.hp,100);assert.equal(f.w.qa.state.cpuHp,100);assert.deepEqual(f.errors,[]);
  record(stage.id+' two lines, shared call voice, frozen reading, practice and direct retry',{firstGesture:first});f.close();
 }
 const f=vmFixture(html,{url:'http://dialogue.test/?intro=1'});f.click('#dialogueNext');
 for(const line of station){assert.equal(f.w.document.querySelector('.en').textContent,line.en);assert.equal(f.w.document.querySelector('.ja').textContent,line.ja);assert.equal(f.w.__spoken.at(-1).text,line.spoken);f.click('#dialogueNext');}
 assert.equal(f.snapshot().campaign.phase,'match');assert.deepEqual(f.errors,[]);f.close();record('both Kyoto Station lines preserved verbatim');
}
async function browserDialogue(){
 const {chromium}=require('playwright');let browser;
 try{
  try{browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,ignoreDefaultArgs:['--enable-unsafe-swiftshader']});}catch(error){error.code='BROWSER_LAUNCH_BLOCKED';throw error;}
  const context=await browser.newContext(),page=await context.newPage(),html=sourceSeam(assemble());
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.addInitScript(()=>{
   window.__qaNativeRAF=requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0;window.fetch=undefined;window.__spoken=[];
   Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel(){},resume(){},speak(u){__spoken.push({text:u.text,kind:u.kind});u.onstart?.();setTimeout(()=>u.onend?.(),20)}}});
   localStorage.setItem('feg.campaign.v1',JSON.stringify({version:1,introComplete:true,acquired:['saku','sokichi','sumi','nagi','kota','luka'],completed:false,wins:{}}));
  });
  await page.route('http://dialogue.test/**',r=>r.fulfill({contentType:'text/html',body:html}));
  for(const [width,height] of [[320,568],[568,320]])for(const item of [{id:'station',dialogue:station},...stages]){
   await page.setViewportSize({width,height});await page.goto('http://dialogue.test/?'+(item.id==='station'?'intro=1':'stage='+item.id));await page.waitForFunction(()=>!!window.qa);
   if(item.id!=='station'){await page.locator('#start').click();if(item.id==='gion')await page.evaluate(()=>qa.tick(4.4));}
   assert.equal(await page.evaluate(()=>qa.campaign.phase),'dialogue');
   if(await page.evaluate(()=>qa.campaign.dialogueNeedsGesture))await page.locator('#dialogueNext').click();
   for(const [index,line] of item.dialogue.entries()){
    assert.equal(await page.locator('.en').innerText(),line.en);assert.equal(await page.locator('.ja').innerText(),line.ja);
    assert.deepEqual(await page.evaluate(()=>__spoken.at(-1)),{text:line.spoken,kind:'call'});
    await page.evaluate(async()=>{qa.draw();await Promise.all(document.getAnimations().filter(a=>a.animationName==='campaign-caption-enter').map(a=>a.finished.catch(()=>{})));await new Promise(done=>__qaNativeRAF(()=>__qaNativeRAF(done)));});
    const d=await page.evaluate(()=>{
     const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height};};
     const panel=document.querySelector('.campaign-dialogue'),buttons=[...panel.querySelectorAll('button')].map(e=>{const r=rect(e);return {...r,id:e.id,receives:document.elementFromPoint(r.x+r.w/2,r.y+r.h/2)===e};});
     return {panel:rect(panel),en:rect(panel.querySelector('.en')),ja:rect(panel.querySelector('.ja')),speaker:rect(panel.querySelector('.speaker')),buttons,scrollWidth:document.documentElement.scrollWidth,phase:qa.campaign.phase,godmode:qa.campaign.godmode,gpu:qa.renderStats()};
    });
    const fits=r=>r.x>=0&&r.y>=0&&r.right<=width&&r.bottom<=height;
    assert(fits(d.panel)&&fits(d.en)&&fits(d.ja)&&fits(d.speaker),item.id+' text/panel fit '+width+'x'+height);
    assert(d.en.bottom<=d.ja.y,'English stays above Japanese');assert(d.scrollWidth<=width);
    assert(d.buttons.every(b=>fits(b)&&b.w>=44&&b.h>=44&&b.receives),'every dialogue button fits, is 44px and receives touch');
    assert(d.buttons.every(b=>b.y>=d.ja.bottom||b.x>=d.ja.right),'actions clear the Japanese subtitle');
    assert(d.gpu.sampledColors>8&&d.gpu.error===0&&!/swiftshader|llvmpipe|software rasterizer/i.test(d.gpu.renderer),'actual hardware WebGL dialogue');
    if(item.id==='gion')assert(d.godmode,'shadow dialogue follows godmode');
    const file=item.id+'-'+(index+1)+'-'+width+'x'+height+'.png';await page.screenshot({path:path.join(OUT,file)});report.screenshots.push(file);
    record(item.id+' line '+(index+1)+' fits '+width+'x'+height,d);await page.locator('#dialogueNext').click();
   }
   assert.equal(await page.evaluate(()=>qa.campaign.phase),'match');assert.equal(await page.evaluate(()=>qa.ceremony),'practice');
  }
  assert.deepEqual(report.errors,[]);await context.close();
 }finally{await browser?.close();}
}
const browserMode=process.argv.includes('--browser')||process.argv.includes('--browser-only');
(async()=>{try{if(!process.argv.includes('--browser-only'))vmDialogue();if(browserMode)await browserDialogue();report.status='passed';console.log(JSON.stringify({status:report.status,checks:report.checks.length,screenshots:report.screenshots.length,limits:report.limitations}));}catch(error){report.status=error.code==='BROWSER_LAUNCH_BLOCKED'?'blocked':'failed';report.errors.push(error.stack);console.error(error);process.exitCode=report.status==='blocked'?2:1;}finally{report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(OUT,'dialogue'+(browserMode?'-browser':'-vm')+'-report.json'),JSON.stringify(report,null,2)+'\n');}})();
