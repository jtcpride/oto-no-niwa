'use strict';
// Real WebGL visual QA. Test-only phase setup is used for composition checks;
// complete-browser-v030.cjs remains the full campaign/lifecycle acceptance run.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),assemble=require('./assemble.cjs');
const {sourceSeam,VIEWPORTS,STAGES}=require('./complete-browser-v030.cjs');
const GATHER_ONLY=process.argv.includes('--gather-only');
const OUT=path.resolve(process.env.FEG_UI_EVIDENCE_DIR||path.join(__dirname,'../../work/'+(GATHER_ONLY?'ui-gather':'ui-polish')));
fs.mkdirSync(OUT,{recursive:true});
const report={scope:GATHER_ONLY?'gather-camera':'complete-ui',startedAt:new Date().toISOString(),checks:[],failures:[],screenshots:[],limitations:['Deterministic phase setup and mocked speech; no acoustic or physical-device acceptance.']};
function check(ok,name,detail={}){report.checks.push({name,pass:!!ok,...detail});if(!ok)report.failures.push({name,...detail});}
function overlap(a,b){return Math.max(0,Math.min(a.right,b.right)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y));}
const html=sourceSeam(assemble()).replace('qaRender(scene);window.__qaFrame=',`qaRender(scene);
 const bounds=(node,parents=[])=>{const points=[];function visit(n,chain){if(!n.visible)return;const next=[n,...chain];if(n.geo)for(let i=0;i<n.geo.p.length;i+=3){let p=Array.from(n.geo.p.slice(i,i+3));for(const q of next)p=qaTransform(p,q);points.push(renderer.project(p));}for(const c of n.children)visit(c,next);}visit(node,parents);const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);return {x:Math.min(...xs),y:Math.min(...ys),right:Math.max(...xs),bottom:Math.max(...ys)};};
 let ballPixels=null;
 if(window.__uiProbeBall&&ball.visible){
  const gl=renderer.gl,W=gl.drawingBufferWidth,H=gl.drawingBufferHeight,before=new Uint8Array(W*H*4),after=new Uint8Array(W*H*4);
  gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,before);ball.visible=false;qaRender(scene);gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,after);ball.visible=true;qaRender(scene);
  let minX=W,minY=H,maxX=-1,maxY=-1,count=0;
  for(let i=0;i<before.length;i+=4)if(Math.max(Math.abs(before[i]-after[i]),Math.abs(before[i+1]-after[i+1]),Math.abs(before[i+2]-after[i+2]))>5){const x=(i/4)%W,y=H-1-Math.floor(i/4/W);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);count++;}
  ballPixels={x:minX*renderer.width/W,y:minY*renderer.height/H,right:(maxX+1)*renderer.width/W,bottom:(maxY+1)*renderer.height/H,count};
 }
 window.__uiFrame={heads:[player,cpu].map(f=>bounds(f.head,[f.body,f.n])),ball:bounds(ball),ballPixels,frontVisible:frontSceneryV022.visible,backVisible:backSceneryV022.visible,entered:duelV022.entered,orbs:sevenOrbsV030.filter(n=>n.visible).map(n=>bounds(n)),camera:{eye:[...renderer.eye],target:[...renderer.target],zoom:renderer.zoom}};
 window.__qaFrame=`).replace('updateGame(dt);updateScene(dt)}}finally','updateGame(dt);if(state.feedbackTime>0){state.feedbackTime-=dt;if(state.feedbackTime<=0)document.querySelector("#feedback").textContent="";}updateScene(dt)}}finally');
