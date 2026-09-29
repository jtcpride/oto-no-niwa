// Actual WebGL layout + lifecycle checks. Speech is mocked, not an acoustic acceptance test.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},resume(){},getVoices(){return []},speak(u){u.onstart?.()}}});});
 const html=require('./assemble.cjs')().replace('select(0);refreshHud();requestAnimationFrame(frame);',`window.feelTest={state,duelV022,feelV023,renderer,player,cpu,ball,audio,start,beginMatch,pause,kick,setMotion,updateScene,
 tick(dt){visualTime+=dt;updateGame(dt);updateScene(dt);},match(){state.mode='over';start();beginMatch();state.mode='playing';},
 hit(){select(0);resetFoot();state.target=0;state.pendingMiss=null;state.hitstop=0;launchShot('normal',-1,[3.3,1.2,0]);state.flight=state.duration;kick();},
 impact(){state.hitstop=0;state.flight=state.duration;updateGame(.001);updateScene(0);},
 settle(){for(let i=0;i<180&&['impact','break'].includes(duelV022.phase);i++){updateGame(1/60);updateScene(1/60);}},
 sample(p){state.flight=state.duration*p;updateScene(0);}
 };const renderTest=renderer.render.bind(renderer);renderer.render=function(r){renderTest(r);window.drawn={player:renderer.project([player.n.pos[0],3,player.n.pos[2]]),cpu:renderer.project([cpu.n.pos[0],3,cpu.n.pos[2]]),ball:renderer.project(ball.pos),eye:[...renderer.eye],zoom:renderer.zoom};};select(0);refreshHud();requestAnimationFrame(frame);`);
 await page.route('http://feel-layout.test/**',r=>r.fulfill({contentType:'text/html',body:html}));
 await page.goto('http://feel-layout.test/?stage=first-court');
 for(const [width,height] of [[320,568],[390,844],[568,320],[844,390],[768,1024],[1024,768]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>{feelTest.match();feelTest.updateScene(0);});
  for(let n=0;n<6;n++)await page.evaluate(()=>{feelTest.hit();feelTest.impact();feelTest.settle();});
  await page.evaluate(()=>feelTest.tick(.5));
  assert.equal(await page.evaluate(()=>kemari.getDuel().approach),1);
  for(const p of [.15,.5,.85,1]){
   await page.evaluate(p=>feelTest.sample(p),p);
   const boxes=await page.evaluate(()=>({drawn,arena:{w:document.querySelector('#arena').clientWidth,h:document.querySelector('#arena').clientHeight},buttons:[...document.querySelectorAll('[data-symbol],#kick')].map(b=>{const r=b.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})}));
   for(const key of ['player','cpu','ball']){const [x,y]=boxes.drawn[key];assert(x>=0&&x<=boxes.arena.w&&y>=0&&y<=boxes.arena.h,`${width}x${height} ${key} in frame at ${p}: ${x},${y}`);}
   for(const b of boxes.buttons)assert(b.x>=-1&&b.y>=-1&&b.x+b.w<=width+1&&b.y+b.h<=height+1&&b.w>=44&&b.h>=44,'reachable controls');
  }
  await page.evaluate(()=>{feelTest.hit();feelTest.tick(.35);});
  if([390,844,1024].includes(width))await page.screenshot({path:`../work/feel-charge-${width}.png`});
  await page.evaluate(()=>{feelTest.tick(.36);feelTest.tick(.29);feelTest.tick(.36);});
  for(let i=0;i<5;i++){await page.locator('#kick').dispatchEvent('pointerdown');await page.evaluate(()=>feelTest.tick(.1));}
  assert.equal(await page.evaluate(()=>kemari.getDuel().taps),5);
  assert(await page.evaluate(()=>document.querySelector('#duelWord').getBoundingClientRect().top>document.querySelector('#rally').getBoundingClientRect().bottom),'rush word clears HUD');
  if([390,844,1024].includes(width))await page.screenshot({path:`../work/feel-rush-${width}.png`});
  await page.evaluate(()=>feelTest.pause());const frozen=await page.evaluate(()=>JSON.stringify(kemari.getDuel()));await page.evaluate(()=>feelTest.tick(5));assert.equal(await page.evaluate(()=>JSON.stringify(kemari.getDuel())),frozen);await page.evaluate(()=>feelTest.pause());
  await page.evaluate(()=>{feelTest.tick(5);feelTest.tick(.86);feelTest.tick(1.3);});assert.equal(await page.evaluate(()=>kemari.getState().mode),'over');
 }
 // Real-time viewport rotation during a paused rush retains progress and resumes input.
 await page.evaluate(()=>{feelTest.match();feelTest.state.cpuHp=15;feelTest.hit();feelTest.tick(.71);feelTest.tick(.29);feelTest.tick(.4);feelTest.pause();});
 const rotation=await page.evaluate(()=>JSON.stringify(kemari.getDuel()));await page.setViewportSize({width:390,height:844});await page.evaluate(()=>feelTest.updateScene(0));assert.equal(await page.evaluate(()=>JSON.stringify(kemari.getDuel())),rotation);await page.evaluate(()=>feelTest.pause());await page.locator('#kick').dispatchEvent('pointerdown');assert.equal(await page.evaluate(()=>kemari.getDuel().taps),1);
 await page.evaluate(()=>{feelTest.match();feelTest.setMotion(false);feelTest.state.cpuHp=55;feelTest.hit();feelTest.impact();feelTest.tick(.61);});assert.equal(await page.evaluate(()=>kemari.getDuel().phase),'back');assert.equal(await page.evaluate(()=>drawn.zoom),1);
 await page.evaluate(()=>{feelTest.start();feelTest.updateScene(0);});assert.equal(await page.evaluate(()=>kemari.getDuel().phase),'front');assert.deepEqual(errors,[]);
 console.log('PASS real WebGL: 6 portrait/landscape layouts, close-range flights/heads/buttons in frame, pointer rush, pause, viewport rotation, victory, reduced motion, restart');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
