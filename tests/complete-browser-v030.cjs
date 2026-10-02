'use strict';
/**
 * Complete edition acceptance QA. Uses the production loader and real GardenGL/WebGL.
 * The accelerated fixture injects a TEST-ONLY seam into the assembled HTML. Rules,
 * scene updates, meshes, DOM controls, and persistence are not replaced.
 * Speech synthesis is mocked: this suite does NOT verify audible real-device TTS.
 *
 * NODE_PATH=/opt/codex/cua_node/lib/node_modules CHROME_PATH=/usr/bin/chromium \
 *   node tests/complete-browser-v030.cjs [--baseline /tmp/feg-before.html]
 * VM fallback: node tests/complete-browser-v030.cjs --vm
 * Dependencies: jsdom, @napi-rs/canvas; browser mode additionally needs playwright.
 * Baseline defaults to tests/fixtures/baseline-v0291.html (FEG_BASELINE overrides).
 * Browser launch failure is a BLOCKED result (exit 2), never a simulated pass.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
let chromium; // Loaded only by browser mode; VM mode works without Playwright.
const assemble = require('./assemble.cjs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.env.FEG_EVIDENCE_DIR || path.join(__dirname, '../../work/complete-browser'));
const ORIGIN = 'http://feg-qa.test';
const VIEWPORTS = [[320,568],[390,844],[568,320],[844,390],[768,1024],[1024,768]];
const STAGES = ['jingu','gendo','chion','sanjo','shinkyogoku','million','gion'];
const ANCHOR = 'select(0);refreshHud();requestAnimationFrame(frame);';
const DEFAULT_BASELINE=process.env.FEG_BASELINE||path.join(__dirname,'fixtures/baseline-v0291.html');
const argv = process.argv.slice(2);
const baselineIndex = argv.indexOf('--baseline');
const baseline = baselineIndex >= 0 ? (argv[baselineIndex + 1] || DEFAULT_BASELINE) : null;
fs.mkdirSync(OUT, {recursive:true});
const chromePath=process.env.CHROME_PATH||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'/usr/bin/chromium');
const software=argv.includes('--software');
const report = {startedAt:new Date().toISOString(),mode:baseline?'baseline':'complete',browser:{path:chromePath,requestedRenderer:software?'explicit software fallback':'default hardware',softwareFallback:software},tts:'mocked; audible speech and audio mixing on actual devices are untested',checks:[],errors:[],screenshots:[],limitations:[]};
if(software)report.limitations.push('Explicit software rendering requested; this run is not hardware GPU validation.');
function record(name, detail={}) { report.checks.push({name,status:'pass',...detail}); console.log('PASS '+name); }
function saveReport() { fs.writeFileSync(path.join(OUT,baseline?'complete-baseline-browser.json':'complete-browser-report.json'),JSON.stringify(report,null,2)+'\n'); }
function speechMock() {
  window.__spoken=[];
  let current;
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
    // Keep native Utterance values valid: a plain object cannot be assigned to
    // SpeechSynthesisUtterance.voice. An empty list exercises the en-US fallback.
    cancel(){clearTimeout(current)},resume(){},getVoices(){return []},
    speak(u){window.__spoken.push({text:u.text,lang:u.lang,rate:u.rate,pitch:u.pitch,volume:u.volume,voice:u.voice?.name});u.onstart?.();current=setTimeout(()=>u.onend?.(),20)}
  }});
}
function sourceSeam(html) {
  assert.equal(html.split(ANCHOR).length,2,'unique test-only runtime seam');
  return html.replace(ANCHOR, String.raw`
const qaTransform=(p,n)=>{let [x,y,z]=p.map((v,i)=>v*n.scale[i]);const [a,b,c]=n.rot;[y,z]=[y*Math.cos(a)-z*Math.sin(a),y*Math.sin(a)+z*Math.cos(a)];[x,z]=[x*Math.cos(b)+z*Math.sin(b),-x*Math.sin(b)+z*Math.cos(b)];[x,y]=[x*Math.cos(c)-y*Math.sin(c),x*Math.sin(c)+y*Math.cos(c)];return [x+n.pos[0],y+n.pos[1],z+n.pos[2]];};
const qaBounds=f=>{const points=[];let vertices=0;function visit(n,parents){if(!n.visible)return;const chain=[n,...parents];if(n.geo)for(let i=0;i<n.geo.p.length;i+=3){let p=Array.from(n.geo.p.slice(i,i+3));for(const node of chain)p=qaTransform(p,node);points.push(renderer.project(p));vertices++;}for(const child of n.children)visit(child,chain);}visit(f.n,[]);return {minX:Math.min(...points.map(p=>p[0])),maxX:Math.max(...points.map(p=>p[0])),minY:Math.min(...points.map(p=>p[1])),maxY:Math.max(...points.map(p=>p[1])),vertices};};
const qaRender=renderer.render.bind(renderer);
renderer.render=function(scene){qaRender(scene);window.__qaFrame={player:qaBounds(player),cpu:qaBounds(cpu),playerVisible:player.n.visible,cpuVisible:cpu.n.visible,sevenOrbs:typeof sevenOrbsV030==='undefined'?0:sevenOrbsV030.filter(n=>n.visible).length,ball:renderer.project(ball.pos),ballVisible:ball.visible,size:[renderer.width,renderer.height],phase:duelV022.phase,mode:state.mode};};
window.qa={state,player,cpu,ball,renderer,root,CONFIG,launchShot,sampleBall,resetFoot,stepV024,select,kick,duel:duelV022,close:closeV027,start,pause,setMotion,end,beginMatch,beginTimePass,bow:bowV09,
 get ceremony(){return ceremony},get campaign(){return typeof campaignV030==='undefined'?null:campaignV030},
 draw(){updateScene(0);updateScene(0)},
 tick(seconds){const saved=renderer.render;renderer.render=()=>{};try{for(let t=0;t<seconds-1e-7;t+=1/60){const dt=Math.min(1/60,seconds-t);if(state.mode!=='paused')visualTime+=dt;updateGame(dt);updateScene(dt)}}finally{renderer.render=saved}this.draw()},
 begin(){state.mode='over';start();beginMatch();state.mode='playing';this.draw()},
 input(ok=true){const slot=(state.target+(ok?0:1))%4;document.querySelector('[data-symbol="'+slot+'"]').click();document.querySelector('#kick').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))},
 answer(ok=true){document.querySelector('[data-symbol="'+((closeV027.target+(ok?0:1))%4)+'"]').click()},
 driveUntil(target,maxSeconds=300){const phases=[],seen=new Set();let elapsed=0;for(;elapsed<maxSeconds;elapsed+=1/60){const phase=duelV022.phase;if(!seen.has(phase)){seen.add(phase);phases.push(phase)}if(target===phase||target===state.mode)return {elapsed,phases};if(state.mode==='over')break;if(state.mode==='playing'){if(phase==='close'){if(closeV027.stage==='ask'&&closeV027.time>=.3)this.answer(true)}else if(phase==='rush'){if(Math.round(elapsed*60)%6===0)document.querySelector('#kick').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))}else if(['front','back'].includes(phase)&&state.direction===-1&&state.flight>=state.duration-.01)this.input(true)}this.tick(1/60)}throw Error('Did not reach '+target+': '+JSON.stringify({mode:state.mode,phase:duelV022.phase,hp:state.hp,cpu:state.cpuHp,ceremony,elapsed}))},
 snapshot(){return {state:kemari.getState(),duel:kemari.getDuel(),close:kemari.getClose(),ceremony,campaign:kemari.getCampaign?.()}},
 renderStats(){const gl=renderer.gl;const ext=gl.getExtension('WEBGL_debug_renderer_info');const bytes=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,bytes);const colors=new Set();for(let n=0;n<bytes.length;n+=4*37)colors.add(bytes[n]+','+bytes[n+1]+','+bytes[n+2]);return {version:gl.getParameter(gl.VERSION),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),width:gl.drawingBufferWidth,height:gl.drawingBufferHeight,sampledColors:colors.size,error:gl.getError()}},
};select(0);refreshHud();qa.draw();`);
}
async function routeFiles(page, fixtureHtml) {
  await page.route(ORIGIN+'/**',async route=>{
    const url=new URL(route.request().url());
    if(url.pathname==='/__fixture.html')return route.fulfill({contentType:'text/html',body:fixtureHtml});
    const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';
    const file=path.resolve(ROOT,relative);
    if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:'Not found'});
    const type=relative.endsWith('.js')?'text/javascript':relative.endsWith('.html')?'text/html':relative.endsWith('.json')?'application/json':'text/plain';
    return route.fulfill({contentType:type,body:fs.readFileSync(file)});
  });
}
function pauseGameRAF(){window.__qaNativeRAF=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0;}
async function screenshot(page,name) {
  // Keep game time deterministic while allowing the browser's compositor to
  // repaint both orientation layers before capture. Without this, Chrome can
  // retain a strip of the previous viewport at the bottom of the screenshot.
  await page.evaluate(async()=>{
    window.qa?.draw();void document.body.offsetHeight;
    await Promise.all(document.getAnimations().filter(a=>a.animationName==='campaign-caption-enter').map(a=>a.finished.catch(()=>{})));
    const frame=window.__qaNativeRAF||window.requestAnimationFrame.bind(window);
    await new Promise(resolve=>frame(()=>frame(resolve)));
  });
  const file=path.join(OUT,name+'.png');await page.screenshot({path:file});report.screenshots.push(path.basename(file));
}
async function assertRendered(page,label) {
  // readPixels must share the task that rendered the frame: the drawing buffer
  // may be cleared after compositing when preserveDrawingBuffer is false.
  const stats=await page.evaluate(()=>{qa.draw();return qa.renderStats()});
  assert.equal(stats.error,0,label+' WebGL error');assert(stats.sampledColors>8,label+' actual colored scene');assert(stats.width>0&&stats.height>0);
  assert(software||!/swiftshader|llvmpipe|software rasterizer/i.test(stats.renderer),label+' unexpectedly used software rendering: '+stats.renderer);
  report.browser.renderer=stats.renderer;record(label+' real WebGL',stats);
}
async function assertLayout(page,label,{actors=true}={}) {
  const data=await page.evaluate(()=>{
    const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
    const controls=[...document.querySelectorAll('[data-symbol],#kick,#pause')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').map(e=>({id:e.id||e.dataset.symbol,rect:rect(e),font:parseFloat(getComputedStyle(e).fontSize)}));
    const text=[...document.querySelectorAll('[data-symbol] span,#ballLabel,#practiceCard .word,#practiceCard .ipa')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').map(e=>({id:e.id||e.className,text:e.textContent,font:parseFloat(getComputedStyle(e).fontSize),rect:rect(e)}));
    return {width:innerWidth,height:innerHeight,appCount:document.querySelectorAll('#app').length,scrollWidth:document.documentElement.scrollWidth,controls,text,frame:window.__qaFrame,arena:rect(document.querySelector('#arena'))};
  });
  assert.equal(data.appCount,1,label+' duplicate application DOM');
  assert(data.scrollWidth<=data.width+1,label+' horizontal overflow');
  for(const c of data.controls){const r=c.rect;assert(r.x>=-1&&r.y>=-1&&r.right<=data.width+1&&r.bottom<=data.height+1,label+' control clipped: '+JSON.stringify(c));assert(r.w>=28&&r.h>=28,label+' control too small: '+JSON.stringify(c));}
  for(const t of data.text)assert(t.font>=11,label+' unreadable text: '+JSON.stringify(t));
  if(actors){for(const side of ['player','cpu']){const r=data.frame[side];assert(r.vertices>0,label+' missing '+side+' silhouette');assert(r.minX>=-1&&r.minY>=-1&&r.maxX<=data.frame.size[0]+1&&r.maxY<=data.frame.size[1]+1,label+' clipped '+side+' mesh '+JSON.stringify(r));}}
  if(data.frame.ballVisible&&['front','back'].includes(data.frame.phase)){
    const [x,y]=data.frame.ball;assert(Number.isFinite(x)&&Number.isFinite(y),label+' nonfinite ball');
    assert(x>=-1&&y>=-1&&x<=data.frame.size[0]+1&&y<=data.frame.size[1]+1,label+' ball clipped');
    const point={x:x+data.arena.x,y:y+data.arena.y};
    for(const c of data.controls)assert(!(point.x>c.rect.x&&point.x<c.rect.right&&point.y>c.rect.y&&point.y<c.rect.bottom),label+' ball occluded by '+c.id);
  }
  record(label+' layout',{layout:data});return data;
}
async function productionLoader(browser) {
  const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push({suite:'production',message:e.message}));
  await page.addInitScript(speechMock);await routeFiles(page);
  await page.goto(ORIGIN+'/');
  await page.waitForFunction(()=>document.readyState==='complete');
  await screenshot(page,'complete-production-entry');
  record('production index loaded',{title:await page.title()});
  return {context,page};
}
async function baselineSuite(browser) {
  const source=fs.readFileSync(baseline,'utf8'),context=await browser.newContext(),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push({suite:'baseline',message:e.message}));
  await page.addInitScript(speechMock);await page.addInitScript(pauseGameRAF);
  await routeFiles(page,sourceSeam(source));await page.goto(ORIGIN+'/__fixture.html?stage=first-court');
  await page.waitForFunction(()=>!!window.qa,null,{polling:50});
  await assertRendered(page,'baseline');
  for(const [width,height] of VIEWPORTS){await page.setViewportSize({width,height});await page.evaluate(()=>qa.begin());await assertLayout(page,'baseline front '+width+'x'+height);await screenshot(page,'baseline-front-'+width+'x'+height);}
  const pathResult=await page.evaluate(()=>qa.driveUntil('over'));record('baseline complete match',{...pathResult,state:await page.evaluate(()=>qa.snapshot())});
  assert.equal(await page.locator('#resultTitle').innerText(),'勝利');
  await context.close();
}
async function completeSuite(browser) {
  // Campaign-specific assertions are attached below after integration; absence is a failure.
  assert.equal(typeof runCompleteCampaign,'function','campaign acceptance suite installed');
  await runCompleteCampaign(browser);
}
async function main() {
  if(argv.includes('--vm'))return runVmAcceptance();
  ({chromium}=require('playwright'));
  let browser;
  try {
    const args=software?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']:[];
    report.browser.arguments=args;
    browser=await chromium.launch({executablePath:report.browser.path,headless:true,args,ignoreDefaultArgs:software?[]:['--enable-unsafe-swiftshader']});
    report.browser.version=browser.version();
  } catch(error) {
    report.status='blocked';report.blocker='Chromium could not launch. No renderer test was performed.';report.errors.push(String(error));saveReport();console.error(report.blocker+'\n'+error);process.exitCode=2;return;
  }
  try {
    if(baseline)await baselineSuite(browser);else await completeSuite(browser);
    assert.deepEqual(report.errors,[],'browser JavaScript errors');report.status='passed';console.log('PASS complete browser acceptance');
  } catch(error) {report.status='failed';report.errors.push({message:error.message,stack:error.stack});console.error(error);process.exitCode=1;
    for(const [index,page] of browser.contexts().flatMap(context=>context.pages()).entries())if(!page.isClosed())await screenshot(page,'complete-failure-'+index).catch(()=>{});
  }
  finally {report.finishedAt=new Date().toISOString();saveReport();await browser.close()}
}
if(require.main===module)main();
module.exports={sourceSeam,VIEWPORTS,STAGES,vmFixture,saveSoftwareScene};

// Dependency-free WebGL command recorder for the VM fallback. It executes the
// original Renderer math and scene traversal. It does not implement WebGL and
// is never used by the real-browser suite or labelled a browser screenshot.
function recordingGL() {
  const gl={ARRAY_BUFFER:34962,STATIC_DRAW:35044,FLOAT:5126,TRIANGLES:4,VERTEX_SHADER:35633,FRAGMENT_SHADER:35632,COMPILE_STATUS:35713,LINK_STATUS:35714,DEPTH_TEST:2929,COLOR_BUFFER_BIT:16384,DEPTH_BUFFER_BIT:256,draws:[],uniforms:{},attributes:{},enabled:{}};
  for(const key of ['enable','shaderSource','compileShader','attachShader','linkProgram','useProgram'])gl[key]=()=>{};
  gl.createShader=()=>({});gl.createProgram=()=>({});gl.getShaderParameter=gl.getProgramParameter=()=>true;
  gl.getAttribLocation=(_,name)=>name;gl.getUniformLocation=(_,name)=>name;
  gl.createBuffer=()=>({data:null});gl.bindBuffer=(_,b)=>{gl.bound=b};gl.bufferData=(_,data)=>{gl.bound.data=Array.from(data)};
  gl.enableVertexAttribArray=name=>{gl.enabled[name]=true};gl.disableVertexAttribArray=name=>{gl.enabled[name]=false};
  gl.vertexAttribPointer=name=>{gl.attributes[name]=gl.bound};gl.vertexAttrib3f=(name,...values)=>{gl.attributes[name]={data:values}};
  gl.uniformMatrix4fv=gl.uniformMatrix3fv=(name,_,value)=>{gl.uniforms[name]=Array.from(value)};
  gl.uniform3fv=(name,value)=>{gl.uniforms[name]=Array.from(value)};gl.uniform1f=(name,value)=>{gl.uniforms[name]=value};
  gl.clearColor=(...c)=>{gl.background=c};gl.viewport=(x,y,w,h)=>{gl.width=w;gl.height=h};gl.clear=()=>{gl.draws=[]};
  gl.drawArrays=(_,first,count)=>gl.draws.push({count,p:gl.attributes.aPos.data,n:gl.attributes.aNormal.data,c:gl.enabled.aColor?gl.attributes.aColor.data:null,...JSON.parse(JSON.stringify(gl.uniforms))});
  return gl;
}
function resolveOptional(name,candidates=[]) {
  for(const candidate of [name,...candidates])try{return require(candidate)}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error}
  throw Error('Missing QA dependency '+name+'. Set NODE_PATH or install it in the QA environment.');
}
function vmFixture(original,{url=ORIGIN+'/?stage=jingu',width=1024,height=768,storage=new Map(),session=new Map(),storageBlocked=false}={}) {
  const {JSDOM}=resolveOptional('jsdom',['/tmp/feg-test-deps/node_modules/jsdom',path.resolve(ROOT,'../optics/.sites-runtime/qa/node_modules/jsdom')]);
  const html=sourceSeam(original).replaceAll('window.location.assign(url.href)','window.__qaNavigate=url.href').replaceAll('window.location.assign(stageUrlV021(stagePickerV021.value))','window.__qaNavigate=stageUrlV021(stagePickerV021.value)');
  const dom=new JSDOM(html,{url,runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window,gl=recordingGL(),errors=[];
  let now=1000,nextTimer=0;const timers=new Map();
  w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};
  w.setTimeout=(fn,ms=0)=>{timers.set(++nextTimer,{fn,at:now+ms});return nextTimer};w.clearTimeout=id=>timers.delete(id);
  w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  w.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};w.PointerEvent=w.MouseEvent;
  const voice={name:'QA English',lang:'en-US',default:true};w.__spoken=[];
  Object.defineProperty(w,'speechSynthesis',{value:{cancel(){},resume(){},getVoices:()=>[voice],speak(u){w.__spoken.push(u);u.onstart?.();w.setTimeout(()=>u.onend?.(),20)}}});
  for(const [name,map] of [['localStorage',storage],['sessionStorage',session]])Object.defineProperty(w,name,{value:{getItem:k=>map.get(k)||null,setItem(k,v){if(storageBlocked)throw Error('Storage unavailable');map.set(k,String(v))},removeItem:k=>map.delete(k),clear:()=>map.clear()}});
  w.innerWidth=width;w.innerHeight=height;w.devicePixelRatio=1;
  const size={width:width>height?Math.max(260,width-272):width-20,height:width>height?height-106:Math.max(220,Math.min(620,height-300))};
  w.HTMLElement.prototype.getBoundingClientRect=function(){return {x:0,y:0,left:0,top:0,width:size.width,height:size.height,right:size.width,bottom:size.height,toJSON(){return this}}};
  Object.defineProperty(w.HTMLCanvasElement.prototype,'clientWidth',{get:()=>size.width});Object.defineProperty(w.HTMLCanvasElement.prototype,'clientHeight',{get:()=>size.height});
  w.HTMLCanvasElement.prototype.getContext=function(type){if(type==='webgl')return gl;throw Error('Unexpected context '+type)};
  w.addEventListener('error',event=>errors.push(event.error?.stack||event.message));
  for(const script of w.document.querySelectorAll('script:not([src])'))w.eval(script.textContent);
  assert(w.qa,'VM seam initialized');
  function flush(ms){const until=now+ms;let iterations=0;while(true){const next=[...timers].filter(([,v])=>v.at<=until).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;if(iterations++>10000)throw Error('Timer loop');now=next[1].at;timers.delete(next[0]);next[1].fn()}now=until}
  function tick(seconds){for(let t=0;t<seconds-1e-7;t+=1/60){const dt=Math.min(1/60,seconds-t);w.qa.tick(dt);flush(dt*1000)}}
  function click(selector){const element=w.document.querySelector(selector);assert(element,'Missing '+selector);element.click();flush(50)}
  function snapshot(){return JSON.parse(JSON.stringify(w.qa.snapshot()))}
  return {w,gl,dom,storage,session,errors,size,flush,tick,click,snapshot,resize(ww,hh){w.innerWidth=ww;w.innerHeight=hh;size.width=ww>hh?Math.max(260,ww-272):ww-20;size.height=ww>hh?hh-106:Math.max(220,Math.min(620,hh-300));w.qa.draw()},close(){dom.window.close()}};
}
function saveSoftwareScene(fixture,name) {
  const {createCanvas}=resolveOptional('@napi-rs/canvas',['/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas']);
  const {gl}=fixture,w=gl.width,h=gl.height,canvas=createCanvas(w,h),ctx=canvas.getContext('2d');
  ctx.fillStyle='rgb('+gl.background.slice(0,3).map(v=>Math.round(v*255)).join(',')+')';ctx.fillRect(0,0,w,h);
  const mat=(m,p)=>[0,1,2,3].map(i=>m[i]*p[0]+m[i+4]*p[1]+m[i+8]*p[2]+m[i+12]);
  const triangles=[];
  for(const d of gl.draws)for(let i=0;i<d.count*3;i+=9){
    const points=[],world=[];for(let j=0;j<9;j+=3){const p=mat(d.uM,d.p.slice(i+j,i+j+3));world.push(p);const q=mat(d.uVP,p);points.push([(q[0]/q[3]+1)*w/2,(1-q[1]/q[3])*h/2,q[2]/q[3]])}
    if(points.some(p=>!p.every(Number.isFinite)))continue;
    const n0=d.n.slice(i,i+3),n=[0,1,2].map(j=>d.uN[j]*n0[0]+d.uN[j+3]*n0[1]+d.uN[j+6]*n0[2]),nl=Math.hypot(...n)||1,ll=Math.hypot(-.5,.85,.65),dot=(n[0]*-.5+n[1]*.85+n[2]*.65)/(nl*ll),light=(.56+.44*Math.max(0,dot))*(1-d.uUnlit)+d.uUnlit;
    const wx=world.reduce((a,p)=>a+p[0],0)/3,wz=world.reduce((a,p)=>a+p[2],0)/3,radial=typeof d.uFogCenter==='number',depth=radial?Math.hypot(wx,wz-d.uFogCenter):-wz,u=Math.max(0,Math.min(1,(depth-(radial?10:4))/(radial?32:20))),fog=u*u*(3-2*u)*(d.uFogStrength??.7);
    const c=d.uColor.map((v,k)=>{const vc=d.c?(d.c[i+k]+d.c[i+k+3]+d.c[i+k+6])/3:1;return Math.round(Math.max(0,Math.min(1,v*vc*light*(1-fog)+(d.uFogColor||[.37,.48,.46])[k]*fog))*255)});
    triangles.push({points,z:points.reduce((a,p)=>a+p[2],0)/3,color:c});
  }
  const pixels=ctx.createImageData(w,h),depths=new Float32Array(w*h);depths.fill(Infinity);
  for(let i=0;i<w*h;i++){for(let k=0;k<3;k++)pixels.data[i*4+k]=Math.round(gl.background[k]*255);pixels.data[i*4+3]=255}
  for(const t of triangles){const [a,b,c]=t.points,den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<1e-10)continue;
    const minX=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),maxX=Math.min(w-1,Math.ceil(Math.max(a[0],b[0],c[0]))),minY=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),maxY=Math.min(h-1,Math.ceil(Math.max(a[1],b[1],c[1])));
    for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){const u=((b[1]-c[1])*(x+.5-c[0])+(c[0]-b[0])*(y+.5-c[1]))/den,v=((c[1]-a[1])*(x+.5-c[0])+(a[0]-c[0])*(y+.5-c[1]))/den,z=u*a[2]+v*b[2]+(1-u-v)*c[2],i=y*w+x;if(u>=0&&v>=0&&u+v<=1&&z>=-1&&z<=1&&z<depths[i]){depths[i]=z;for(let k=0;k<3;k++)pixels.data[i*4+k]=t.color[k]}}
  }
  ctx.putImageData(pixels,0,0);
  ctx.fillStyle='#061016d9';ctx.fillRect(0,h-22,w,22);ctx.fillStyle='#fff';ctx.font='10px sans-serif';ctx.fillText('QA SOFTWARE PROJECTION · original meshes/camera · NOT WEBGL / NOT CSS LAYOUT',8,h-7);
  fs.writeFileSync(path.join(OUT,name+'.png'),canvas.toBuffer('image/png'));
  report.screenshots.push(name+'.png');return {triangles:triangles.length,width:w,height:h};
}
function kernelCases(fixture) {
  const q=fixture.w.qa,out=[];
  for(const back of [false,true])for(let slot=0;slot<4;slot++){
    q.begin();q.resetFoot();q.select(slot);if(back){q.duel.entered=true;q.duel.phase='back'}
    q.state.target=slot;q.state.hitstop=0;q.state.pendingMiss=null;q.launchShot('normal',-1,[3.3,1.2,0]);q.state.flight=q.state.duration;q.kick();q.draw();
    out.push(JSON.parse(JSON.stringify({back,slot,duration:q.state.duration,arc:q.state.arc,hp:q.state.hp,cpuHp:q.state.cpuHp,pendingDamage:q.state.pendingDamage,perfect:q.state.perfect,rally:q.state.rally,hit:q.CONFIG.hitWindow,perfectWindow:q.CONFIG.perfectWindow,samples:[0,.25,.5,.75,1].map(t=>q.sampleBall(t))})));
  }
  return out;
}
async function runVmAcceptance() {
  report.mode='VM game-state and software-projection fallback';report.limitations=['No actual browser, CSS layout, WebGL GPU execution or audible real-device TTS validated','Software scene images use original mesh/camera output with depth-buffered CPU shader approximation; they are not screenshots'];
  try {
    const before=vmFixture(fs.readFileSync(baseline||DEFAULT_BASELINE,'utf8'),{url:ORIGIN+'/?stage=first-court'});
    const beforeCases=kernelCases(before);saveSoftwareScene(before,'baseline-software-projection');
    if(baseline){record('baseline VM kernel',{cases:beforeCases});before.close();report.status='passed';return}
    const current=vmFixture(assemble(),{url:ORIGIN+'/?stage=jingu'});
    const currentCases=kernelCases(current);assert.deepEqual(currentCases,beforeCases,'eight shot trajectories/timing/scoring must equal baseline');record('baseline kernel equality',{cases:8});
    before.close();current.close();
    await runVmCampaign();
    report.status='passed';console.log('PASS VM acceptance (not a real browser/WebGL run)');
  }catch(error){report.status='failed';report.errors.push({message:error.message,stack:error.stack});console.error(error);process.exitCode=1}
  finally{report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(OUT,'complete-vm-report.json'),JSON.stringify(report,null,2)+'\n')}
}

function vmAdvance(f,seconds) {const draw=f.w.qa.draw;f.w.qa.draw=()=>{};try{f.tick(seconds)}finally{f.w.qa.draw=draw;draw.call(f.w.qa)}}
function vmDrive(f,condition,{wrong=false,maxSeconds=300}={}) {
  const q=f.w.qa,draw=q.draw,phases=[],seen=new Set();let time=0,kicks=0,closeAnswers=0;
  q.draw=()=>{};
  try {for(;time<maxSeconds;time+=1/60){
    if(condition())return {seconds:time,kicks,closeAnswers,phases};
    const state=q.state,phase=q.duel.phase,key=q.ceremony+':'+phase;
    if(!seen.has(key)){seen.add(key);phases.push(key)}
    if(state.mode==='playing'){
      if(phase==='close'&&q.close.stage==='ask'&&q.close.time>=.3){q.answer(!wrong);closeAnswers++}
      else if(phase==='rush'){if(Math.round(time*60)%6===0)f.w.document.querySelector('#kick').dispatchEvent(new f.w.PointerEvent('pointerdown',{bubbles:true}))}
      else if(['front','back'].includes(phase)&&['practice','match'].includes(q.ceremony)&&state.direction===-1&&state.flight>=state.duration-.007){q.input(!wrong||q.ceremony==='practice');kicks++}
    }
    q.tick(1/60);f.flush(1000/60);
  }throw Error('VM timeout '+JSON.stringify({campaign:q.campaign,ceremony:q.ceremony,mode:q.state.mode,phase:q.duel.phase,hp:q.state.hp,cpu:q.state.cpuHp,time,kicks,closeAnswers}));}
  finally{q.draw=draw;draw.call(q)}
}
function vmPracticeAndBow(f,{repeatBow=false}={}) {
  const initial=vmDrive(f,()=>f.w.qa.ceremony==='choice');
  assert.equal(initial.kicks,8,'eight practice returns');assert.equal(f.w.qa.state.hp,100);assert.equal(f.w.qa.state.cpuHp,100);
  assert(f.w.__spoken.some(u=>u.text.toLowerCase().includes('time')),'TIME spoken');
  f.click('#bowBtn');assert.equal(f.w.qa.ceremony,'bow-wait');
  if(repeatBow){vmAdvance(f,2);f.click('#bowBtn');vmAdvance(f,2);assert.equal(f.w.qa.ceremony,'bow-wait','repeated bow resets wait')}
  const ceremony=vmDrive(f,()=>f.w.qa.ceremony==='match');
  assert(f.w.__spoken.some(u=>u.text.toLowerCase().includes('hajime')),'HAJIME spoken');
  return {practice:initial,ceremony};
}
async function runVmCampaign() {
  const original=assemble(),storage=new Map(),session=new Map();let f;
  const open=(url,extra={})=>{if(f)f.close();f=vmFixture(original,{url:ORIGIN+url,storage,session,...extra});return f};
  const campaign=()=>f.w.kemari.getCampaign();
  const fresh=open('/');assert.equal(campaign().phase,'title');
  const start=f.w.document.querySelector('#start');start.click();start.click();assert.equal(f.w.__spoken.filter(u=>u.text==='FIFTEENTH EVER GARDEN').length,1,'repeated START speaks once');f.flush(1000);
  assert.equal(campaign().phase,'dialogue');assert.equal(f.w.document.querySelector('.speaker').textContent,'KYOTO STATION / 烏丸 朔');
  f.click('#dialogueNext');assert(f.w.document.querySelector('.en').textContent.includes('remember'));f.click('#dialogueNext');f.flush(1000);assert.equal(campaign().phase,'match');
  record('START → Kyoto Station dialogue → practice (DOM controls)');
  const introCeremony=vmPracticeAndBow(f,{repeatBow:true});record('8 practice → TIME → repeated bow → HAJIME',{...introCeremony});
  const paused=f.snapshot();f.click('#pause');assert.equal(f.w.qa.state.mode,'paused');const frozen=f.snapshot();vmAdvance(f,8);f.w.document.querySelector('#kick').dispatchEvent(new f.w.PointerEvent('pointerdown',{bubbles:true}));assert.deepEqual(f.snapshot(),frozen,'pause freezes state and ignores kick');f.click('#resume');assert.notEqual(f.w.qa.state.mode,'paused');record('pause, stale input and resume');
  const intro=vmDrive(f,()=>campaign().phase==='intro-win');assert.equal(campaign().save.introComplete,true);assert.equal(campaign().orbs,1,'intro does not give opponent orb');vmAdvance(f,1.3);assert.equal(campaign().phase,'garden');record('intro win → garden',{path:intro});
  assert.equal(f.w.document.querySelectorAll('.campaign-stone').length,15);assert.equal(f.w.document.querySelectorAll('[data-kind=self]').length,1);assert.equal(f.w.document.querySelectorAll('[data-kind=opponent]').length,6);assert.equal(f.w.document.querySelectorAll('[data-kind=ordinary]').length,8);assert.equal(f.w.document.querySelector('#gardenFinal'),null);record('garden has exactly 15 stones: 1 self + 6 opponents + 8 ordinary');
  const invalid=vmFixture(original,{url:ORIGIN+'/?stage=gion',storage,session});assert.equal(invalid.w.kemari.getCampaign().phase,'garden','GION direct URL is locked');invalid.close();
  saveSoftwareScene(f,'complete-software-garden');
  const order=['million','chion','jingu','shinkyogoku','gendo','sanjo'];
  for(const [index,stage] of order.entries()){
    f.click('[data-stage="'+stage+'"]');assert.equal(campaign().selected,stage);f.click('#gardenGo');assert.equal(new URL(f.w.__qaNavigate).searchParams.get('stage'),stage,'actual navigation URL');
    open('/?stage='+stage);assert.equal(campaign().phase,'stage-card');f.click('#start');f.flush(1000);vmPracticeAndBow(f);
    saveSoftwareScene(f,'complete-software-'+stage+'-front');
    const back=vmDrive(f,()=>f.w.qa.duel.phase==='back');saveSoftwareScene(f,'complete-software-'+stage+'-back');
    const win=vmDrive(f,()=>campaign().phase==='inheritance');assert.equal(campaign().orbs,index+2);assert.equal(campaign().save.acquired.length,index+1);assert.equal(new Set(campaign().save.acquired).size,index+1);assert.equal(campaign().save.wins[f.w.kemari.getStage().opponent],1);
    f.click('#cinemaSkip');assert.equal(campaign().phase,'garden');
    record('free-order opponent '+stage+' → unique persisted inheritance',{back,win,orbs:campaign().orbs});
  }
  assert.equal(campaign().gionUnlocked,true);assert(f.w.document.querySelector('#gardenFinal'));assert.equal(campaign().orbs,7);
  const persisted=[...campaign().save.acquired];open('/?view=garden');assert.deepEqual([...campaign().save.acquired],persisted);assert.equal(campaign().orbs,7);record('all six orbs persist after page reload');
  // Replay an acquired opponent. Replay raises the win count but never duplicates an orb.
  open('/?stage=chion');f.click('#start');f.flush(1000);vmPracticeAndBow(f);vmDrive(f,()=>campaign().phase==='inheritance');assert.equal(campaign().orbs,7);assert.equal(campaign().save.wins.sumi,2);f.click('#cinemaSkip');record('replayed opponent cannot duplicate orb');
  f.click('#gardenFinal');assert.equal(new URL(f.w.__qaNavigate).searchParams.get('stage'),'gion');open('/?stage=gion');f.click('#start');assert.equal(campaign().phase,'gather');saveSoftwareScene(f,'complete-software-gion-gather');vmAdvance(f,3);assert.equal(campaign().godmode,true);vmAdvance(f,1.4);assert.equal(campaign().phase,'match');assert.equal(campaign().godmode,true);f.flush(1000);vmPracticeAndBow(f);
  assert.equal(f.w.kemari.getStage().opponent,'shadow');saveSoftwareScene(f,'complete-software-gion-front');vmDrive(f,()=>f.w.qa.duel.phase==='back');saveSoftwareScene(f,'complete-software-gion-back');
  vmDrive(f,()=>campaign().phase==='scatter');assert.equal(campaign().save.completed,true);vmAdvance(f,.8);assert(f.w.__spoken.some(u=>u.text==='ひゃーん'));saveSoftwareScene(f,'complete-software-gion-scatter');vmAdvance(f,2.1);assert.equal(campaign().phase,'ending');assert.equal(f.w.document.querySelector('.campaign-end h2').textContent,'THE END');f.click('#endingGarden');assert.equal(campaign().phase,'garden');assert.equal(campaign().orbs,7);record('GION gather → godmode → shadow → scatter/ひゃーん → abrupt ending → replay');
  // Loss, retry, effects-off, and garden navigation must not award anything early.
  open('/?stage=jingu');f.click('#start');f.flush(1000);vmPracticeAndBow(f);const beforeLoss=JSON.stringify(campaign().save);vmDrive(f,()=>f.w.qa.state.mode==='over',{wrong:true});assert.equal(f.w.document.querySelector('#resultTitle').textContent,'敗北');assert.equal(JSON.stringify(campaign().save),beforeLoss);f.click('#restart');f.flush(1000);assert.equal(campaign().phase,'match');assert.equal(f.w.qa.state.hp,100);assert.equal(f.w.qa.state.cpuHp,100);f.click('#motion');assert.equal(f.w.document.body.classList.contains('reduced-motion'),true);vmPracticeAndBow(f);vmDrive(f,()=>campaign().phase==='inheritance');f.click('#cinemaSkip');assert.equal(campaign().phase,'garden');record('loss does not award; retry resets; effects OFF completes');
  const stale=new Map([['feg.campaign.v1',JSON.stringify({version:0,acquired:['saku','bad'],introComplete:true,completed:true})]]);let bad=vmFixture(original,{storage:stale,url:ORIGIN+'/'});assert.equal(bad.w.kemari.getCampaign().orbs,1);assert.equal(bad.w.kemari.getCampaign().save.introComplete,false);bad.close();
  bad=vmFixture(original,{storage:new Map([['feg.campaign.v1','{broken']]),url:ORIGIN+'/'});assert.equal(bad.w.kemari.getCampaign().orbs,1);bad.close();
  bad=vmFixture(original,{storage:new Map([['feg.campaign.v1',JSON.stringify({version:1,acquired:['saku','saku','bad'],wins:{saku:Infinity,bad:999},completed:true,introComplete:true})]]),url:ORIGIN+'/?view=garden'});assert.equal(bad.w.kemari.getCampaign().orbs,2);assert.equal(bad.w.kemari.getCampaign().save.completed,false);bad.close();
  bad=vmFixture(original,{storageBlocked:true,url:ORIGIN+'/?view=garden'});assert(bad.w.kemari.getCampaign().storageNotice.includes('保存できません'));bad.close();record('stale/corrupt/duplicate saves normalize; blocked storage is disclosed');
  assert.deepEqual(f.errors,[],'runtime errors');f.close();
}

async function browserDrive(page,kind,target,{wrong=false,maxSeconds=300}={}) {
  return page.evaluate(({kind,target,wrong,maxSeconds})=>{
    const q=qa,draw=q.draw,seen=new Set(),phases=[];let seconds=0,kicks=0;
    q.draw=()=>{};
    const done=()=>kind==='campaign'?q.campaign.phase===target:kind==='ceremony'?q.ceremony===target:kind==='mode'?q.state.mode===target:q.duel.phase===target;
    try{for(;seconds<maxSeconds;seconds+=1/60){
      if(done())return {seconds,kicks,phases};
      const phase=q.duel.phase,key=q.ceremony+':'+phase;if(!seen.has(key)){seen.add(key);phases.push(key)}
      if(q.state.mode==='playing'){
        if(phase==='close'&&q.close.stage==='ask'&&q.close.time>=.3)q.answer(!wrong);
        else if(phase==='rush'){if(Math.round(seconds*60)%6===0)document.querySelector('#kick').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))}
        else if(['front','back'].includes(phase)&&['practice','match'].includes(q.ceremony)&&q.state.direction===-1&&q.state.flight>=q.state.duration-.007){q.input(!wrong||q.ceremony==='practice');kicks++}
      }q.tick(1/60);
    }throw Error('Browser driver timeout '+JSON.stringify(q.snapshot()))}
    finally{q.draw=draw;draw.call(q)}
  },{kind,target,wrong,maxSeconds});
}
async function browserPractice(page,repeat=false) {
  const result=await browserDrive(page,'ceremony','choice');assert.equal(result.kicks,8);
  await page.locator('#bowBtn').click();
  if(repeat){await page.evaluate(()=>qa.tick(2));await page.locator('#bowBtn').click();await page.evaluate(()=>qa.tick(2));assert.equal(await page.evaluate(()=>qa.ceremony),'bow-wait')}
  await browserDrive(page,'ceremony','match');return result;
}
async function browserLayouts(page,stage,side) {
  for(const [width,height] of VIEWPORTS){await page.setViewportSize({width,height});await page.evaluate(()=>qa.draw());await screenshot(page,'complete-'+stage+'-'+side+'-'+width+'x'+height);await assertLayout(page,stage+' '+side+' '+width+'x'+height)}
}
async function browserGardenLayouts(page,label='garden') {
  const initial=page.viewportSize(),results=[];
  for(const [width,height] of VIEWPORTS){
    await page.setViewportSize({width,height});await page.evaluate(()=>{scrollTo(0,0);qa.draw()});
    await screenshot(page,'complete-'+label+'-'+width+'x'+height);
    const data=await page.evaluate(()=>{
      const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
      const panels=['.campaign-top small','.campaign-top h2','#stationAgain','.campaign-orbs','.campaign-detail'].map(selector=>({selector,...rect(document.querySelector(selector))}));
      const labelRect=e=>{
        if(!e.dataset.label)return null;
        const css=getComputedStyle(e,'::after'),probe=document.createElement('span');
        for(const key of ['font','fontSize','fontFamily','fontWeight','lineHeight','letterSpacing','padding','border','boxSizing'])probe.style[key]=css[key];
        Object.assign(probe.style,{position:'fixed',visibility:'hidden',whiteSpace:'nowrap',width:'max-content'});probe.textContent=e.dataset.label;document.body.appendChild(probe);
        const size=rect(probe),button=rect(e);probe.remove();const x=button.x+button.w/2-size.w/2,y=button.y+parseFloat(css.top);
        return {x,y,w:size.w,h:size.h,right:x+size.w,bottom:y+size.h};
      };
      const stones=[...document.querySelectorAll('.campaign-stone')].map(e=>{
        const r=rect(e),hit=document.elementFromPoint(r.x+r.w/2,r.y+r.h/2);
        return {index:e.dataset.index,kind:e.dataset.kind,stage:e.dataset.stage,label:e.dataset.label,interactive:e.tagName==='BUTTON'&&e.getAttribute('aria-disabled')!=='true',rect:r,labelRect:labelRect(e),centerReceivesPointer:hit===e||e.contains(hit),hit:hit?.id||hit?.className||hit?.tagName};
      });
      return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,arena:rect(document.querySelector('#arena')),panels,stones};
    });
    const issues=[],inside=r=>r.x>=-1&&r.y>=-1&&r.right<=width+1&&r.bottom<=height+1;
    const overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.x,b.x)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>1;
    if(data.scrollWidth>width+1)issues.push('horizontal overflow');
    for(const panel of data.panels)if(!inside(panel))issues.push('clipped '+panel.selector);
    for(const stone of data.stones){
      const name=stone.stage||stone.kind+' '+stone.index;
      if(!inside(stone.rect))issues.push(name+' target clipped');
      if(stone.interactive&&!stone.centerReceivesPointer)issues.push(name+' target blocked by '+stone.hit);
      if(stone.kind==='opponent'&&(stone.rect.w<44||stone.rect.h<44))issues.push(name+' target below 44px');
      for(const panel of data.panels){if(overlap(stone.rect,panel))issues.push(name+' target overlaps '+panel.selector);if(stone.labelRect&&overlap(stone.labelRect,panel))issues.push(name+' label overlaps '+panel.selector);}
      if(stone.labelRect&&!inside(stone.labelRect))issues.push(name+' label clipped');
    }
    for(let a=0;a<data.stones.length;a++)for(let b=a+1;b<data.stones.length;b++){
      const first=data.stones[a],second=data.stones[b];
      if(first.labelRect&&second.labelRect&&overlap(first.labelRect,second.labelRect))issues.push('labels overlap '+first.index+'/'+second.index);
    }
    results.push({...data,issues});
  }
  fs.writeFileSync(path.join(OUT,'complete-'+label+'-layout.json'),JSON.stringify(results,null,2)+'\n');
  report.checks.push({name:label+' six viewport targets and labels',status:results.some(r=>r.issues.length)?'fail':'pass',viewports:results.map(r=>({width:r.width,height:r.height,issues:r.issues}))});
  await page.setViewportSize(initial);await page.evaluate(()=>{scrollTo(0,0);qa.draw()});
  assert(results.every(r=>!r.issues.length),label+' layout: '+JSON.stringify(results.filter(r=>r.issues.length).map(r=>({width:r.width,height:r.height,issues:r.issues}))));
}
async function runCompleteCampaign(browser) {
  const production=await productionLoader(browser);
  await production.page.waitForFunction(()=>!!window.kemari);
  assert.equal(await production.page.evaluate(()=>kemari.version),'0.30.0-seven-inheritances');
  await production.page.locator('#start').click();await production.page.waitForFunction(()=>kemari.getCampaign().phase==='dialogue');
  await production.page.locator('#dialogueNext').click();await production.page.locator('#dialogueNext').click();
  await production.page.waitForFunction(()=>kemari.getState().mode==='ready'||kemari.getState().mode==='playing');
  assert.equal(await production.page.locator('#practiceCard').isVisible(),true);record('actual production loader → START → dialogue → active practice');await screenshot(production.page,'complete-production-practice');await production.context.close();
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push({suite:'complete',message:e.message}));
  await page.addInitScript(speechMock);await page.addInitScript(pauseGameRAF);
  await routeFiles(page,sourceSeam(assemble()));
  const go=async query=>{await page.goto(ORIGIN+'/__fixture.html'+query);await page.waitForFunction(()=>!!window.qa,null,{polling:50})};
  const c=()=>page.evaluate(()=>kemari.getCampaign());
  const begin=async()=>{await page.locator('#start').click();await page.waitForFunction(()=>qa.state.mode==='ready'||qa.state.mode==='playing',null,{polling:50})};
  await go('');await assertRendered(page,'complete title');
  await page.locator('#start').dblclick();await page.waitForFunction(()=>qa.campaign.phase==='dialogue',null,{polling:50});
  assert.equal(await page.evaluate(()=>__spoken.filter(u=>u.text==='FIFTEENTH EVER GARDEN').length),1);
  await page.locator('#dialogueNext').click();await page.locator('#dialogueNext').click();await page.waitForFunction(()=>qa.state.mode==='ready'||qa.state.mode==='playing',null,{polling:50});
  await browserPractice(page,true);await page.locator('#pause').click();
  const frozen=await page.evaluate(()=>qa.snapshot());await page.evaluate(()=>qa.tick(8));assert.deepEqual(await page.evaluate(()=>qa.snapshot()),frozen);await page.locator('#resume').click();
  await browserDrive(page,'campaign','intro-win');await page.evaluate(()=>qa.tick(1.3));assert.equal((await c()).phase,'garden');
  assert.equal(await page.locator('.campaign-stone').count(),15);assert.equal(await page.locator('[data-kind=self]').count(),1);assert.equal(await page.locator('[data-kind=opponent]').count(),6);assert.equal(await page.locator('[data-kind=ordinary]').count(),8);record('browser intro, ceremony, pause and 15-stone garden');
  await screenshot(page,'complete-garden');await browserGardenLayouts(page);
  const order=['million','chion','jingu','shinkyogoku','gendo','sanjo'];
  for(const [i,stage] of order.entries()){
    // Cinema skip replaces the DOM; the paused fixture needs the normal next
    // frame to project freshly created stone buttons before hit testing them.
    await page.evaluate(()=>qa.draw());
    await page.locator('[data-stage="'+stage+'"]').click();assert.equal((await c()).selected,stage);
    await page.locator('#gardenGo').click();await page.waitForURL('**stage='+stage);await page.waitForFunction(()=>!!window.qa,null,{polling:50});await begin();await browserPractice(page);
    await browserLayouts(page,stage,'front');await browserDrive(page,'duel','back');await browserLayouts(page,stage,'back');
    await browserDrive(page,'campaign','inheritance');assert.equal((await c()).orbs,i+2);await page.locator('#cinemaSkip').click();assert.equal((await c()).phase,'garden');record('browser free-order win '+stage);
  }
  await page.reload();await page.waitForFunction(()=>!!window.qa,null,{polling:50});assert.equal((await c()).orbs,7);assert.equal((await c()).gionUnlocked,true);await browserGardenLayouts(page,'garden-unlocked');
  await page.locator('#gardenFinal').click();await page.waitForURL('**stage=gion');await page.waitForFunction(()=>!!window.qa,null,{polling:50});
  await page.evaluate(()=>qa.draw());assert.equal(await page.evaluate(()=>__qaFrame.cpuVisible),false,'shadow remains hidden on GION stage card');
  await page.locator('#start').click();await page.evaluate(()=>qa.draw());assert.equal((await c()).phase,'gather');assert.equal((await c()).godmode,false);assert.equal(await page.evaluate(()=>__qaFrame.sevenOrbs),7,'exactly seven visible gathering orbs');assert.equal(await page.evaluate(()=>__qaFrame.cpuVisible),false,'seven gather before shadow reveal');await screenshot(page,'complete-gion-gather-start');
  await page.evaluate(()=>qa.tick(3));assert.equal((await c()).godmode,true);assert.equal(await page.evaluate(()=>__qaFrame.cpuVisible),false,'godmode transformation precedes shadow');await screenshot(page,'complete-gion-gather');
  await page.evaluate(()=>qa.tick(.5));assert.equal(await page.evaluate(()=>__qaFrame.cpuVisible),true,'shadow appears after transformation');await screenshot(page,'complete-gion-shadow-reveal');
  await page.evaluate(()=>qa.tick(.9));await page.waitForFunction(()=>qa.state.mode==='ready'||qa.state.mode==='playing',null,{polling:50});await browserPractice(page);record('seven orbs → godmode → shadow rendered in order');
  assert.equal(await page.evaluate(()=>kemari.getStage().opponent),'shadow');await browserLayouts(page,'gion','front');await browserDrive(page,'duel','back');await browserLayouts(page,'gion','back');await browserDrive(page,'campaign','scatter');await page.evaluate(()=>qa.tick(.8));assert(await page.evaluate(()=>__spoken.some(u=>u.text==='ひゃーん')));await screenshot(page,'complete-gion-scatter');await page.evaluate(()=>qa.tick(2.1));assert.equal((await c()).phase,'ending');await screenshot(page,'complete-ending');await page.locator('#endingGarden').click();assert.equal((await c()).phase,'garden');record('browser GION, godmode, shadow, seven scatter, end and replay');
  await go('?stage=jingu');await begin();await browserPractice(page);const saveBefore=(await c()).save;await browserDrive(page,'mode','over',{wrong:true});assert.equal(await page.locator('#resultTitle').innerText(),'敗北');assert.deepEqual((await c()).save,saveBefore);await page.locator('#restart').click();await page.waitForFunction(()=>qa.state.mode==='ready'||qa.state.mode==='playing',null,{polling:50});assert.equal(await page.evaluate(()=>qa.state.hp),100);await page.locator('#motion').click();await browserPractice(page);await browserDrive(page,'campaign','inheritance');assert.equal((await c()).orbs,7);record('browser loss/retry/effects-off and no duplicate award');
  await context.close();
}