async function shot(page,name){
 await page.evaluate(async()=>{qa.draw();await Promise.all(document.getAnimations().filter(a=>a.animationName==='campaign-caption-enter').map(a=>a.finished.catch(()=>{})));await new Promise(done=>__qaNativeRAF(()=>__qaNativeRAF(done)))});
 await page.screenshot({path:path.join(OUT,name+'.png')});report.screenshots.push(name+'.png');
}
async function info(page){return page.evaluate(()=>{
 const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height}};
 const arena=rect(document.querySelector('#world')),r=rect(document.querySelector('#ballLabel'));
 const label={x:r.x-arena.x,y:r.y-arena.y,right:r.right-arena.x,bottom:r.bottom-arena.y,w:r.w,h:r.h};
 const card=document.querySelector('#practiceCard'),cr=rect(card),caption=document.querySelector('.campaign-cinema>div'),e=document.querySelector('#ballLabel'),n=name=>parseFloat(e.style.getPropertyValue(name)),angle=n('--prompt-line-angle'),length=n('--prompt-line-length');
 const tip=[label.x+n('--prompt-line-x')+Math.cos(angle)*length,label.y+n('--prompt-line-y')+Math.sin(angle)*length];
 return {arena,label,heads:__uiFrame.heads,ball:__uiFrame.ball,ballPixels:__uiFrame.ballPixels,orbs:__uiFrame.orbs,camera:__uiFrame.camera,frontVisible:__uiFrame.frontVisible,backVisible:__uiFrame.backVisible,entered:__uiFrame.entered,ballCenter:__qaFrame.ball,tip,ceremony:qa.ceremony,card:!card.hidden&&getComputedStyle(card).visibility!=='hidden'?{x:cr.x-arena.x,y:cr.y-arena.y,right:cr.right-arena.x,bottom:cr.bottom-arena.y}:null,caption:caption?rect(caption):null,hud:(()=>{const r=rect(document.querySelector('.hud'));return {x:r.x-arena.x,y:r.y-arena.y,right:r.right-arena.x,bottom:r.bottom-arena.y}})(),appCount:document.querySelectorAll('#app').length,phase:kemari.getCampaign().phase};
});}
async function main(){
 let browser,context;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,ignoreDefaultArgs:['--enable-unsafe-swiftshader']});
  context=await browser.newContext({viewport:{width:1101,height:719}});const page=await context.newPage();
  page.on('pageerror',e=>report.failures.push({name:'pageerror',message:e.message}));
  await page.addInitScript(()=>{
   window.__qaNativeRAF=requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0;
   Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel(){},resume(){},speak(u){u.onstart?.();setTimeout(()=>u.onend?.(),20)}}});
  });
  await page.route('http://feg-ui.test/**',r=>r.fulfill({contentType:'text/html',body:html}));
  const go=async query=>{await page.goto('http://feg-ui.test/'+query);await page.waitForFunction(()=>!!window.qa,null,{polling:50});};
  await go('');report.gpu=await page.evaluate(()=>{qa.draw();return qa.renderStats()});check(!/swiftshader|llvmpipe|software rasterizer/i.test(report.gpu.renderer)&&report.gpu.sampledColors>8,'actual hardware WebGL scene',report.gpu);
  if(!GATHER_ONLY){
  const title=await info(page);await shot(page,'title-1101x719');
  const phrases=await page.locator('#intro p .campaign-phrase').count();check(phrases===3,'title wraps at complete Japanese phrases',{phrases});
  await page.locator('#start').click();await page.waitForFunction(()=>qa.campaign.phase==='dialogue',null,{polling:50});const dialogue=await info(page);
  check(Math.abs(title.arena.w-dialogue.arena.w)<2&&Math.abs(title.arena.h-dialogue.arena.h)<2,'title to dialogue preserves stage dimensions',{title:title.arena,dialogue:dialogue.arena});
  for(const [width,height] of [...VIEWPORTS,[1101,719]]){
   await page.setViewportSize({width,height});await shot(page,'dialogue-'+width+'x'+height);
   const d=await page.evaluate(()=>{const e=document.querySelector('.campaign-dialogue'),r=e.getBoundingClientRect(),b=document.querySelector('#dialogueNext').getBoundingClientRect(),en=e.querySelector('.en').getBoundingClientRect(),ja=e.querySelector('.ja').getBoundingClientRect();return {panel:{x:r.x,y:r.y,right:r.right,bottom:r.bottom},button:{w:b.width,h:b.height},enBottom:en.bottom,jaTop:ja.top,next:document.querySelector('#dialogueNext').textContent}});
   check(d.panel.x>=0&&d.panel.y>=0&&d.panel.right<=width&&d.panel.bottom<=height,'dialogue fits '+width+'x'+height,d);
   check(d.enBottom<=d.jaTop&&d.button.h>=44&&d.next.includes('次へ'),'dialogue order and clear touch action '+width+'x'+height,d);
  }
  await page.evaluate(()=>qa.setMotion(false));
  let reduced=await page.locator('.campaign-dialogue').evaluate(e=>({animation:getComputedStyle(e).animationName,transition:getComputedStyle(e).transitionDuration}));
  check(reduced.animation==='none'&&reduced.transition.split(',').every(s=>parseFloat(s)===0),'effects OFF removes dialogue animation/transition',reduced);
  await page.evaluate(()=>localStorage.setItem('feg.campaign.v1',JSON.stringify({version:1,introComplete:true,acquired:['saku','sokichi','sumi','nagi','kota','luka'],wins:{},completed:false})));
  await go('?stage=jingu');await page.evaluate(()=>{qa.start();qa.state.mode='playing';qa.beginTimePass();qa.draw()});
  for(const ceremony of ['time','choice','bow-wait','hajime']){
   if(ceremony==='choice')await page.evaluate(()=>{for(let t=0;t<10&&qa.ceremony!=='choice';t+=.1)qa.tick(.1)});
   if(ceremony==='bow-wait')await page.locator('#bowBtn').click();
   if(ceremony==='hajime')await page.evaluate(()=>{for(let t=0;t<5&&qa.ceremony!=='hajime';t+=.05)qa.tick(.05)});
   const d=await page.evaluate(()=>{qa.draw();return {ceremony:qa.ceremony,visibility:getComputedStyle(document.querySelector('#ballLabel')).visibility}});
   check(d.ceremony===ceremony&&d.visibility==='hidden',ceremony+' has no empty prompt',d);
  }
  for(const stage of STAGES){
   await go('?stage='+stage);await page.evaluate(()=>{qa.setMotion(true);qa.start();if(qa.campaign.phase==='gather')qa.tick(4.4);qa.draw()});
   check(await page.evaluate(()=>qa.campaign.phase==='match'&&qa.ceremony==='practice'),stage+' real PRACTICE fixture reached');
   for(const [width,height] of VIEWPORTS){
    await page.setViewportSize({width,height});await page.evaluate(()=>{qa.state.flight=qa.state.duration*.5;qa.draw()});
    const d=await info(page);check(!!d.card&&overlap(d.label,d.card)<1,stage+' prompt clears PRACTICE '+width+'x'+height,d);check(!!d.card&&overlap(d.card,d.hud)<1,stage+' PRACTICE clears HUD '+width+'x'+height,d);
    if(stage==='jingu')await shot(page,stage+'-practice-'+width+'x'+height);
   }
   await page.evaluate(()=>{qa.beginMatch();qa.state.mode='playing';qa.draw()});
   for(const side of ['front','back']){
    if(side==='back')await page.evaluate(()=>qa.driveUntil('back'));
    const route=await page.evaluate(()=>{qa.draw();return {phase:qa.duel.phase,entered:qa.duel.entered,front:__uiFrame.frontVisible,back:__uiFrame.backVisible}});
    check(route.phase===side&&route.entered===(side==='back')&&route.front===(side==='front')&&route.back===(side==='back'),stage+' '+side+' actual rendered scenery route',route);
    for(const [width,height] of VIEWPORTS){
     await page.setViewportSize({width,height});
     for(const p of [0,.25,.5,.75,.95]){
      await page.evaluate(({p,probe})=>{window.__uiProbeBall=probe;qa.state.mode='playing';qa.state.direction=-1;qa.state.flight=qa.state.duration*p;qa.draw()},{p,probe:[390,844].includes(width)&&[0,.5].includes(p)});
      const d=await info(page),label=d.label,tag=stage+' '+side+' '+width+'x'+height+' @'+p;
      check(label.x>=0&&label.y>=0&&label.right<=d.arena.w&&label.bottom<=d.arena.h,tag+' prompt fits',d);
      check(d.heads.every(head=>overlap(label,head)<1),tag+' prompt clears heads',d);
      check(overlap(label,d.ball)<1,tag+' prompt clears ball',d);
      const endpointError=Math.hypot(d.tip[0]-d.ballCenter[0],d.tip[1]-d.ballCenter[1]);
      check(endpointError>=3&&endpointError<=5,tag+' leader reaches rendered ball',{endpointError,tip:d.tip,ballCenter:d.ballCenter});
      // The leader intentionally stops 4 CSS px from the center; a kicking
      // foot can occlude that side of the ball, so allow the same 4 px inset.
      if(d.ballPixels){const b=d.ballPixels;check(b.count>5&&d.tip[0]>=b.x-4&&d.tip[0]<=b.right+4&&d.tip[1]>=b.y-4&&d.tip[1]<=b.bottom+4,tag+' leader reaches independently rasterized ball',{pixels:b,tip:d.tip});}
      if(p===0)await shot(page,stage+'-'+side+'-prompt-'+width+'x'+height);
     }
     // An unchanged drawing must never choose another side of the ball.
     const stable=await page.evaluate(()=>{qa.draw();const e=document.querySelector('#ballLabel'),before=[e.style.left,e.style.top];for(let i=0;i<30;i++)qa.draw();return JSON.stringify(before)===JSON.stringify([e.style.left,e.style.top])});
     check(stable,stage+' '+side+' stationary prompt does not oscillate '+width+'x'+height);
    }
   }
  }
  // Continuous actual updateGame steps: impact effects age normally and the
  // pursuit transition is reached through play, never by teleporting its flag.
  for(const side of ['front','back']){
   await go('?stage=million');await page.setViewportSize({width:390,height:844});
   await page.evaluate(side=>{qa.setMotion(true);qa.begin();if(side==='back')qa.driveUntil('back');window.__uiProbeBall=true;qa.draw()},side);
   for(let step=0;step<5;step++){
    if(step)await page.evaluate(()=>qa.tick(qa.state.duration*.2));
    await shot(page,'million-'+side+'-continuous-'+step+'-390x844');
    const d=await info(page),b=d.ballPixels;check(!!b&&b.count>5&&d.tip[0]>=b.x-4&&d.tip[0]<=b.right+4&&d.tip[1]>=b.y-4&&d.tip[1]<=b.bottom+4,'continuous '+side+' '+step+' label reaches raster ball',{pixels:b,tip:d.tip});
   }
  }
  await go('?stage=million');await page.evaluate(()=>{qa.setMotion(true);qa.begin();qa.driveUntil('done');qa.tick(1.6)});
  check(await page.evaluate(()=>qa.campaign.phase)==='inheritance','inheritance visual fixture reached');
  for(const [width,height] of [[320,568],[390,844],[568,320],[1024,768],[1101,719]]){
   await page.setViewportSize({width,height});await shot(page,'inheritance-'+width+'x'+height);const d=await info(page),caption=d.caption;
   check(!!caption&&d.heads.every(h=>overlap({x:caption.x-d.arena.x,y:caption.y-d.arena.y,right:caption.right-d.arena.x,bottom:caption.bottom-d.arena.y},h)<1),'inheritance caption clears faces '+width+'x'+height,d);
  }
  await page.evaluate(()=>qa.setMotion(false));reduced=await page.locator('.campaign-cinema>div').evaluate(e=>({animation:getComputedStyle(e).animationName,transition:getComputedStyle(e).transitionDuration}));check(reduced.animation==='none'&&reduced.transition.split(',').every(s=>parseFloat(s)===0),'effects OFF removes cinematic animation/transition',reduced);
  await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>qa.setMotion(true));reduced=await page.locator('.campaign-cinema>div').evaluate(e=>getComputedStyle(e).animationName);check(reduced==='none','system reduced-motion removes cinematic animation');
  }
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>localStorage.setItem('feg.campaign.v1',JSON.stringify({version:1,introComplete:true,acquired:['saku','sokichi','sumi','nagi','kota','luka'],wins:{},completed:false})));
  for(const [width,height] of VIEWPORTS){
   await go('?stage=gion');await page.setViewportSize({width,height});await page.evaluate(()=>{qa.setMotion(true);qa.draw()});
   const cardCamera=(await info(page)).camera;
   await page.evaluate(()=>{qa.start();qa.draw()});const initial=(await info(page)).camera;
   check(JSON.stringify(cardCamera)===JSON.stringify(initial),'GION card to gathering has no camera jump '+width+'x'+height,{cardCamera,initial});
   let previous=0;
   for(const time of [0,.35,.8,1.4,2,2.7,2.95,3.35,3.5,4.25]){
    await page.evaluate(dt=>qa.tick(dt),time-previous);previous=time;const d=await info(page);
    check(d.phase==='gather'&&d.orbs.length===7&&d.orbs.every(b=>b.x>=0&&b.y>=0&&b.right<=d.arena.w&&b.bottom<=d.arena.h),'all seven gathering orbs fit '+width+'x'+height+' @'+time,d);
    if(time===2)await shot(page,'gather-'+width+'x'+height);
    if(time===3.5){check(await page.evaluate(()=>__qaFrame.cpuVisible&&qa.campaign.godmode),'gather shadow follows godmode '+width+'x'+height);await shot(page,'gather-shadow-'+width+'x'+height);}
   }
   const before=(await info(page)).camera;await page.evaluate(()=>qa.tick(.1));const after=(await info(page)).camera;
   const delta=Math.max(...before.eye.map((v,i)=>Math.abs(v-after.eye[i])),...before.target.map((v,i)=>Math.abs(v-after.target[i])),Math.abs(before.zoom-after.zoom));
   check(delta<.15,'GION gathering to PRACTICE settles camera '+width+'x'+height,{delta,before,after});
  }
  await page.evaluate(()=>{qa.beginMatch();qa.state.mode='playing';qa.driveUntil('done');qa.tick(.85)});
  check(await page.evaluate(()=>qa.campaign.phase==='scatter'),'GION scattering fixture reached');
  for(const [width,height] of [[320,568],[390,844],[568,320],[844,390],[1024,768]]){
   await page.setViewportSize({width,height});await shot(page,'scatter-'+width+'x'+height);
   const d=await info(page),caption=d.caption;
   check(!!caption&&d.heads.every(h=>overlap({x:caption.x-d.arena.x,y:caption.y-d.arena.y,right:caption.right-d.arena.x,bottom:caption.bottom-d.arena.y},h)<1),'scatter caption clears faces '+width+'x'+height,d);
  }
  await page.locator('#cinemaSkip').click();await shot(page,'ending-1024x768');check(await page.locator('.campaign-end h2').textContent()==='THE END','ending immediately presents its destination');
  report.status=report.failures.length?'failed':'passed';console.log(JSON.stringify({status:report.status,checks:report.checks.length,screenshots:report.screenshots.length,failures:report.failures.slice(0,12)},null,2));if(report.failures.length)process.exitCode=1;
 }catch(e){report.status='failed';report.failures.push({name:'uncaught',message:e.message,stack:e.stack});console.error(e);process.exitCode=1;}
 finally{report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(OUT,'ui-polish-report.json'),JSON.stringify(report,null,2)+'\n');await browser?.close();}
}
main();
