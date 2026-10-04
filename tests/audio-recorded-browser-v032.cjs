'use strict';
// Real decode + AudioContext signal measurement; no speaker/device claim.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright'),assemble=require('./assemble.cjs');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.FEG_AUDIO_EVIDENCE_DIR||path.join(root,'../work/audio-recorded-v032'));
const manifestContext={window:{}};require('node:vm').runInNewContext(fs.readFileSync(path.join(root,'content/voice-clips.js'),'utf8'),manifestContext);
const origin='http://feg-recorded.test',first='Yoh, kaette kiharimashita na.',second='Dorehodo oboete haru ka, misete moraimahyoka.';
const report={startedAt:new Date().toISOString(),status:'running',checks:[],errors:[],nativeSpeechCalls:[],limitations:['Web Audio analyser signal, not physical speakers or subjective pronunciation quality.','iPhone/iPad Safari, OS interruptions and screen-lock listening remain unverified.']};fs.mkdirSync(out,{recursive:true});
const source=assemble().replace('select(0);refreshHud();requestAnimationFrame(frame);',String.raw`
window.qaAudio={audio,state,campaign:campaignV030,sound:soundV030,clips:voiceClipsV032,buffers:voiceBuffersV032,pump:soundPumpV030,analysers:{},events:[],
 attach(){if(this.analysers.music)return;for(const [name,node] of Object.entries({music:audio.musicBus,voice:audio.voiceBus,output:audio.limiterV030})){const a=audio.ctx.createAnalyser();a.fftSize=2048;node.connect(a);this.analysers[name]=a;}},
 sample(name){const a=this.analysers[name],values=new Float32Array(a.fftSize);a.getFloatTimeDomainData(values);let sum=0,peak=0;for(const n of values){if(!Number.isFinite(n))throw Error('nonfinite PCM');sum+=n*n;peak=Math.max(peak,Math.abs(n));}return {rms:Math.sqrt(sum/values.length),peak,reduction:audio.limiterV030.reduction};},
 speak(text){audio.speak({text},()=>this.events.push({text,event:'end'}));},
 activate(){audio.set(true);state.mode='playing';campaignV030.phase='match';soundPumpV030();this.attach();},
 phase(value){duelV022.phase=value;audio.applyMix();},
};
const qButton=document.createElement('button');qButton.id='qaAudioGesture';qButton.textContent='QA gesture';qButton.style.cssText='position:fixed;top:0;left:0;z-index:9999';document.body.appendChild(qButton);qButton.onclick=()=>qaAudio.activate();
select(0);refreshHud();updateScene(0);`);
function record(name,evidence={}){report.checks.push({name,...evidence});console.log('PASS '+name);}
async function collect(page,name,n=16){const samples=[];for(let i=0;i<n;i++){await page.waitForTimeout(30);samples.push(await page.evaluate(n=>qaAudio.sample(n),name));}return {rms:samples.reduce((v,s)=>v+s.rms,0)/n,peak:Math.max(...samples.map(s=>s.peak)),maxReduction:Math.min(...samples.map(s=>s.reduction)),samples};}
async function run(){const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:!process.argv.includes('--headed'),ignoreDefaultArgs:['--mute-audio','--enable-unsafe-swiftshader']});
 try{const context=await browser.newContext(),page=await context.newPage();const wait=(fn,arg,options={})=>page.waitForFunction(fn,arg,{polling:50,...options});let delayFirst=0,failFirst=false;
  await page.exposeFunction('__recordNativeSpeech',name=>report.nativeSpeechCalls.push(name));
  await page.addInitScript(()=>{window.__nativeSpeechCalls=[];for(const name of ['speak','cancel','resume']){speechSynthesis[name]=()=>{window.__nativeSpeechCalls.push(name);window.__recordNativeSpeech(name);throw Error('Native speech forbidden in this test');}}window.requestAnimationFrame=()=>0;});
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.route(origin+'/**',async route=>{const pathname=new URL(route.request().url()).pathname;
   if(pathname==='/'||pathname==='/fixture')return route.fulfill({contentType:'text/html',body:source});
   const file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:'missing'});
   if(pathname==='/'+manifestContext.window.FEGVoiceClips[first].file){if(delayFirst)await new Promise(r=>setTimeout(r,delayFirst));if(failFirst)return route.fulfill({status:503,body:'QA temporary failure'});}
   return route.fulfill({contentType:'audio/mpeg',body:fs.readFileSync(file)});
  });
  // Direct navigation has no activation. Its first click must say line one.
  delayFirst=550;await page.goto(origin+'/?intro=1');await wait(()=>!!window.qaAudio);assert.equal(await page.evaluate(()=>kemari.getAudioDiagnostics().contextState),'not-created');assert.match(await page.locator('#dialogueNext').innerText(),/台詞を聞く/);
  await page.locator('#dialogueNext').click();assert.equal(await page.evaluate(()=>qaAudio.campaign.dialogue),0);await wait(t=>kemari.getAudioDiagnostics().voiceStatus==='playing'&&kemari.getAudioDiagnostics().lastVoiceText===t,first);
  await page.evaluate(()=>qaAudio.attach());const firstSignal=await collect(page,'voice');assert(firstSignal.peak>1e-4);record('direct intro with delayed bytes keeps and plays the first Kyoto line',{signal:firstSignal});
  await page.locator('#dialogueNext').click();await wait(t=>kemari.getAudioDiagnostics().voiceStatus==='playing'&&kemari.getAudioDiagnostics().lastVoiceText===t,second);assert.equal(await page.evaluate(()=>qaAudio.campaign.dialogue),1);record('next interrupts first line and speaks second');
  await page.locator('#dialogueNext').click();await wait(()=>qaAudio.state.mode==='ready');await wait(()=>kemari.getAudioDiagnostics().voiceStatus==='playing');assert.equal(await page.evaluate(()=>kemari.getAudioDiagnostics().lastVoiceText),'think');record('practice replaces the dialogue with the first teaching word');
  await page.locator('#qaAudioGesture').click();await page.evaluate(()=>qaAudio.audio.stopVoice());await page.waitForTimeout(800);
  const continuity=[];for(const phase of ['front','charge','rush']){
   await page.evaluate(p=>{qaAudio.phase(p);qaAudio.pump();window.__shoBefore=qaAudio.sound.sho.map(e=>e.source);},phase);await page.waitForTimeout(1200);const before=await collect(page,'music',8);
   await page.evaluate(t=>qaAudio.speak(t),second);await wait(()=>kemari.getAudioDiagnostics().voiceStatus==='playing');
   const [during,voice,output]=await Promise.all([collect(page,'music',12),collect(page,'voice',12),collect(page,'output',12)]);
   assert(during.rms>1e-5);assert(during.rms/before.rms>.85&&during.rms/before.rms<1.15,'voice does not duck score');assert(voice.peak>1e-4);assert(output.peak<1);assert(output.maxReduction>-.5,'voice does not compress the score');
   assert(await page.evaluate(()=>__shoBefore.every((s,i)=>qaAudio.sound.sho[i].source===s)));continuity.push({phase,before,during,voice,output,ratio:during.rms/before.rms});await page.evaluate(()=>qaAudio.audio.stopVoice());
  }record('music and voice produce concurrent PCM without ducking, restarting or compressor pumping',{continuity});
  // Asset coverage/decode check includes every current word, title and call.
  const decoded=await page.evaluate(async()=>{const result=[];for(const [text,clip] of Object.entries(qaAudio.clips)){const bytes=await fetch(clip.file).then(r=>r.arrayBuffer()),b=await qaAudio.audio.ctx.decodeAudioData(bytes);let peak=0;for(const n of b.getChannelData(0))peak=Math.max(peak,Math.abs(n));result.push({text,duration:b.duration,peak,voice:clip.voice});}return result;});
  assert(decoded.length>=88);assert(decoded.every(c=>c.duration>.1&&c.peak>1e-3));record('all manifested voice assets decode to nonempty PCM',{decoded});
  await page.evaluate(()=>{qaAudio.speak('think');qaAudio.speak('ship');qaAudio.speak('vision')});await wait(()=>kemari.getAudioDiagnostics().voiceStatus==='playing');assert.equal(await page.evaluate(()=>qaAudio.sound.active.size-qaAudio.sound.sho.length),1);assert.equal(await page.evaluate(()=>kemari.getAudioDiagnostics().lastVoiceText),'vision');record('rush keeps one latest voice without a queue');
  await page.locator('#sound').click();assert.equal(await page.evaluate(()=>qaAudio.sound.active.size),0);await page.waitForTimeout(250);assert((await collect(page,'output',4)).peak<1e-6);record('mute stops all recorded voices and music');
  await page.locator('#sound').click();await page.evaluate(()=>qaAudio.pump());await page.evaluate(()=>qaAudio.audio.ctx.suspend());await wait(()=>kemari.getAudioDiagnostics().needsGesture);
  await page.locator('#audioResumeV030').click();await wait(()=>qaAudio.audio.ctx.state==='running');await page.evaluate(()=>qaAudio.pump());assert.equal(await page.evaluate(()=>kemari.getAudioDiagnostics().contexts),1);await page.waitForTimeout(700);assert((await collect(page,'music',4)).peak>1e-5);record('native context suspend and gesture resume restore the existing music engine');
  // Fresh title path must complete once, then autonomously play the welcome.
  await page.evaluate(()=>localStorage.clear());delayFirst=0;await page.goto(origin+'/');await page.locator('#start').click();await wait(()=>kemari.getAudioDiagnostics().lastVoiceText==='FIFTEENTH EVER GARDEN'&&kemari.getAudioDiagnostics().voiceStatus==='playing');await wait(t=>qaAudio.campaign.phase==='dialogue'&&kemari.getAudioDiagnostics().lastVoiceText===t&&kemari.getAudioDiagnostics().voiceStatus==='playing',first,{timeout:15000});record('normal START title completion automatically plays first Kyoto line');
  // Failure must remain reviewable/actionable; explicit retry plays the same line.
  await page.evaluate(()=>localStorage.clear());failFirst=true;await page.goto(origin+'/?intro=1');await page.locator('#dialogueNext').click();await wait(()=>kemari.getAudioDiagnostics().speechBlocked);assert.equal(await page.evaluate(()=>qaAudio.campaign.dialogue),0);assert(await page.locator('#audioResumeV030').isVisible());failFirst=false;await page.locator('#audioResumeV030').click();await wait(t=>kemari.getAudioDiagnostics().lastVoiceText===t&&kemari.getAudioDiagnostics().voiceStatus==='playing',first);record('failed download displays retry and retries the same first line');
  assert.deepEqual(await page.evaluate(()=>window.__nativeSpeechCalls),[]);assert.deepEqual(report.nativeSpeechCalls,[]);assert.deepEqual(report.errors,[]);record('zero SpeechSynthesis speak/cancel/resume calls across all navigations and zero browser errors');report.status='passed';await context.close();
 }finally{await browser.close();fs.writeFileSync(path.join(out,'audio-recorded-report.json'),JSON.stringify(report,null,2)+'\n');}
}
run().catch(e=>{report.status='failed';report.failure=e.stack;fs.writeFileSync(path.join(out,'audio-recorded-report.json'),JSON.stringify(report,null,2)+'\n');console.error(e);process.exitCode=1;});
