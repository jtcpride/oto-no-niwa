'use strict';
// Test-only start seam. Uses production update, inputs, poses, camera and rendering.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const assemble=require('./assemble.cjs'),{vmFixture,sourceSeam,VIEWPORTS}=require('./complete-browser-v030.cjs');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.env.FEG_RUSH_DIR||path.join(ROOT,'../work/rush-v0378'));
const ANCHOR='select(0);refreshHud();requestAnimationFrame(frame);';
const seam=String.raw`
window.rushQA={finalSounds:0,
 begin(effects=true){
  campaignV030.phase='match';campaignV030.intro=false;document.body.classList.remove('campaign-screen','campaign-cinematic');$('#campaignUI').hidden=true;$('#intro').hidden=true;$('#overlay').hidden=true;
  audio.userChoice=true;audio.set(false);state.mode='over';start();beginMatch();state.mode='playing';setMotion(effects);resetFoot();
  state.cpuHp=0;state.cpuDefeated=true;state.feedbackTime=0;$('#feedback').textContent='';
  duelV022.entered=true;duelV022.approach=1;duelV022.spacing=.47;
  for(const [key,x] of [['player',2.4],['cpu',-2.4]])Object.assign(strideV024[key],{x,from:x,to:x,age:99,attack:99});
  feelV023.recent=ACTIVE_DECK.sounds.flatMap(s=>s.words.map(w=>w.text)).slice(0,12);
  beginRushV022();this.finalSounds=0;refreshHud();updateScene(0);
 },
 tap(){document.querySelector('#kick').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));},
 edgeWords(){
  const failures=[];let cases=0;
  const words=STAGE_CONTENT.decks.flatMap(d=>d.sounds.flatMap(s=>s.words.map(w=>w.text)));
  for(const word of words)for(const index of [0,3,5,11]){
   wordsV025.forEach(w=>w.age=99);const w=wordsV025[0];w.age=0;w.index=index;w.e.textContent=word;barrageV025.serial=index+1;barrageV025.energy=1;updateScene(0);
   const r=w.e.getBoundingClientRect(),a=$('#arena').getBoundingClientRect(),h=$('.hud').getBoundingClientRect();cases++;
   if(r.left<a.left-1||r.right>a.right+1||r.top<h.bottom-1||r.bottom>a.bottom+1)failures.push({word,index,rect:[r.left-a.left,r.right-a.left,r.top-a.top,r.bottom-a.top],size:[a.width,a.height]});
  }
  return {cases,failures};
 },
 get data(){return {phase:duelV022.phase,time:duelV022.time,taps:duelV022.taps,barrage:{...barrageV025},glow:!glowV025.hidden,finish:finishBallV025.visible,words:wordsV025.filter(w=>!w.e.hidden).map(w=>w.e.textContent),finalSounds:this.finalSounds};},
 canonical(){return JSON.stringify([player,cpu].map(f=>[f.n.pos,f.n.rot,...KICK_NODES_V011.map(k=>[f[k].pos,f[k].rot]),f.characterV030.parts.map(n=>[n.color,n.unlit])]));},
};
const rushQAHit=audio.hit;audio.hit=function(...args){if(duelV022.phase==='settle')rushQA.finalSounds++;return rushQAHit.apply(this,args);};
const rushQARender=renderer.render.bind(renderer);renderer.render=function(scene){
 rushQARender(scene);rushQA.frame={cpu:[...cpu.n.pos],rotation:[...cpu.n.rot],center:typeof barrageV025.center==='undefined'?null:barrageV025.center,zoom:renderer.zoom,shake:[...renderer.shake],colors:cpu.characterV030.parts.map(n=>[...n.color]),size:[renderer.width,renderer.height]};
};
`;
// Older baseline lacks the new objects; the start seam remains identical.
function fixture(html,baseline=false){let source=seam;if(baseline)source=source.replace('glow:!glowV025.hidden,finish:finishBallV025.visible','glow:false,finish:false');return html.replace(ANCHOR,source+ANCHOR);}
const copy=x=>JSON.parse(JSON.stringify(x));
function vmChecks(){
 const results=[];
 for(const stage of ['jingu','gendo','chion','sanjo','shinkyogoku','million','gion'])for(const effects of [true,false]){
  const f=vmFixture(fixture(assemble()),{url:'http://feg-qa.test/?stage='+stage}),q=f.w.qa,r=f.w.rushQA;
  try{
   r.begin(effects);q.tick(.36);r.tap();assert.equal(r.data.barrage.energy,0,'input alone cannot charge light');q.tick(.29);assert.equal(r.data.barrage.hits,0);q.tick(.02);
   assert.equal(r.data.barrage.hits,effects?3:1,'count only landed balls');assert(r.data.barrage.energy>0);
   const paused=copy(r.data);q.pause();q.tick(1);assert.equal(r.data.time,paused.time);assert.equal(r.data.barrage.energy,paused.barrage.energy);q.pause();
   for(let i=0;i<25;i++){r.tap();q.tick(.1);}
   assert(r.data.barrage.energy<=1&&r.data.barrage.heat<=1);assert(r.data.words.length<=12);
   const canonical=r.canonical(),frame=copy(r.frame);for(let i=0;i<20;i++)q.draw();assert.equal(r.canonical(),canonical,'pose/color restoration');assert.deepEqual(copy(r.frame),frame,'redraw is stable');
   assert.equal(f.w.document.querySelectorAll('.rush-word-v025').length,12,'bounded word pool');
   if(!effects){assert.equal(r.data.glow,false);assert.equal(r.data.words.length,1);assert.deepEqual(copy(r.frame.shake),[0,0]);}
   while(r.data.phase==='rush')q.tick(1/60);
   assert.equal(r.data.phase,'settle');const taps=r.data.taps;r.tap();assert.equal(r.data.taps,taps,'settle ignores residual taps');
   q.tick(.2);assert(r.data.finish,'final ball in flight');assert.equal(r.data.finalSounds,0);q.pause();const held=copy(r.data);q.tick(1);assert.equal(r.data.time,held.time);q.pause();
   q.tick(.17);assert.equal(r.data.finalSounds,1,'one final impact');for(let i=0;i<10;i++)q.draw();assert.equal(r.data.finalSounds,1,'render never plays sound');
   q.tick(.5);assert.equal(r.data.phase,'done');assert.equal(r.data.glow,false);assert.equal(r.data.finish,false);assert.equal(r.data.finalSounds,1);
   r.begin(effects);assert.equal(r.data.barrage.hits,0);assert.equal(r.data.barrage.energy,0);assert.equal(r.data.words.length,0);assert.equal(r.data.glow,false);
   q.tick(6.3);assert.equal(r.data.phase,'done','zero taps still completes');assert.equal(r.data.taps,0);assert.equal(r.data.finalSounds,1);
   assert.deepEqual(f.errors,[]);results.push({stage,effects,passed:true});console.log('PASS rush '+stage+' effects='+effects);
  }finally{f.close();}
 }
 fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'vm.json'),JSON.stringify({passed:true,results,limitations:'VM geometry/lifecycle, not GPU, audible sound or physical-device acceptance'},null,2));
 console.log('PASS rush: '+results.length+' stage/effects cases; landing, pause, pools, restoration, final impact, retry and zero taps');
}
async function browserChecks(){
 const {chromium}=require('playwright');fs.mkdirSync(OUT,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),errors=[],checks=[];
 try{
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{let seed=42731;Math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);window.__nativeRAF=requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0;window.fetch=undefined;Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},resume(){},getVoices:()=>[],speak(u){u.onstart?.();u.onend?.();}}});});
  const variants={after:sourceSeam(fixture(assemble()))};
  if(process.argv.includes('--capture'))variants.before=sourceSeam(fixture(fs.readFileSync(process.env.FEG_RUSH_BASELINE||path.join(OUT,'before.html'),'utf8'),true));
  await page.route('http://rush.test/**',r=>r.fulfill({contentType:'text/html',body:variants[new URL(r.request().url()).searchParams.get('variant')||'after']}));
  async function begin(stage,width,height,variant='after'){await page.setViewportSize({width,height});await page.goto('http://rush.test/?stage='+stage+'&variant='+variant);await page.waitForFunction(()=>window.qa);await page.evaluate(()=>{rushQA.begin();qa.tick(.36);});}
  for(const [width,height] of VIEWPORTS){
   await begin('jingu',width,height);
   const edges=await page.evaluate(()=>rushQA.edgeWords());assert.deepEqual(edges.failures,[],'all deck words at full entry scale '+width+'x'+height);checks.push({width,height,entryWordCases:edges.cases});await page.evaluate(()=>{rushQA.begin();qa.tick(.36);});
   for(const step of [0,1,2]){
    await page.evaluate(()=>{for(let i=0;i<12;i++){rushQA.tap();qa.tick(.1);}});
    const layout=await page.evaluate(()=>{
     const arena=document.querySelector('#arena').getBoundingClientRect(),hud=document.querySelector('.hud').getBoundingClientRect();
     return {words:[...document.querySelectorAll('.rush-word-v025')].filter(e=>!e.hidden).map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent,left:r.left-arena.left,right:r.right-arena.left,top:r.top-arena.top,bottom:r.bottom-arena.top}}),width:arena.width,height:arena.height,hud:Math.max(0,hud.bottom-arena.top),data:rushQA.data,frame:rushQA.frame};
    });
    for(const w of layout.words){assert(w.left>=-1&&w.right<=layout.width+1&&w.bottom<=layout.height+1&&w.top>=layout.hud-1,'clipped/HUD-covered word '+JSON.stringify({width,height,...w,arena:layout}));}
    assert(layout.words.length<=12);checks.push({width,height,step,wordCount:layout.words.length});
   }
   await page.screenshot({path:path.join(OUT,'rush-'+width+'x'+height+'.png')});
   await page.evaluate(()=>{while(qa.duel.phase==='rush')qa.tick(1/60);qa.tick(.46);});
   await page.screenshot({path:path.join(OUT,'finish-'+width+'x'+height+'.png')});
  }
  for(const stage of ['gendo','chion','sanjo','shinkyogoku','million','gion']){
   await begin(stage,960,640);await page.evaluate(()=>{for(let i=0;i<35;i++){rushQA.tap();qa.tick(.1);}});await page.screenshot({path:path.join(OUT,'rush-'+stage+'.png')});
   checks.push({stage,render:await page.evaluate(()=>{qa.draw();return qa.renderStats();})});
  }
  if(process.argv.includes('--capture'))for(const variant of ['before','after']){
   await begin('jingu',960,640,variant);const {spawn}=require('node:child_process');const encoder=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate','30','-vcodec','png','-i','-','-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p',path.join(OUT,variant+'.mp4')],{stdio:['pipe','ignore','inherit']});
   await page.evaluate(()=>rushQA.begin());
   for(let frame=0;frame<204;frame++){
    await page.evaluate(frame=>{if(frame>=12&&frame<160&&frame%3===0)rushQA.tap();qa.tick(1/30);},frame);
    const png=await page.screenshot();if(!encoder.stdin.write(png))await new Promise(resolve=>encoder.stdin.once('drain',resolve));
   }
   encoder.stdin.end();await new Promise((resolve,reject)=>{encoder.once('error',reject);encoder.once('close',code=>code===0?resolve():reject(Error('ffmpeg '+code)));});
   console.log('CAPTURE '+variant+' 204 frames at 30 fps, muted');
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify({passed:true,checks,errors,limitations:'Actual Mac Chrome rendering; scene start injected; muted/mock voice; physical iPhone/iPad untested'},null,2));console.log('PASS rush browser: '+checks.length+' viewport/stage checks');
 }finally{await browser.close();}
}
module.exports={fixture};
if(require.main===module){if(process.argv.includes('--browser'))browserChecks().catch(e=>{console.error(e);process.exitCode=1;});else vmChecks();}
