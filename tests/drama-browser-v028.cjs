const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;window.__spoken=[];Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},resume(){},getVoices(){return []},speak(u){__spoken.push(u.text)}}});});
 const html=require('./assemble.cjs')().replace('select(0);refreshHud();requestAnimationFrame(frame);',`window.dt={state,duelV022,closeV027,dramaV028,player,cpu,pause,start,setMotion,
 tick(s){for(let t=0;t<s-.000001;t+=1/60){const d=Math.min(1/60,s-t);if(state.mode!=='paused')visualTime+=d;updateGame(d);updateScene(d)}},
 match(){state.mode='over';start();beginMatch();state.mode='playing';},
 drive(phase){for(let n=0;n<12000&&duelV022.phase!==phase;n++){if(['front','back'].includes(duelV022.phase)&&state.direction===-1&&state.flight>=state.duration-.01){document.querySelector('[data-symbol="'+state.target+'"]').click();document.querySelector('#kick').dispatchEvent(new PointerEvent('pointerdown'));}this.tick(1/60)}if(duelV022.phase!==phase)throw Error('No '+phase);},
 answer(ok){document.querySelector('[data-symbol="'+((closeV027.target+(ok?0:1))%4)+'"]').click();},
 roots(){return JSON.stringify([player.n.pos,player.n.rot,cpu.n.pos,cpu.n.rot,player.body.pos,player.body.rot,cpu.body.pos,cpu.body.rot])},
 draw(){updateScene(0)}
 };const renderDramaTest=renderer.render.bind(renderer);renderer.render=function(r){renderDramaTest(r);window.dramaDrawn={phase:duelV022.phase,time:duelV022.time,eye:[...renderer.eye],player:renderer.project([player.n.pos[0],player.n.pos[1]+2.8,player.n.pos[2]]),cpu:renderer.project([cpu.n.pos[0],cpu.n.pos[1]+2.8,cpu.n.pos[2]]),roots:[...player.n.pos,...cpu.n.pos]};};select(0);refreshHud();`);
 await page.route('http://drama.test/**',r=>r.fulfill({contentType:'text/html',body:html}));await page.goto('http://drama.test/');
 for(const [width,height] of [[320,568],[390,844],[568,320],[844,390],[768,1024],[1024,768]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>{dt.match();dt.drive('breakCharge')});assert.equal(await page.evaluate(()=>dt.state.cpuHp),55,'damage waits for impact');
  await page.evaluate(()=>dt.pause());const stopped=await page.evaluate(()=>JSON.stringify([dt.duelV022.time,dt.state.flight]));await page.evaluate(()=>dt.tick(1));assert.equal(await page.evaluate(()=>JSON.stringify([dt.duelV022.time,dt.state.flight])),stopped);await page.evaluate(()=>dt.pause());
  await page.evaluate(()=>dt.tick(.71));assert.equal(await page.evaluate(()=>dt.duelV022.phase),'breakShot');await page.evaluate(()=>dt.tick(.31));assert.equal(await page.evaluate(()=>dt.state.cpuHp),40);assert.equal(await page.evaluate(()=>dt.duelV022.phase),'break');
  let previous=0;for(const t of [.2,.65,1.2,2,2.8,3.3]){await page.evaluate(d=>dt.tick(d),t-previous);previous=t;
   const box=await page.locator('#arena').boundingBox(),d=await page.evaluate(()=>dramaDrawn);for(const who of ['player','cpu'])assert(d[who][0]>=0&&d[who][0]<=box.width&&d[who][1]>=0&&d[who][1]<=box.height,JSON.stringify({width,height,t,who,d,box}));
   if(t===1.2){assert(d.eye[0]<-10,'camera orbits behind pursuit');await page.screenshot({path:`../work/drama-v028-chase-${width}x${height}.png`});}
  }
  await page.evaluate(()=>dt.tick(.12));assert.equal(await page.evaluate(()=>dt.duelV022.phase),'back');assert(await page.evaluate(()=>dt.state.duration>=1.85));assert.equal(await page.evaluate(()=>dt.state.cpuHp),40,'no duplicate transition damage');
  await page.evaluate(()=>{dt.drive('close');dt.tick(1.2)});
  for(const [i,ok] of [true,true,false,false].entries()){
   assert.equal(await page.locator('.close-point.correct').count(),0);await page.evaluate(ok=>{dt.answer(ok);dt.tick(.24)},ok);
   const error=await page.evaluate(()=>Math.hypot(...dt.dramaV028.foot.map((v,i)=>v-dt.dramaV028.contact[i])));assert(error<.05,'foot meets IPA target: '+error);
   const guarded=await page.evaluate(()=>dt.dramaV028.guard);assert.equal(guarded,i===0||i===3);
   const positions=await page.locator('.close-point').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]}));positions.forEach(r=>assert(r[0]>=0&&r[1]>=0&&r[0]+r[2]<=width&&r[1]+r[3]<=height));
   if(width===844||width===390)await page.screenshot({path:`../work/drama-v028-contact-${width}-${i}.png`});
   const roots=await page.evaluate(()=>dt.roots());await page.evaluate(()=>{for(let n=0;n<30;n++)dt.draw()});assert.equal(await page.evaluate(()=>dt.roots()),roots,'no accumulated reaction transforms');
   await page.evaluate(()=>dt.tick(.9));
  }
  assert.equal(await page.evaluate(()=>dt.closeV027.stage),'lose');await page.evaluate(()=>dt.start());assert.equal(await page.locator('.close-point:not([hidden])').count(),0);
 }
 // Geometry coverage supplements the natural-play paths above: all four targets,
 // attack/defense, hit/block, and effects OFF use the same foot / marker world point.
 for(const enabled of [true,false]){
  await page.setViewportSize({width:390,height:844});await page.evaluate(enabled=>{dt.setMotion(enabled);dt.match();dt.drive('close');dt.tick(1.2)},enabled);
  for(const turn of [0,1])for(const correct of [true,false])for(let slot=0;slot<4;slot++){
   await page.evaluate(({turn,correct,slot})=>{Object.assign(dt.closeV027,{stage:'react',turn,correct,target:slot,picked:slot,time:.24});dt.draw()}, {turn,correct,slot});
   const error=await page.evaluate(()=>Math.hypot(...dt.dramaV028.foot.map((v,i)=>v-dt.dramaV028.contact[i])));assert(error<.05,JSON.stringify({enabled,turn,correct,slot,error}));
  }
 }
 await page.evaluate(()=>{dt.setMotion(false);dt.match();dt.drive('breakCharge');dt.tick(.71);dt.tick(.31);dt.tick(.61)});assert.equal(await page.evaluate(()=>dt.duelV022.phase),'back');
 assert.deepEqual(errors,[]);console.log('PASS: charge/impact once, 6 pursuit views, behind camera, safe return speed, hit/guard distinction, markers, transform restoration, pause/restart, effects OFF');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
