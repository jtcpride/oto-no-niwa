'use strict';
// Development-room acceptance plus pixel equality against a saved assembled game.
// Audio is muted/mocked. Desktop GPU evidence is not iPhone/iPad acceptance.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{PNG}=require('pngjs');
const {sourceSeam}=require('./complete-browser-v030.cjs'),assemble=require('./assemble.cjs');
const originalSettings={limbDelay:0,kneeTuck:1,landingDepth:.20,recoveryEnd:2.75,runStride:1,cameraOrbit:1,cameraAir:.9,cameraPullback:.15};
const approvedSettings={limbDelay:.06,kneeTuck:1.15,landingDepth:.29,recoveryEnd:2.9,runStride:1.1,cameraOrbit:1.05,cameraAir:.65,cameraPullback:.16};
const out=path.resolve(process.env.FEG_LAB_EVIDENCE||'../work/pursuit-lab');fs.mkdirSync(out,{recursive:true});
const before=process.argv[2]?fs.readFileSync(process.argv[2],'utf8'):assemble(file=>require('node:child_process').execFileSync('git',['show','02c070e:'+file],{cwd:path.resolve(__dirname,'..'),encoding:'utf8',maxBuffer:8*1024*1024}));
const current=assemble(),tuneAnchor='const pursuitTuneV028={...PURSUIT_DEFAULTS_V028};';
assert.equal(current.split(tuneAnchor).length,2,'unique presentation override seam');
// Exercise the historical preset through the current production pose chain.
// It must still reproduce the saved game, while production defaults are the approved values.
const historical=current.replace(tuneAnchor,'const pursuitTuneV028='+JSON.stringify(originalSettings)+';');
const fixtures=Object.fromEntries([['before',before],['after',historical]].map(([key,source])=>[key,sourceSeam(source)]));
const origin=process.env.FEG_LAB_URL||'http://127.0.0.1:8770',checks=[],errors=[];
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const context=await browser.newContext({viewport:{width:960,height:700}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;window.fetch=undefined;let seed=318;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},resume(){},getVoices:()=>[],speak(u){u.onstart?.();u.onend?.();}}});});
  await page.route(origin+'/__comparison**',r=>r.fulfill({contentType:'text/html',body:fixtures[new URL(r.request().url()).searchParams.get('variant')]}));
  for(const [width,height] of [[844,390],[390,844]]){
   await page.setViewportSize({width,height});
   const baseline=[];
   for(const variant of ['before','after']){
    await page.goto(origin+'/__comparison?stage=jingu&variant='+variant);await page.waitForFunction(()=>window.qa);
    await page.addStyleTag({content:'*{animation:none!important;transition:none!important}'});
    await page.evaluate(()=>{qa.campaign.phase='match';qa.campaign.intro=false;document.body.classList.remove('campaign-screen','campaign-cinematic');document.querySelector('#campaignUI').hidden=true;});
    for(const t of [.08,.22,.42,.85,1.2,1.4,2,2.5,3.39]){
     const snap=await page.evaluate(t=>{qa.begin();qa.duel.entered=true;qa.duel.phase='break';qa.duel.time=t;qa.draw();return {eye:qa.renderer.eye,target:qa.renderer.target,zoom:qa.renderer.zoom,frame:__qaFrame,stats:qa.renderStats()};},t);
     assert.equal(snap.stats.error,0);assert(!/software|swiftshader/i.test(snap.stats.renderer));
     const pixels=PNG.sync.read(await page.screenshot()).data;
     if(variant==='before')baseline.push({t,snap,pixels});else{
      const original=baseline.find(b=>b.t===t);assert.deepEqual(snap,original.snap,'historical camera/bounds match '+width+' '+t);assert(pixels.equals(original.pixels),'historical pixels match '+width+' '+t);
     }
    }
   }
   checks.push({name:'historical preset matches saved v0.37.2 pixels and camera',width,height,frames:9});
  }
  await context.close();
  const live=await browser.newContext({viewport:{width:1280,height:820},acceptDownloads:true}),p=await live.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.goto(origin);await p.waitForFunction(()=>document.querySelector('#game').contentWindow.FEGPursuitLab);
  const snapshot=()=>p.evaluate(()=>document.querySelector('#game').contentWindow.FEGPursuitLab.snapshot());
  const initial=await snapshot();assert.equal(initial.stage,'jingu');assert.match(initial.renderer,/Three\.js/);assert.equal(initial.frame.phase,'breakCharge');
  assert.deepEqual(initial.settings,approvedSettings,'production adopts exactly the reviewed proposal');
  const presets=await p.evaluate(()=>{const l=document.querySelector('#game').contentWindow.FEGPursuitLab;return {defaults:l.defaults,baseline:l.baseline,proposal:l.proposal};});
  assert.deepEqual(presets.defaults,approvedSettings);assert.deepEqual(presets.proposal,approvedSettings);assert.deepEqual(presets.baseline,originalSettings);
  checks.push({name:'v0.37.3 production defaults equal the user-approved eight values'});
  const storage=await p.evaluate(()=>JSON.stringify({...localStorage}));
  await p.locator('#proposal').click();await p.locator('#timeline').fill('2.4');const proposal=await snapshot();assert.deepEqual(proposal.settings,initial.settings);
  await p.locator('#baseline').click();const base=await snapshot();assert.deepEqual(base.settings,originalSettings);assert.notDeepEqual(base.frame.joints,proposal.frame.joints);assert.notDeepEqual(base.frame.eye,proposal.frame.eye);
  await p.locator('#adjusted').click();assert.deepEqual((await snapshot()).frame,proposal.frame,'switch returns to same sample');
  await p.locator('#play').click();await p.waitForTimeout(220);assert((await snapshot()).time>2.4);await p.locator('#play').click();const stopped=await snapshot();await p.waitForTimeout(160);assert.deepEqual(await snapshot(),stopped,'pause freezes clocks and frame');
  await p.locator('#speed').selectOption('0.25');assert.equal((await snapshot()).speed,.25);
  await p.locator('#restart').click();await p.waitForTimeout(150);assert((await snapshot()).time<.2);await p.locator('#play').click();
  await p.locator('[data-setting="landingDepth"]').fill('0.31');assert.equal((await snapshot()).settings.landingDepth,.31);
  const downloadEvent=p.waitForEvent('download');await p.locator('#export').click();const download=await downloadEvent,exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(exported.settings.landingDepth,.31);
  await p.locator('#reset').click();assert.deepEqual((await snapshot()).settings,initial.settings);
  await p.locator('#import').setInputFiles({name:'settings.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await p.waitForFunction(()=>document.querySelector('#status').textContent==='設定を読み込みました。');assert.deepEqual((await snapshot()).settings,exported.settings);
  const valid=await snapshot();exported.settings.landingDepth=99;await p.locator('#import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await p.waitForFunction(()=>document.querySelector('#status').textContent.includes('範囲外'));assert.deepEqual((await snapshot()).settings,valid.settings,'bad import does not partially apply');
  const unknownRejected=await p.evaluate(()=>{try{document.querySelector('#game').contentWindow.FEGPursuitLab.set({constructor:1});return false;}catch{return true;}});assert(unknownRejected,'only the eight own settings are accepted');
  assert.equal(await p.evaluate(()=>JSON.stringify({...localStorage})),storage,'game storage isolated');checks.push({name:'play/pause/slow/seek/toggle/reset/export/import/storage isolation'});
  for(const [width,height] of [[320,568],[390,844],[844,390],[768,1024],[1024,768]]){
   await p.setViewportSize({width,height});await p.locator('#orientation').selectOption(width<height?'portrait':'landscape');await p.locator('#proposal').click();await p.locator('#timeline').fill('2.4');
   const viewport=await p.evaluate(()=>{const f=document.querySelector('#game');return[f.contentWindow.innerWidth,f.contentWindow.innerHeight];});
   assert(Math.abs(viewport[0]/viewport[1]-(width<height?390/844:844/390))<.02,'real portrait/landscape aspect; no CSS canvas scaling');
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no page overflow');
   for(const id of ['play','baseline','adjusted','proposal','reset','export','load']){const box=await p.locator('#'+id).boundingBox();assert(box.height>=44,'tap target '+id);}
   await p.screenshot({path:path.join(out,`room-${width}x${height}.png`),fullPage:true});checks.push({name:'responsive controls and actual preview',width,height});
  }
  await p.setViewportSize({width:1280,height:820});await p.locator('#orientation').selectOption('landscape');await p.locator('#proposal').click();await p.locator('#timeline').fill('2.4');await p.screenshot({path:path.join(out,'room.png'),fullPage:true});
  await live.close();
  // Real-time, normal-speed side-by-side source videos. Controls choose variants;
  // ordinary game update clocks deliver charge -> hit -> pursuit -> back court.
  for(const variant of ['before','adopted']){
   const recording=await browser.newContext({viewport:{width:960,height:700},recordVideo:{dir:out,size:{width:960,height:700}}}),v=await recording.newPage();v.on('pageerror',e=>errors.push(e.message));
   await v.goto(origin+'/__pursuit-game?stage=jingu');await v.waitForFunction(()=>window.FEGPursuitLab);
   await v.evaluate(variant=>{FEGPursuitLab.loop(false);if(variant==='before')FEGPursuitLab.set(FEGPursuitLab.baseline);FEGPursuitLab.play(true);},variant);
   await v.waitForFunction(()=>!FEGPursuitLab.snapshot().playing&&FEGPursuitLab.snapshot().time>4.6,{},{timeout:12000});
   const result=await v.evaluate(()=>FEGPursuitLab.snapshot());assert.equal(result.frame.phase,'back');
   await v.screenshot({path:path.join(out,variant+'-end.png')});const video=v.video();await recording.close();await video.saveAs(path.join(out,variant+'.webm'));checks.push({name:'real-time scene completes',variant,frame:result.frame});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({passed:true,date:new Date().toISOString(),base:'62538bd / game 02c070e',version:'0.37.3-pursuit',approvedSettings,checks,errors,limitations:['Muted or mocked sound; Mac Chrome GPU, not physical iPhone/iPad.']},null,2)+'\n');
  console.log(JSON.stringify({passed:true,checks:checks.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
