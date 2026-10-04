'use strict';
// Short, silent before/after recordings of real pursuit choreography. The QA
// seam advances correct rallies to the breakthrough; native RAF runs the clip.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.env.FEG_SCENERY_VIDEO_DIR||'../work/v036/video');
const oldFile=process.argv[2];assert(oldFile,'Supply pre-change scenery source');
const extract=code=>code.slice(code.indexOf(' function installKyotoSceneryV030(){'),code.lastIndexOf('\n};')).trim();
const current=extract(fs.readFileSync(path.join(ROOT,'scenery/kyoto-scenes.js'),'utf8')),old=extract(fs.readFileSync(oldFile,'utf8'));
const anchor='select(0);refreshHud();requestAnimationFrame(frame);',html=require('./assemble.cjs')();assert.equal(html.split(current).length,2);
const seam=`let tourQuestionSeed=871;
const tourQuestion=newQuestion;
newQuestion=function(){const random=Math.random;Math.random=()=>((tourQuestionSeed=(tourQuestionSeed*16807)%2147483647)-1)/2147483646;try{return tourQuestion();}finally{Math.random=random;}};
// Mock the shared voice entry, including the recorded backend. Mocking only
// speechSynthesis would leave the MP3 path live and show an irrelevant retry.
audio.speak=function(u,onDone){audio.stopVoice();onDone?.();};audio.canPlayVoice=()=>true;
window.sceneryTourStart=()=>{
 campaignV030.phase='match';campaignV030.intro=false;document.body.classList.remove('campaign-screen','campaign-cinematic');
 document.querySelector('#campaignUI').hidden=true;document.querySelector('#intro').hidden=true;
 for(const o of document.querySelectorAll('.overlay'))o.hidden=true;
 state.mode='over';start();beginMatch();state.mode='playing';
 const saved=renderer.render;renderer.render=()=>{};
 try{for(let i=0;i<18000&&duelV022.phase!=='breakCharge';i++){
  if(state.direction===-1&&state.flight>=state.duration-.008){select(state.target);kick();}
  visualTime+=1/60;updateGame(1/60);updateScene(1/60);
 }}finally{renderer.render=saved;}
 state.feedbackTime=0;document.querySelector('#feedback').textContent='';
 updateScene(0);return {phase:duelV022.phase,hp:state.hp,cpu:state.cpuHp};
};`;
const variants={before:html.replace(current,old).replace(anchor,seam+anchor),after:html.replace(anchor,seam+anchor)};
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const results=[];
 try{for(const variant of ['before','after'])for(const stage of ['gion','chion','sanjo']){
  const context=await browser.newContext({viewport:{width:960,height:640},recordVideo:{dir:OUT,size:{width:960,height:640}}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{let seed=871;Math.random=()=>((seed=(seed*16807)%2147483647)-1)/2147483646;window.fetch=undefined;
   Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},resume(){},getVoices(){return[]},speak(u){u.onstart?.();u.onend?.()}}});
  });
  await page.route('http://scenery-tour.test/**',route=>route.fulfill({contentType:'text/html',body:variants[variant]}));
  await page.goto('http://scenery-tour.test/?stage='+stage);await page.waitForFunction(()=>window.sceneryTourStart);
  const initial=await page.evaluate(()=>sceneryTourStart());assert.equal(initial.phase,'breakCharge');
  await page.waitForTimeout(6300);
  const final=await page.evaluate(()=>({duel:kemari.getDuel(),scenery:kemari.getScenery(),version:kemari.version}));
  assert.equal(final.duel.phase,'back');assert.equal(final.scenery.side,'back');assert.deepEqual(errors,[]);
  const video=page.video();await context.close();const file=variant+'-'+stage+'.webm';await video.saveAs(path.join(OUT,file));const raw=await video.path();if(raw!==path.join(OUT,file))fs.unlinkSync(raw);
  results.push({variant,stage,file,initial,final});console.log('PASS '+variant+' '+stage+' breakthrough / pursuit / back');
 }fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify({passed:true,results,limitations:['Native RAF recording on Mac Chrome, silent, not phone performance or human input acceptance.','Deterministic successful input advances to the breakthrough. Before/after share gameplay, camera and characters; scenery is substituted.']},null,2)+'\n');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
