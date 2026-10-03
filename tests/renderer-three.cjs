const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('playwright'),{PNG}=require('pngjs');
const assemble=require('./assemble.cjs');
const {sourceSeam}=require('./complete-browser-v030.cjs');
const out=path.resolve(__dirname,'../../work/three-migration');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,ignoreDefaultArgs:['--enable-unsafe-swiftshader']});
 const report={checks:[],errors:[],tts:'not tested',device:'Mac Chrome only'};
 try{
 for(const viewport of [{width:844,height:390},{width:390,height:844}]){
  for(const phase of ['front','back','close','rush']){
  const shots=[];
  for(const renderer of ['garden','three']){
   const page=await browser.newPage({viewport});
   page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});
   await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;Math.random=()=>.37});
   await page.route('http://compare.test/**',r=>r.fulfill({contentType:'text/html',body:sourceSeam(assemble())}));
   await page.goto('http://compare.test/?stage=jingu&look=baseline&renderer='+renderer);
   await page.evaluate(phase=>{qa.begin();if(phase!=='front')qa.driveUntil(phase);qa.tick(.15);qa.draw()},phase);
   const info=await page.evaluate(()=>({revision:window.FEGThreeRevision,three:!!qa.renderer.engine?.isWebGLRenderer,vp:Array.from(qa.renderer.vp),stats:qa.renderStats()}));
   assert.equal(info.three,renderer==='three');assert.equal(info.stats.error,0);assert(info.stats.sampledColors>20);
   shots.push({info,png:PNG.sync.read(await page.locator('canvas').first().screenshot())});
   await page.screenshot({path:path.join(out,`${renderer}-${viewport.width}-${phase}.png`)});
   if(renderer==='three'){
    const resources=await page.evaluate(()=>{qa.draw();const before={...qa.renderer.engine.info.memory};for(let i=0;i<40;i++)qa.draw();return {before,after:{...qa.renderer.engine.info.memory}}});
    assert.deepEqual(resources.before,resources.after);info.resources=resources;
   }
   await page.close();
  }
  const [a,b]=shots;assert.equal(a.png.data.length,b.png.data.length);
  let sum=0,changed=0;for(let i=0;i<a.png.data.length;i+=4){let d=0;for(let c=0;c<3;c++)d+=Math.abs(a.png.data[i+c]-b.png.data[i+c]);sum+=d;if(d>30)changed++}
  const mae=sum/(a.png.width*a.png.height*3),changedRatio=changed/(a.png.width*a.png.height);
  assert(mae<3,`render difference ${mae}`);assert(changedRatio<.04,`changed pixels ${changedRatio}`);
  assert(Math.max(...a.info.vp.map((v,i)=>Math.abs(v-b.info.vp[i])))<1e-5);
  report.checks.push({viewport,phase,mae,changedRatio,renderers:shots.map(s=>s.info)});
 }
 }
 assert.deepEqual(report.errors,[]);report.passed=true;
 }finally{fs.writeFileSync(path.join(out,'comparison.json'),JSON.stringify(report,null,2));await browser.close()}
 console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
