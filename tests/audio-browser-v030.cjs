'use strict';
// Native Mac Chrome API acceptance. Never mocks Web Audio or Web Speech.
// No microphone, loopback device, or external audio capture is used.
// Usage: node tests/audio-browser-v030.cjs [--headed]
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const assemble=require('./assemble.cjs');
const OUT=path.resolve(process.env.FEG_AUDIO_EVIDENCE_DIR||path.join(__dirname,'../../work/audio-browser'));
const headed=process.argv.includes('--headed');
const chromePath=process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const report={startedAt:new Date().toISOString(),status:'running',browser:{path:chromePath,headed,profile:'Playwright isolated temporary profile',autoplayOverride:false,defaultAudioMuteRemoved:true,softwareGLFallbackRemoved:true},checks:[],blocked:[],errors:[],limitations:[
 'Analysers measure the internally generated Web Audio graph, not the physical speakers.',
 'Native speech events confirm synthesis lifecycle, not subjective intelligibility or pronunciation quality.',
 'No iPhone/iPad, screen-lock, or OS-level audio interruption acceptance is claimed.',
 'The test-only seam advances audio events directly and freezes gameplay animation; production files are unchanged.'
]};
fs.mkdirSync(OUT,{recursive:true});
function save(){const body=JSON.stringify(report,null,2)+'\n';fs.writeFileSync(path.join(OUT,'audio-browser-report.json'),body);fs.writeFileSync(path.join(OUT,'audio-browser-'+(headed?'headed':'headless')+'-report.json'),body);}
function pass(name,evidence={}){report.checks.push({name,status:'pass',...evidence});console.log('PASS '+name);}
function blocked(name,reason,evidence={}){report.blocked.push({name,reason,...evidence});console.log('BLOCKED '+name+': '+reason);}
function instrument(html){
 const anchor='select(0);refreshHud();requestAnimationFrame(frame);';
 assert.equal(html.split(anchor).length,2,'one test-only seam');
 return html.replace(anchor,String.raw`
// Native audio observers below are added only to the QA fixture response.
const audioQAButton=document.createElement('button');audioQAButton.id='qaAudioGesture';audioQAButton.textContent='QA audio gesture';
audioQAButton.style.cssText='position:fixed;bottom:8px;left:8px;z-index:9999;padding:12px';document.body.appendChild(audioQAButton);
window.__audioQA={events:[],action:null,analysers:{},
 get audio(){return audio},get diagnostics(){return window.kemari.getAudioDiagnostics()},
 attach(){if(this.analysers.output)return;for(const [name,bus] of Object.entries({output:audio.limiterV030,music:audio.musicBus,fx:audio.fxBus})){const a=audio.ctx.createAnalyser();a.fftSize=4096;bus.connect(a);this.analysers[name]=a;}},
 sample(name='output'){const a=this.analysers[name],data=new Float32Array(a.fftSize);a.getFloatTimeDomainData(data);let peak=0,sum=0;for(const v of data){if(!Number.isFinite(v))throw Error('Nonfinite audio sample');peak=Math.max(peak,Math.abs(v));sum+=v*v;}return {peak,rms:Math.sqrt(sum/data.length),contextTime:audio.ctx.currentTime};},
 pump(){soundPumpV030()},success(){audio.hit(true,soundV030.successes+1,false)},
 effect(isPlayer=false){audio.hit(isPlayer,0,false)},silence(){stopSourcesV030();state.mode='idle'},
 phase(value){duelV022.phase=value;audio.applyMix()},
 speech(text,id){const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.82;u.pitch=1;u.volume=audio.voiceVolume;
  const voices=speechSynthesis.getVoices();u.voice=voices.find(v=>/^en-US/i.test(v.lang)&&/Samantha|Ava/i.test(v.name))||voices.find(v=>/^en-US/i.test(v.lang))||null;
  for(const type of ['start','end','error'])u.addEventListener(type,e=>this.events.push({id,type,error:e.error||null,at:performance.now(),text,voice:u.voice?.name||null,lang:u.lang}));
  this.lastUtterance=u;audio.speak(u,()=>this.events.push({id,type:'released',at:performance.now()}));
 },
 activate(){audio.userChoice=true;audio.set(true);state.mode='playing';campaignV030.phase='match';},
 resumeMusic(){state.mode='playing';soundPumpV030()},
 renderer(){const gl=renderer.gl,e=gl.getExtension('WEBGL_debug_renderer_info');return {version:gl.getParameter(gl.VERSION),renderer:gl.getParameter(e?e.UNMASKED_RENDERER_WEBGL:gl.RENDERER),error:gl.getError()};}
};
audioQAButton.addEventListener('click',()=>{const action=window.__audioQA.action;window.__audioQA.action=null;if(action?.kind==='activate')window.__audioQA.activate();else if(action?.kind==='speech')window.__audioQA.speech(action.text,action.id);});
select(0);refreshHud();updateScene(0);
`);
}
async function gesture(page,action){await page.evaluate(a=>{window.__audioQA.action=a},action);await page.locator('#qaAudioGesture').click();}
async function samples(page,name='output',count=10,interval=30){
 const values=[];for(let i=0;i<count;i++){await page.waitForTimeout(interval);values.push(await page.evaluate(n=>__audioQA.sample(n),name));}
 return {peak:Math.max(...values.map(v=>v.peak)),rms:Math.sqrt(values.reduce((s,v)=>s+v.rms*v.rms,0)/values.length),minimumRms:Math.min(...values.map(v=>v.rms)),firstContextTime:values[0].contextTime,lastContextTime:values.at(-1).contextTime};
}
async function volume(page,id,value){await page.locator('#'+id).evaluate((e,v)=>{e.value=String(v);e.dispatchEvent(new Event('input',{bubbles:true}));},value);}
async function speechEvent(page,id,type,timeout=12000){
 await page.waitForFunction(({id,type})=>__audioQA.events.some(e=>e.id===id&&(e.type===type||e.type==='error')),{id,type},{timeout});
 return page.evaluate(({id,type})=>__audioQA.events.find(e=>e.id===id&&(e.type===type||e.type==='error')),{id,type});
}
async function run(){
 let browser,page;
 try{browser=await chromium.launch({executablePath:chromePath,headless:!headed,ignoreDefaultArgs:['--mute-audio','--enable-unsafe-swiftshader']});}
 catch(e){report.status='blocked';blocked('Chrome launch',e.message);report.finishedAt=new Date().toISOString();save();process.exitCode=2;return;}
 try{
  report.browser.version=browser.version();
  const context=await browser.newContext({viewport:{width:1024,height:768}});page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  const source=instrument(assemble());await page.route('http://feg-audio.test/**',route=>route.fulfill({contentType:'text/html',body:source}));
  await page.goto('http://feg-audio.test/?stage=jingu');await page.waitForFunction(()=>!!window.__audioQA);
  const renderer=await page.evaluate(()=>__audioQA.renderer());assert.equal(renderer.error,0);assert(!/swiftshader|llvmpipe|software rasterizer/i.test(renderer.renderer),'hardware renderer required');
  report.browser.renderer=renderer.renderer;report.browser.userAgent=await page.evaluate(()=>navigator.userAgent);pass('system Chrome hardware WebGL fixture',renderer);
  assert.equal(await page.evaluate(()=>__audioQA.diagnostics.contextState),'not-created','load must not create an autoplay context');
  await gesture(page,{kind:'activate'});await page.waitForFunction(()=>__audioQA.audio.ctx?.state==='running');
  await page.evaluate(()=>{__audioQA.attach();__audioQA.pump()});
  const initial=await page.evaluate(()=>({diagnostics:__audioQA.diagnostics,sampleRate:__audioQA.audio.ctx.sampleRate,baseLatency:__audioQA.audio.ctx.baseLatency}));
  assert.equal(initial.diagnostics.contexts,1);assert.equal(initial.diagnostics.shoVoices,5);pass('trusted click unlocks native AudioContext',initial);
  await page.waitForTimeout(900);const bgm=await samples(page);assert(bgm.rms>1e-5,'BGM must generate nonzero finite PCM');pass('synthesized sho BGM produces signal',bgm);
  await page.evaluate(()=>__audioQA.pump());assert.equal(await page.evaluate(()=>__audioQA.diagnostics.layer),0,'elapsed time cannot unlock music layers');
  for(let n=0;n<8;n++){await page.evaluate(()=>__audioQA.success());await page.waitForTimeout(110);}
  const layers=await page.evaluate(()=>__audioQA.diagnostics);assert.equal(layers.layer,3);assert(layers.counters.string&&layers.counters.flute&&layers.counters.taiko);pass('native success events add strings flute and taiko',{diagnostics:layers,output:await samples(page)});
  await page.evaluate(()=>__audioQA.silence());await page.waitForTimeout(200);
  for(const isPlayer of [false,true]){await page.evaluate(player=>__audioQA.effect(player),isPlayer);const fx=await samples(page,'fx',8,15);assert(fx.peak>1e-5,'hit SE must generate native PCM');pass((isPlayer?'player':'CPU')+' electronic kick produces signal',fx);await page.waitForTimeout(300);}
  await volume(page,'musicVolume',100);await page.evaluate(()=>__audioQA.resumeMusic());await page.waitForTimeout(1500);const full=await samples(page);
  await volume(page,'musicVolume',10);await page.waitForTimeout(1200);const quiet=await samples(page);assert(quiet.rms<full.rms*.25&&quiet.rms>0,'volume slider must attenuate native output');pass('BGM slider attenuates actual graph',{full,quiet,ratio:quiet.rms/full.rms});
  await volume(page,'musicVolume',0);await page.waitForTimeout(1400);const zero=await samples(page);assert(zero.peak<1e-5,'zero music gain must settle to silence');pass('zero BGM volume is silent',zero);
  await volume(page,'musicVolume',80);await page.locator('#sound').click();await page.waitForTimeout(250);const mute=await samples(page);assert(mute.peak<1e-7,'mute must silence native output');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('feg.audio.v1')).enabled),false);pass('mute stops sources and persists preference',{signal:mute,diagnostics:await page.evaluate(()=>__audioQA.diagnostics)});
  await page.locator('#sound').click();await page.evaluate(()=>__audioQA.pump());await page.waitForTimeout(900);assert((await samples(page)).rms>1e-5);assert.equal(await page.evaluate(()=>__audioQA.diagnostics.contexts),1);pass('unmute reuses one native context');
  await page.evaluate(()=>__audioQA.audio.ctx.suspend());await page.waitForFunction(()=>__audioQA.diagnostics.needsGesture&&__audioQA.diagnostics.activeSources===0);
  await page.locator('#audioResumeV030').click();await page.waitForFunction(()=>__audioQA.audio.ctx.state==='running');await page.evaluate(()=>__audioQA.pump());await page.waitForTimeout(900);const recovered=await samples(page);assert(recovered.rms>1e-5);assert.equal(await page.evaluate(()=>__audioQA.diagnostics.contexts),1);pass('native suspend and visible gesture recovery',{signal:recovered,diagnostics:await page.evaluate(()=>__audioQA.diagnostics)});
  try{await page.waitForFunction(()=>speechSynthesis.getVoices().length>0,null,{timeout:8000});}
  catch(e){blocked('native speech voices','Chrome exposed zero native voices; no speech pass is claimed');}
  const voices=await page.evaluate(()=>speechSynthesis.getVoices().map(v=>({name:v.name,lang:v.lang,localService:v.localService,default:v.default})));
  report.nativeSpeech={voices,events:[]};
  if(voices.length){
   assert(voices.some(v=>/^en(-|_)/i.test(v.lang)),'an English native voice is required');pass('native system speech voices available',{count:voices.length,english:voices.filter(v=>/^en(-|_)/i.test(v.lang))});
   let speechWorks=false;
   try{
    await gesture(page,{kind:'speech',text:'think',id:'word'});const start=await speechEvent(page,'word','start');
    if(start.type==='error')blocked('native speech playback',start.error,{event:start});
    else{const mix=await page.evaluate(()=>__audioQA.diagnostics);assert(mix.ducked);assert.equal(mix.musicTarget,.8*.60);const end=await speechEvent(page,'word','end');
     if(end.type==='error')blocked('native speech completion',end.error,{event:end});else{speechWorks=true;pass('native word starts and ends with accompaniment ducking',{start,end,duckedMix:mix.musicTarget});}}
   }catch(e){if(e.name==='TimeoutError')blocked('native speech playback','Native start/end events did not arrive within 12 seconds');else throw e;}
   if(speechWorks){
    const long='This pronunciation test keeps the native voice speaking until the next word replaces it.';
    // Observe actual native PCM during sustained speech, including the quietest
    // dramatic scene. The same sho sources and context must keep running.
    const speechContinuity=[];
    for(const [phase,factor] of [['front',1],['charge',.24]]){
     await page.evaluate(value=>__audioQA.phase(value),phase);await page.waitForTimeout(1100);const before=await samples(page,'music',8,25);
     const id='continuous-'+phase,prior=await page.evaluate(()=>__audioQA.diagnostics);
     await gesture(page,{kind:'speech',text:long,id});assert.equal((await speechEvent(page,id,'start')).type,'start');
     await page.waitForTimeout(350);const during=await samples(page,'music',12,25),mix=await page.evaluate(()=>__audioQA.diagnostics);
     assert(mix.ducked,'measurement must overlap native speech');assert.equal(mix.musicTarget,.8*Math.min(factor,.60));
     assert(during.minimumRms>1e-5,'no sampled speech window can silence BGM');
     const ratio=during.rms/before.rms,expected=Math.min(factor,.60)/factor;
     assert(Math.abs(ratio-expected)<.12,'native PCM follows one moderate gain reduction');
     assert.equal(mix.counters.sho,prior.counters.sho,'speech must not restart sustained music');assert.equal(mix.contexts,prior.contexts);
     assert.equal((await speechEvent(page,id,'end')).type,'end');speechContinuity.push({phase,before,during,ratio,expected,musicTarget:mix.musicTarget});
    }
    pass('native pronunciation preserves continuous BGM without stacked ducking',{phases:speechContinuity});await page.evaluate(()=>__audioQA.phase('front'));
    await gesture(page,{kind:'speech',text:long,id:'replaced'});const oldStart=await speechEvent(page,'replaced','start');assert.equal(oldStart.type,'start');
    await gesture(page,{kind:'speech',text:'ship',id:'replacement'});const newStart=await speechEvent(page,'replacement','start');assert.equal(newStart.type,'start');const newEnd=await speechEvent(page,'replacement','end');assert.equal(newEnd.type,'end');
    const cancellation=await page.evaluate(()=>__audioQA.events.find(e=>e.id==='replaced'&&e.type==='error'));
    assert(cancellation&&['interrupted','canceled','cancelled'].includes(cancellation.error),'native cancellation event required');assert.equal(await page.evaluate(()=>speechSynthesis.pending),false);pass('native replacement cancels old speech without queue',{oldStart,cancellation,newStart,newEnd});
    await gesture(page,{kind:'speech',text:long,id:'muted-voice'});assert.equal((await speechEvent(page,'muted-voice','start')).type,'start');await page.locator('#sound').click();
    await page.waitForFunction(()=>!speechSynthesis.speaking&&!speechSynthesis.pending);assert.equal(await page.evaluate(()=>__audioQA.diagnostics.voiceTimer),false);assert.equal(await page.evaluate(()=>__audioQA.diagnostics.ducked),false);
    pass('mute cancels native pronunciation',{events:await page.evaluate(()=>__audioQA.events.filter(e=>e.id==='muted-voice')),diagnostics:await page.evaluate(()=>__audioQA.diagnostics)});
   }
  }
  report.nativeSpeech.events=await page.evaluate(()=>__audioQA.events);assert.deepEqual(report.errors,[],'no browser runtime errors');
  report.status=report.blocked.length?'partial':'passed';
 }catch(e){report.status='failed';report.errors.push({message:e.message,stack:e.stack});console.error(e);process.exitCode=1;}
 finally{
  if(page&&!page.isClosed())try{report.finalDiagnostics=await page.evaluate(()=>__audioQA?.diagnostics);if(report.nativeSpeech)report.nativeSpeech.events=await page.evaluate(()=>__audioQA.events);await page.evaluate(()=>{speechSynthesis.cancel();__audioQA?.audio.dispose()});}catch(e){report.cleanupError=e.message;}
  report.finishedAt=new Date().toISOString();save();await browser.close();
 }
 if(report.status==='partial')process.exitCode=2;console.log(JSON.stringify({status:report.status,checks:report.checks.length,blocked:report.blocked,report:path.join(OUT,'audio-browser-report.json')}));
}
run().catch(e=>{report.status='failed';report.errors.push(e.stack||String(e));save();console.error(e);process.exitCode=1;});
