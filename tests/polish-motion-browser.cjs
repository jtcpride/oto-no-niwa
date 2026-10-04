// Presentation geometry + before/after gameplay equality. Sound is disabled in this fixture; real clip playback is verified separately.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../../work');fs.mkdirSync(out,{recursive:true});
const baseline=require('./assemble.cjs')(file=>require('node:child_process').execFileSync('git',['show','bd4b4e4877f167dc7544b3ac57a6690f98e6d968:'+file],{cwd:path.resolve(__dirname,'..'),encoding:'utf8',maxBuffer:4*1024*1024}));
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const seam=`audio.enabled=false;audio.userChoice=true;window.mt={state,player,cpu,ball,shadow,renderer,strideV024,duelV022,closeV027,rushBallsV022,dramaV028,beginRushV022,pause,start,setMotion,launchShot,select,kick,beginTimePass,
 tick(s){for(let t=0;t<s-.00001;t+=1/60){const dt=Math.min(1/60,s-t);if(state.mode!=='paused')visualTime+=dt;updateGame(dt);updateScene(dt)}},
 setup(slot=0,back=false){state.mode='over';start();beginMatch();state.mode='playing';resetFoot();select(slot);if(back){duelV022.entered=true;duelV022.phase='back';Object.assign(strideV024.player,{x:0,from:0,to:0,age:99});Object.assign(strideV024.cpu,{x:0,from:0,to:0,age:99});}state.target=slot;state.word=PRACTICE_SET[slot].word;launchShot('normal',-1,[3.3,1.2,0]);state.hitstop=0;state.flight=state.duration;strideV024.cpu.attack=99;if(typeof motionV029!=='undefined')motionV029.cpu.age=99;updateScene(0)},
 draw(){updateScene(0)},
 rules(){return {duration:state.duration,arc:state.arc,pendingDamage:state.pendingDamage,hp:state.hp,cpuHp:state.cpuHp,rally:state.rally,perfect:state.perfect,hit:CONFIG.hitWindow,perfectWindow:CONFIG.perfectWindow,samples:[0,.25,.5,.75,1].map(t=>sampleBall(t))}},
 roots(){return JSON.stringify([player.n.pos,player.n.rot,cpu.n.pos,cpu.n.rot,player.body.pos,player.body.rot,cpu.body.pos,cpu.body.rot,ball.scale,shadow.scale,...KICK_NODES_V011.map(k=>[player[k].pos,player[k].rot,cpu[k].pos,cpu[k].rot])])},
 getMotion(){return typeof motionV029==='undefined'?null:{...motionV029,impacts:impactsV029.map(p=>({point:p.point,kind:p.kind,age:p.age,duration:p.duration,hidden:p.e.hidden}))}},
 drive(phase){for(let i=0;i<12000&&duelV022.phase!==phase;i++){if(['front','back'].includes(duelV022.phase)&&state.direction===-1&&state.flight>=state.duration-.01){document.querySelector('[data-symbol="'+state.target+'"]').click();document.querySelector('#kick').dispatchEvent(new PointerEvent('pointerdown'));}this.tick(1/60)}if(duelV022.phase!==phase)throw Error('No '+phase)}
 };const drawMotion=renderer.render.bind(renderer);renderer.render=function(root){drawMotion(root);window.motionDrawn={ball:[...ball.pos],scale:[...ball.scale],playerNodes:Object.fromEntries(KICK_NODES_V011.map(k=>[k,[...player[k].rot]])),cpuNodes:Object.fromEntries(KICK_NODES_V011.map(k=>[k,[...cpu[k].rot]]))};};select(0);refreshHud();`;
 const results={},pages={};
 for(const version of ['before','after']){
  const page=await browser.newPage({viewport:{width:1024,height:768}});pages[version]=page;
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},resume(){},getVoices(){return []},speak(){}}});});
  const original=version==='before'?baseline:require('./assemble.cjs')();
  await page.route('http://motion.test/**',r=>r.fulfill({contentType:'text/html',body:original.replace('select(0);refreshHud();requestAnimationFrame(frame);',seam)}));await page.goto('http://motion.test/?stage=jingu');
  results[version]=[];
  for(const back of [false,true])for(let slot=0;slot<4;slot++){
   await page.evaluate(({slot,back})=>{mt.setup(slot,back);mt.kick();mt.draw()}, {slot,back});
   results[version].push(await page.evaluate(()=>mt.rules()));
   if(version==='after'){
    const contact=await page.evaluate(()=>mt.getMotion().contactFoot);assert.equal(contact.side,'player');assert(Math.hypot(...contact.foot.map((v,i)=>v-contact.point[i]))<.10,'normal ball contact at launch');
    assert(await page.evaluate(()=>motionDrawn.playerNodes.elbow[2]>.5&&motionDrawn.playerNodes.farElbow[2]>.5&&Math.abs(motionDrawn.playerNodes.toe[2])>.1),'elbows and toes articulate during kicks');
   }
   await page.evaluate(()=>mt.tick(.18));await page.screenshot({path:path.join(out,`polish-motion-${version}-${back?'back':'front'}-${slot}.png`)});
   const roots=await page.evaluate(()=>mt.roots());await page.evaluate(()=>{for(let n=0;n<30;n++)mt.draw()});assert.equal(await page.evaluate(()=>mt.roots()),roots,'no render accumulation');
  }
 }
 assert.deepEqual(results.after,results.before,'all flight samples, durations, windows, damage and success counts unchanged');
 const page=pages.after;const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(let slot=0;slot<4;slot++){
  await page.evaluate(slot=>{mt.setup();mt.state.rally=slot;mt.launchShot('normal',-1,[3.3,1.2,0]);mt.draw()},slot);const cpuContact=await page.evaluate(()=>mt.getMotion().contactFoot);assert.equal(cpuContact.side,'cpu');assert(Math.hypot(...cpuContact.foot.map((v,i)=>v-cpuContact.point[i]))<.10,'CPU contacts its launched ball');
  await page.evaluate(()=>mt.tick(.18));await page.screenshot({path:path.join(out,'polish-motion-cpu-'+slot+'.png')});
 }
 await page.evaluate(()=>{mt.setup();mt.beginTimePass();mt.tick(.12)});assert(await page.evaluate(()=>motionDrawn.cpuNodes.leg.some(v=>Math.abs(v)>.1)),'TIME keeps the CPU pass motion');
 // Pause also freezes the new effect pool and spin, then restart clears it.
 await page.evaluate(()=>{mt.setup(1);mt.kick();mt.tick(.12);mt.pause();mt.draw()});const frozen=await page.evaluate(()=>JSON.stringify([mt.getMotion(),mt.ball.rot,motionDrawn]));await page.evaluate(()=>{mt.tick(2);for(let i=0;i<20;i++)mt.draw()});assert.equal(await page.evaluate(()=>JSON.stringify([mt.getMotion(),mt.ball.rot,motionDrawn])),frozen);
 await page.evaluate(()=>{mt.start();mt.draw()});assert(await page.evaluate(()=>mt.getMotion().impacts.every(p=>p.hidden)&&mt.getMotion().serial===0));
 for(const [width,height] of [[320,568],[390,844],[568,320],[844,390],[768,1024],[1024,768]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>{mt.setup(2);mt.kick();mt.tick(.10)});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:path.join(out,`polish-motion-${width}x${height}.png`)});
 }
 // Reach close through normal match play: no answer reveal, shared target intact.
 await page.evaluate(()=>{mt.setup();mt.drive('close');mt.tick(1.2)});assert.equal(await page.locator('.close-point.correct').count(),0);
 await page.evaluate(()=>{document.querySelector('[data-symbol="'+mt.closeV027.target+'"]').click();mt.tick(.24)});
 const cue=await page.evaluate(()=>mt.getMotion().impacts.find(p=>p.age<.10&&p.kind==='guard'));assert(cue);const shared=await page.evaluate(()=>mt.dramaV028.contact);assert(Math.hypot(...cue.point.map((v,i)=>v-shared[i]))<.12,'guard effect stays at the contact as the receiver recoils');
 await page.screenshot({path:path.join(out,'polish-motion-guard.png')});
 // Actual volley crossings make effects at the saved endpoints, not a generic point.
 await page.evaluate(()=>{mt.setup(0,true);mt.state.cpuHp=0;mt.beginRushV022();mt.tick(.36);mt.kick();mt.draw()});const endpoints=await page.evaluate(()=>mt.rushBallsV022.filter(b=>b.n.visible).map(b=>b.volley.to));await page.evaluate(()=>mt.tick(.31));const hits=await page.evaluate(()=>mt.getMotion().impacts.filter(p=>p.kind==='hit'&&p.age<.03));assert.equal(hits.length,3);hits.forEach(h=>assert(endpoints.some(p=>JSON.stringify(p)===JSON.stringify(h.point))));
 for(let i=0;i<30;i++)await page.evaluate(()=>{mt.kick();mt.tick(.10)});assert.equal(await page.evaluate(()=>mt.getMotion().impacts.length),10,'bounded contact pool');await page.screenshot({path:path.join(out,'polish-motion-rush.png')});
 await page.evaluate(()=>{mt.setMotion(false);mt.setup();mt.kick();mt.tick(.10)});assert(await page.evaluate(()=>mt.getMotion().impacts.every(p=>p.hidden)));assert.deepEqual(await page.evaluate(()=>motionDrawn.scale),[1,1,1]);
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'polish-motion-rules-comparison.json'),JSON.stringify(results,null,2));
 console.log('PASS polish: unchanged rally rules/8 shot geometries, launch contact both sides, pose restoration, freeze/reset, six layouts, guard/rush endpoint effects, bounded pool and effects OFF');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
