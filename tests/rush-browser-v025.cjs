// Real Chrome/WebGL barrage tests. TTS is mocked; no audible-speech acceptance claim.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../../work');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1024,height:768}}),errors=[],layouts=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;window.__spoken=[];window.__cancels=0;Object.defineProperty(window,'speechSynthesis',{value:{cancel(){__cancels++},resume(){},getVoices(){return []},speak(u){__spoken.push(u.text);u.onstart?.()}}});});
  const seam=`window.rushTest={SOUNDS,state,duelV022,strideV024,barrageV025,wordsV025,rushBallsV022,renderer,updateScene,pause,start,setMotion,
   tick(dt){visualTime+=dt;updateGame(dt);updateScene(dt)},
   setup(motionOn=true){setMotion(motionOn);state.mode='over';start();beginMatch();state.mode='playing';for(let i=0;i<16;i++)newQuestion();beginDepthV022();updateGame(2.66);state.cpuHp=0;state.cpuDefeated=true;beginRushV022();this.tick(.36)},
   snapshot(){return {slots:strideV024.player.slot,attack:strideV024.player.attack,serial:barrageV025.serial,technique:barrageV025.technique,taps:duelV022.taps,phase:duelV022.phase,words:wordsV025.map(w=>({age:w.age,index:w.index,text:w.e.textContent,hidden:w.e.hidden,opacity:w.e.style.opacity})),balls:rushBallsV022.filter(b=>b.n.visible).map(b=>({age:b.age,from:b.volley?.from,to:b.volley?.to,pos:[...b.n.pos]}))}}
  };const renderRush=renderer.render.bind(renderer);renderer.render=function(root){renderRush(root);window.rushDrawn=rushBallsV022.filter(b=>b.n.visible).map(b=>({age:b.age,from:b.volley?.from,to:b.volley?.to,pos:[...b.n.pos]}));};select(0);refreshHud();requestAnimationFrame(frame);`;
  const html=require('./assemble.cjs')().replace('select(0);refreshHud();requestAnimationFrame(frame);',seam);
  await page.route('http://rush.test/**',r=>r.fulfill({contentType:'text/html',body:html}));await page.goto('http://rush.test/?stage=first-court');
  const tap=async()=>{await page.locator('#kick').dispatchEvent('pointerdown');await page.evaluate(()=>rushTest.updateScene(0));};
  await page.evaluate(()=>rushTest.setup());await tap();
  const single=await page.evaluate(()=>rushTest.snapshot());assert.equal(single.balls.length,3);assert.equal(new Set(single.balls.map(b=>JSON.stringify(b.from))).size,3,'three distinct source positions');
  assert(single.balls.every(b=>Math.abs(b.to[0]-single.balls[0].to[0])<1e-9&&b.to[1]>=1&&b.to[1]<=1.96),'volley converges around enemy');
  await page.evaluate(()=>rushTest.tick(.29));assert.equal(await page.evaluate(()=>rushTest.wordsV025[0].e.style.opacity),'1','hold through 290ms');
  await page.evaluate(()=>rushTest.tick(.135));assert(Math.abs(await page.evaluate(()=>Number(rushTest.wordsV025[0].e.style.opacity))-.5)<1e-8,'half opacity at 425ms');
  await page.evaluate(()=>rushTest.tick(.126));assert.equal(await page.evaluate(()=>rushTest.wordsV025[0].e.hidden),true,'hidden after 550ms');
  await page.evaluate(()=>rushTest.setup());const slots=[];
  for(let i=0;i<12;i++){await tap();slots.push(await page.evaluate(()=>rushTest.strideV024.player.slot));await page.evaluate(()=>rushTest.tick(.1));}
  assert.deepEqual(slots.slice(0,8),[0,0,1,1,2,2,3,3],'100ms tapping cycles four techniques without alias');
  assert.equal(await page.evaluate(()=>rushTest.wordsV025.length),12);assert.equal(await page.evaluate(()=>rushTest.barrageV025.serial),12);
  const active=await page.evaluate(()=>[...document.querySelectorAll('.rush-word-v025')].filter(e=>!e.hidden).map(e=>[e.style.left,e.style.top]));assert(active.length>=4);assert.equal(new Set(active.map(x=>x.join(','))).size,active.length,'live words occupy separate positions');
  await page.screenshot({path:path.join(out,'rush-v025-barrage.png')});
  await page.evaluate(()=>{rushTest.pause();rushTest.updateScene(0)});const frozen=await page.evaluate(()=>JSON.stringify(rushTest.snapshot()));await page.evaluate(()=>rushTest.tick(1));await tap();assert.equal(await page.evaluate(()=>JSON.stringify(rushTest.snapshot())),frozen,'pause freezes ages/projectiles/techniques and rejects taps');
  await page.evaluate(()=>{rushTest.pause();rushTest.updateScene(0)});assert(await page.evaluate(()=>rushTest.wordsV025.some(w=>!w.e.hidden)),'resume restores live words');
  await page.evaluate(()=>{rushTest.start();rushTest.updateScene(0)});assert(await page.evaluate(()=>rushTest.wordsV025.every(w=>w.e.hidden)&&rushTest.barrageV025.serial===0&&rushTest.rushBallsV022.every(b=>!b.n.visible)),'restart clears barrage');
  await page.evaluate(()=>rushTest.setup(false));await tap();assert.equal(await page.evaluate(()=>rushTest.rushBallsV022.filter(b=>b.n.visible).length),1);assert.equal(await page.evaluate(()=>rushTest.wordsV025.filter(w=>!w.e.hidden).length),1);await page.screenshot({path:path.join(out,'rush-v025-reduced-motion.png')});
  for(const [width,height] of [[320,568],[390,844],[568,320],[844,390],[768,1024],[1024,768]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>rushTest.setup());
   for(let i=0;i<12;i++){await tap();await page.evaluate(()=>rushTest.tick(.1));}
   const boxes=await page.evaluate(()=>{const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,text:e.textContent}};return {arena:box(document.querySelector('#arena')),hudBottom:Math.max(...['#hpTrack','#cpuHpTrack','#rally'].map(s=>document.querySelector(s).getBoundingClientRect().bottom)),words:[...document.querySelectorAll('.rush-word-v025')].filter(e=>!e.hidden).map(box),buttons:[...document.querySelectorAll('[data-symbol],#kick')].map(box),kick:box(document.querySelector('#kick')),kickLabels:[...document.querySelectorAll('#kick span,#kick small')].map(box)};});
   const issues=[];
   const sweep=await page.evaluate(()=>{const result=[];const word=rushTest.wordsV025[0];for(const text of rushTest.SOUNDS.flatMap(s=>s.words))for(let index=0;index<12;index++){rushTest.wordsV025.forEach(w=>w.age=99);Object.assign(word,{age:.30,index});rushTest.barrageV025.serial=index+1;word.e.textContent=text;rushTest.updateScene(0);const r=word.e.getBoundingClientRect();result.push({index,text,x:r.x,y:r.y,w:r.width,h:r.height});}return result;});
   for(const b of sweep){const a=boxes.arena;if(b.x<a.x||b.y<a.y||b.x+b.w>a.x+a.w||b.y+b.h>a.y+a.h)issues.push('pool-position word clipped: '+b.index+' '+b.text);if(b.y<boxes.hudBottom)issues.push('pool-position HUD overlap: '+b.index+' '+b.text);}
   await page.evaluate(()=>rushTest.setup());for(let i=0;i<12;i++){await tap();await page.evaluate(()=>rushTest.tick(.1));}
   for(const b of boxes.words){const a=boxes.arena;if(b.x<a.x||b.y<a.y||b.x+b.w>a.x+a.w||b.y+b.h>a.y+a.h)issues.push('word clipped: '+b.text);if(b.y<boxes.hudBottom)issues.push('word overlaps HUD: '+b.text);}
   for(const b of boxes.buttons)if(b.x<-1||b.y<-1||b.x+b.w>width+1||b.y+b.h>height+1)issues.push('button clipped: '+b.text);
   for(const b of boxes.kickLabels){const k=boxes.kick;if(b.x<k.x||b.y<k.y||b.x+b.w>k.x+k.w||b.y+b.h>k.y+k.h)issues.push('kick label overflows button: '+b.text);}
   layouts.push({width,height,issues,boxes});await page.screenshot({path:path.join(out,`rush-v025-${width}x${height}.png`)});
  }
  fs.writeFileSync(path.join(out,'rush-v025-browser.json'),JSON.stringify({slots,single,layouts,errors},null,2));
  assert.deepEqual(errors,[]);assert.deepEqual(layouts.flatMap(l=>l.issues.map(i=>l.width+'x'+l.height+' '+i)),[]);
  console.log('PASS real WebGL: 3-ball converging volley, four fast-tap techniques, 12-word pool/550ms lifetime/300ms hold/250ms fade, distinct positions, pause/resume/restart, reduced motion, six layouts');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
