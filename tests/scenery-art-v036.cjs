'use strict';
// Matched real WebGL stage frames. Only the scenery factory changes between
// revisions; game state, camera, seeded particles and actor poses stay fixed.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{createCanvas,loadImage}=require('@napi-rs/canvas');
const {sourceSeam}=require('./complete-browser-v030.cjs');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.env.FEG_SCENERY_ART_DIR||'../work/v036/art');
const variant=process.argv[2]||'after',oldFile=process.argv[3];
const stages=['station','jingu','gendo','chion','sanjo','shinkyogoku','million','gion'];
const extract=code=>code.slice(code.indexOf(' function installKyotoSceneryV030(){'),code.lastIndexOf('\n};')).trim();
let html=require('./assemble.cjs')();
if(variant==='before'){
 assert(oldFile,'before requires a saved scenery source');
 const current=extract(fs.readFileSync(path.join(ROOT,'scenery/kyoto-scenes.js'),'utf8'));
 assert.equal(html.split(current).length,2);html=html.replace(current,extract(fs.readFileSync(oldFile,'utf8')));
}
html=sourceSeam(html);fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const page=await browser.newPage(),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.__artRAF=requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0;window.fetch=undefined;
  let seed=871;Math.random=()=>((seed=(seed*16807)%2147483647)-1)/2147483646;
  Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},resume(){},getVoices(){return[]},speak(u){u.onstart?.();u.onend?.()}}});
 });
 await page.route('http://scenery-art.test/**',route=>route.fulfill({contentType:'text/html',body:html}));
 try{
  for(const stage of stages){
   for(const [width,height] of [[960,640],[390,844]]){
    for(const pose of ['front','back',...(width===960&&stage!=='station'?['pursuit']:[])]){
     await page.setViewportSize({width,height});await page.goto('http://scenery-art.test/?'+(stage==='station'?'intro=1':'stage='+stage));await page.waitForFunction(()=>window.qa);
     const result=await page.evaluate(({pose,stage})=>{
      qa.campaign.phase='match';qa.campaign.intro=stage==='station';document.body.classList.remove('campaign-screen','campaign-cinematic');
      document.querySelector('#campaignUI').hidden=true;document.querySelector('#intro').hidden=true;for(const e of document.querySelectorAll('.overlay'))e.hidden=true;
      qa.begin();qa.tick(1.1);qa.state.feedbackTime=0;document.querySelector('#feedback').textContent='';
      qa.state.mode='playing';qa.duel.entered=pose!=='front';qa.duel.phase=pose==='front'?'front':pose==='back'?'back':'break';qa.duel.time=pose==='pursuit'?1.55:0;
      qa.draw();const initial=qa.renderer.engine?.info.memory;const memory=initial?{...initial}:null;
      for(let i=0;i<8;i++)qa.draw();
      return{...qa.renderStats(),frame:__qaFrame,scenery:kemari.getScenery(),memory,memoryAfter:qa.renderer.engine?{...qa.renderer.engine.info.memory}:null,draw:qa.renderer.engine?{...qa.renderer.engine.info.render}:null};
     },{pose,stage});
     assert.equal(result.error,0);assert(!/software|swiftshader/i.test(result.renderer));assert(result.sampledColors>8);
     assert.deepEqual(result.memory,result.memoryAfter,'redraw must not allocate GPU resources');
     for(const side of ['player','cpu'])assert(result.frame[side].vertices>0);
     await page.evaluate(()=>new Promise(resolve=>__artRAF(()=>__artRAF(resolve))));
     const name=variant+'-'+stage+'-'+pose+'-'+width+'x'+height;
     await page.screenshot({path:path.join(OUT,name+'.png')});
     if(width===960)await page.locator('#arena').screenshot({path:path.join(OUT,name+'-scene.png')});
     checks.push({file:name+'.png',...result});
    }
   }
  }
  assert.deepEqual(errors,[]);
  const sample=await loadImage(path.join(OUT,variant+'-station-front-960x640-scene.png'));
  const imageH=Math.round(640*sample.height/sample.width),rowH=imageH+28;
  const w=1280,h=8*rowH,canvas=createCanvas(w,h),ctx=canvas.getContext('2d');ctx.fillStyle='#131a23';ctx.fillRect(0,0,w,h);
  for(let i=0;i<stages.length;i++)for(let j=0;j<2;j++){
   const label=stages[i]+' / '+(j?'BACK':'FRONT');const img=await loadImage(path.join(OUT,variant+'-'+stages[i]+'-'+(j?'back':'front')+'-960x640-scene.png'));
   ctx.drawImage(img,j*640,i*rowH+28,640,imageH);ctx.fillStyle='#eee3c5';ctx.font='16px sans-serif';ctx.fillText(label,j*640+12,i*rowH+20);
  }
  fs.writeFileSync(path.join(OUT,variant+'-atlas.png'),canvas.toBuffer('image/png'));
  for(let part=0;part<2;part++){const c=createCanvas(w,4*rowH);c.getContext('2d').drawImage(canvas,0,-part*4*rowH);fs.writeFileSync(path.join(OUT,variant+'-atlas-'+part+'.png'),c.toBuffer('image/png'));}
  const report={passed:true,variant,checks,limitations:['Deterministic scene presentation fixture, not play or FPS measurement.','Speech is mocked; no real-device validation.']};
  fs.writeFileSync(path.join(OUT,variant+'-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:true,variant,screenshots:checks.length,renderer:checks[0].renderer,out:OUT}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
