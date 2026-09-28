const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),assemble=require('./assemble.cjs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1024,height:768}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;window.__spoken=[];window.__cancelCount=0;Object.defineProperty(window,'speechSynthesis',{value:{cancel(){__cancelCount++},resume(){},getVoices(){return []},speak(u){__spoken.push(u);u.onstart?.()}}})});
  const seam=`window.duelTest={state,duelV022,player,cpu,ball,shadow,renderer,start,beginMatch,kick,updateGame,updateScene,select,pause,
   tick(dt){visualTime+=dt;updateGame(dt);updateScene(dt)},
   match(){state.mode='over';start();beginMatch();state.mode='playing';},
   hit(){select(0);resetFoot();state.mode='playing';state.target=0;state.pendingMiss=null;state.hitstop=0;launchShot('normal',-1,[3.3,1.2,0]);state.flight=state.duration;kick();},
   impact(){state.hitstop=0;state.flight=state.duration;updateGame(.001);updateScene(0)}
  };select(0);refreshHud();requestAnimationFrame(frame);`;
  const html=assemble().replace('select(0);refreshHud();requestAnimationFrame(frame);',seam);
  await page.route('http://depth.test/**',r=>r.fulfill({contentType:'text/html',body:html}));
  await page.goto('http://depth.test/?stage=second-court');
  await page.evaluate(()=>{const g=duelTest,render=g.renderer.render.bind(g.renderer);g.renderer.render=root=>{render(root);window.renderedDepth={cpu:g.renderer.project(g.cpu.n.pos),width:g.renderer.width,ball:[...g.ball.pos],shadow:[...g.shadow.pos]}}});
  await page.evaluate(()=>{duelTest.match();duelTest.updateScene(0)});await page.screenshot({path:'../work/depth-front.png'});
  await page.evaluate(()=>{duelTest.state.cpuHp=55;duelTest.hit();duelTest.impact();duelTest.tick(.9)});
  assert.equal(await page.evaluate(()=>kemari.getDuel().phase),'break');assert(await page.evaluate(()=>renderedDepth.cpu[0]>20&&renderedDepth.cpu[0]<renderedDepth.width-20),'tumbling opponent stays in frame');await page.screenshot({path:'../work/depth-turn.png'});
  await page.evaluate(()=>duelTest.tick(1.31));assert.equal(await page.evaluate(()=>kemari.getDuel().phase),'back');assert(await page.evaluate(()=>Math.abs(renderedDepth.ball[2]-renderedDepth.shadow[2])<1e-9),'ball and shadow share depth');await page.screenshot({path:'../work/depth-back.png'});
  await page.evaluate(()=>{duelTest.hit();duelTest.impact();duelTest.tick(.5)});const spacing=await page.evaluate(()=>kemari.getDuel().spacing);assert(spacing<1.12);
  await page.evaluate(()=>{duelTest.state.cpuHp=15;duelTest.hit();duelTest.tick(.35)});assert.equal(await page.evaluate(()=>kemari.getDuel().phase),'charge');await page.screenshot({path:'../work/depth-charge.png'});
  await page.evaluate(()=>{duelTest.tick(.36);duelTest.tick(.29)});assert.equal(await page.evaluate(()=>kemari.getDuel().phase),'rush');
  for(let i=0;i<10;i++){await page.locator('#kick').dispatchEvent('pointerdown');await page.evaluate(()=>duelTest.tick(.06));}
  assert.equal(await page.evaluate(()=>kemari.getDuel().taps),10);await page.screenshot({path:'../work/depth-rush.png'});
  for(const [width,height] of [[390,844],[844,390]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>duelTest.updateScene(0));
   const b=await page.locator('#kick').boundingBox();assert(b.x>=0&&b.y>=0&&b.x+b.width<=width&&b.y+b.height<=height);
   await page.screenshot({path:`../work/depth-rush-${width}.png`});
  }
  await page.evaluate(()=>duelTest.pause());const before=await page.evaluate(()=>kemari.getDuel());await page.evaluate(()=>duelTest.tick(2));assert.deepEqual(await page.evaluate(()=>kemari.getDuel()),before);await page.evaluate(()=>duelTest.pause());
  await page.evaluate(()=>duelTest.tick(4.41));assert.equal(await page.evaluate(()=>duelTest.state.mode),'finishing');
  const voice=await page.evaluate(()=>({words:__spoken.map(u=>u.text),cancels:__cancelCount}));assert.equal(voice.words.at(-1),'Shobu ari!');assert(voice.cancels>=10);
  await page.evaluate(()=>{duelTest.tick(1.3);duelTest.start();duelTest.updateScene(0)});assert.equal(await page.evaluate(()=>kemari.getDuel().phase),'front');
  assert.deepEqual(errors,[]);console.log('PASS browser: depth orbit, back court, approach, charge/shot, 10 pointer taps, rush layouts, pause, win, restart');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
