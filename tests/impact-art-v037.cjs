'use strict';
// Fixed-time actual-WebGL comparison. Baseline is a saved assembled production HTML.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{sourceSeam}=require('./complete-browser-v030.cjs');
const OUT=path.resolve(process.env.FEG_IMPACT_ART_DIR||'../work/impact-v037/art');fs.mkdirSync(OUT,{recursive:true});
const baseline=process.argv[2];assert(baseline,'Supply pre-change assembled HTML');
const variants={before:fs.readFileSync(baseline,'utf8'),after:require('./assemble.cjs')()},anchor='select(0);refreshHud();requestAnimationFrame(frame);';
for(const variant of Object.keys(variants)){
 let html=variants[variant].replace(anchor,`window.impactArt={
  begin(){campaignV030.phase='match';campaignV030.intro=false;document.body.classList.remove('campaign-screen','campaign-cinematic');$('#campaignUI').hidden=true;$('#intro').hidden=true;$('#overlay').hidden=true;audio.userChoice=true;audio.set(false);state.mode='over';start();beginMatch();state.mode='playing';qa.tick(1);state.feedbackTime=0;$('#feedback').textContent='';visualTime=1;},
  flight(t){this.begin();beginDepthV022();duelV022.time=t;updateScene(0)},
  reaction(turn,correct,target){this.begin();duelV022.entered=true;beginCloseV027();closeV027.turn=turn;askCloseV027();closeV027.target=target;closeV027.word=ACTIVE_DECK.sounds[target].words[0].text;closeV027.time=.3;answerCloseV027(correct?target:(target+1)%4);},
 };`+anchor);
 html=sourceSeam(html).replace('qaRender(scene);window.__qaFrame=',`window.impactArtFrame={joints:Object.fromEntries(['arm','farArm','elbow','farElbow','knee','backKnee'].map(k=>[k,[...cpu[k].rot]])),foot:dramaV028.foot,contact:dramaV028.contact,hold:closeV027.hold||0};qaRender(scene);window.__qaFrame=`);variants[variant]=html;
}
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),checks=[],errors=[];try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{let seed=318;Math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);window.__nativeRAF=requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0;window.fetch=undefined;Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},resume(){},getVoices:()=>[],speak(u){u.onstart?.();u.onend?.()}}});});
 await page.route('http://impact-art.test/**',r=>r.fulfill({contentType:'text/html',body:variants[new URL(r.request().url()).searchParams.get('variant')]}));
 async function shot(variant,stage,kind,arg,width=960,height=640){
  await page.setViewportSize({width,height});await page.goto(`http://impact-art.test/?stage=${stage}&variant=${variant}`);await page.waitForFunction(()=>window.qa);
  const result=await page.evaluate(({kind,arg})=>{if(kind==='flight')impactArt.flight(arg);else{impactArt.reaction(...arg);qa.tick(.32);}qa.draw();return{frame:__qaFrame,pose:impactArtFrame,stats:qa.renderStats()};},{kind,arg});
  assert.equal(result.stats.error,0);assert(!/software|swiftshader/i.test(result.stats.renderer));
  if(kind==='close')assert(Math.hypot(...result.pose.foot.map((v,i)=>v-result.pose.contact[i]))<.05);
  await page.evaluate(()=>new Promise(resolve=>__nativeRAF(()=>__nativeRAF(resolve))));
  const file=`${variant}-${stage}-${kind}-${Array.isArray(arg)?arg.join('-'):arg}-${width}x${height}.png`;await page.screenshot({path:path.join(OUT,file)});checks.push({file,...result});
 }
 for(const variant of ['before','after']){
  for(const t of [.12,.42,.85,1.20,1.40,2.50])await shot(variant,'sanjo','flight',t);
  for(const [w,h]of [[960,640],[390,844]])for(const turn of [0,1])for(const correct of [true,false])await shot(variant,'sanjo','close',[turn,correct,1],w,h);
 }
 for(const stage of ['jingu','chion','shinkyogoku','million'])for(const t of [.42,1.40])await shot('after',stage,'flight',t);
 for(const t of [.42,1.40])await shot('after','sanjo','flight',t,390,844);
 for(const target of [0,2,3])for(const turn of [0,1])for(const correct of [true,false])await shot('after','sanjo','close',[turn,correct,target]);
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify({passed:true,checks,errors,limitations:['Fixed posed scenes and mocked audio on Mac Chrome; continuous motion and real-device feel are separate.']},null,2)+'\n');console.log(JSON.stringify({passed:true,frames:checks.length,errors:errors.length}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
