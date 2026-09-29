// Actual WebGL rig/geometry checks; speech is mocked and audio is not verified.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../../work');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1024,height:768}}),errors=[],clipping=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},resume(){},getVoices(){return []},speak(u){u.onstart?.()}}});});
  const seam=`window.combatTest={state,duelV022,strideV024,player,cpu,renderer,stepV024,kick,pause,updateScene,
   tick(dt){visualTime+=dt;updateGame(dt);updateScene(dt)},
   setup(){visualTime=0;state.mode='over';start();beginMatch();state.mode='playing';beginDepthV022();updateGame(2.66);for(const side of ['player','cpu']){const a=strideV024[side];a.attack=99;a.age=99;a.from=a.to=a.x;}player.kick=cpu.kick=0;updateScene(0)},
   strike(side,slot,time){this.setup();stepV024(side,slot);this.tick(time);},
   playerReturn(){state.direction=-1;state.flight=state.duration;state.selected=state.target;state.pendingMiss=null;state.hitstop=0;kick();},
   cpuReturn(){state.direction=1;state.pendingDamage=0;cpuReturn();}
  };
  const transformCombat=(p,n)=>{let [x,y,z]=p.map((v,i)=>v*n.scale[i]);const [a,b,c]=n.rot;[y,z]=[y*Math.cos(a)-z*Math.sin(a),y*Math.sin(a)+z*Math.cos(a)];[x,z]=[x*Math.cos(b)+z*Math.sin(b),-x*Math.sin(b)+z*Math.cos(b)];[x,y]=[x*Math.cos(c)-y*Math.sin(c),x*Math.sin(c)+y*Math.cos(c)];return [x+n.pos[0],y+n.pos[1],z+n.pos[2]];};
  const snapshotCombat=f=>Object.fromEntries(['n',...KICK_NODES_V011].map(k=>[k,{pos:[...f[k].pos],rot:[...f[k].rot]}]));
  const boundsCombat=f=>{const points=[];function visit(n,parents){const chain=[n,...parents];if(n.geo)for(let i=0;i<n.geo.p.length;i+=3){let p=Array.from(n.geo.p.slice(i,i+3));for(const node of chain)p=transformCombat(p,node);points.push(renderer.project(p));}for(const child of n.children)visit(child,chain);}visit(f.n,[]);return {minX:Math.min(...points.map(p=>p[0])),maxX:Math.max(...points.map(p=>p[0])),minY:Math.min(...points.map(p=>p[1])),maxY:Math.max(...points.map(p=>p[1]))};};
  const renderCombat=renderer.render.bind(renderer);renderer.render=function(root){renderCombat(root);window.combatDrawn={player:snapshotCombat(player),cpu:snapshotCombat(cpu),bounds:{player:boundsCombat(player),cpu:boundsCombat(cpu)},size:[renderer.width,renderer.height]};};
  select(0);refreshHud();requestAnimationFrame(frame);`;
  const html=require('./assemble.cjs')().replace('select(0);refreshHud();requestAnimationFrame(frame);',seam);
  await page.route('http://combat.test/**',r=>r.fulfill({contentType:'text/html',body:html}));await page.goto('http://combat.test/?stage=first-court');
  await page.evaluate(()=>combatTest.setup());
  assert.deepEqual(await page.evaluate(()=>[combatTest.strideV024.player.x,combatTest.strideV024.cpu.x]),[-1.2,1.2]);
  await page.screenshot({path:path.join(out,'combat-v024-back-wide.png')});
  const steps=await page.evaluate(()=>{const g=combatTest;g.stepV024('cpu',0);g.tick(.65);const cpuStep={player:g.strideV024.player.x,cpu:g.strideV024.cpu.x};g.tick(.25);g.playerReturn();const pinned=[...g.strideV024.flight];g.tick(.65);return {cpuStep,playerStep:{player:g.strideV024.player.x,cpu:g.strideV024.cpu.x},pinned,after:[...g.strideV024.flight]};});
  assert.equal(steps.cpuStep.player,-1.2);assert(steps.cpuStep.cpu<1.2&&steps.cpuStep.cpu>0);assert(steps.playerStep.player>-1.2);assert.equal(steps.playerStep.cpu,0);assert.deepEqual(steps.pinned,steps.after,'ball mapping stays pinned while actors step');
  await page.screenshot({path:path.join(out,'combat-v024-alternating-step.png')});
  const signatures={player:[],cpu:[]};
  for(const side of ['player','cpu'])for(let slot=0;slot<4;slot++)for(const time of [.15,.30,.55,.65]){
   await page.evaluate(({side,slot,time})=>combatTest.strike(side,slot,time),{side,slot,time});
   const drawn=await page.evaluate(()=>combatDrawn);
   if(time===.30)signatures[side].push(JSON.stringify(drawn[side]));
   await page.screenshot({path:path.join(out,`combat-v024-${side}-${slot}-${String(time).replace('.','p')}.png`)});
   const stable=await page.evaluate(()=>{combatTest.updateScene(0);const a=JSON.stringify(combatDrawn);for(let i=0;i<10;i++)combatTest.updateScene(0);return a===JSON.stringify(combatDrawn);});assert(stable,side+' slot '+slot+' render restores without drift');
  }
  for(const side of ['player','cpu'])assert.equal(new Set(signatures[side]).size,4,side+' has four different actual rendered poses');
  for(const [width,height] of [[320,568],[390,844],[568,320],[844,390]]){
   await page.setViewportSize({width,height});
   for(const side of ['player','cpu'])for(let slot=0;slot<4;slot++)for(const time of [.15,.30,.55,.65]){
    await page.evaluate(({side,slot,time})=>combatTest.strike(side,slot,time),{side,slot,time});
    const d=await page.evaluate(()=>combatDrawn);
    for(const actor of ['player','cpu']){const b=d.bounds[actor];if(b.minX<0||b.minY<0||b.maxX>d.size[0]||b.maxY>d.size[1])clipping.push({width,height,side,slot,time,actor,b,size:d.size});}
   }
   await page.screenshot({path:path.join(out,`combat-v024-phone-${width}x${height}.png`)});
   const controls=await page.evaluate(()=>[...document.querySelectorAll('[data-symbol],#kick')].map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}));
   assert(controls.every(r=>r.x>=-1&&r.y>=-1&&r.x+r.w<=width+1&&r.y+r.h<=height+1),'controls visible at '+width+'x'+height);
  }
  fs.writeFileSync(path.join(out,'combat-v024-browser.json'),JSON.stringify({steps,distinctPoses:{player:new Set(signatures.player).size,cpu:new Set(signatures.cpu).size},clipping,errors},null,2));
  assert.deepEqual(errors,[]);assert.deepEqual(clipping,[],'all actual actor mesh vertices inside phone canvas');
  console.log('PASS actual WebGL: wide start, alternate steps, frozen flight mapping, 4 strikes x 4 ages x 2 actors, repeat-render pose restoration, full-mesh bounds in 4 phone layouts');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
