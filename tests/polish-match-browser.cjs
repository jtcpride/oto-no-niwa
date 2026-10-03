// Current campaign real-time matches; completion is the terminal duel phase before inheritance. Only start skips practice; all later inputs use public DOM controls.
// TTS is mocked; videos and assertions do not validate audible speech or audio mixing.
// Usage: node tests/polish-match-browser.cjs polish-before baseline
//        node tests/polish-match-browser.cjs polish-after
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const label=process.argv[2]||'close-v027',source=process.argv[3],out=path.resolve(__dirname,'../../work');
if(!/^[a-z0-9-]+$/.test(label))throw Error('Use a lowercase output label');
fs.mkdirSync(out,{recursive:true});
const baseline=()=>require('./assemble.cjs')(file=>require('node:child_process').execFileSync('git',['show','bd4b4e4877f167dc7544b3ac57a6690f98e6d968:'+file],{cwd:path.resolve(__dirname,'..'),encoding:'utf8',maxBuffer:4*1024*1024}));
const original=source==='baseline'?baseline():source?fs.readFileSync(source,'utf8'):require('./assemble.cjs')();
const anchor='select(0);refreshHud();requestAnimationFrame(frame);';
assert.equal(original.split(anchor).length,2,'unique match-start seam');
// Isolate question randomness from particle effects while preserving real question/retry logic.
const html=original.replace(anchor,`let questionSeedComparison=42731;
const questionComparison=newQuestion;
newQuestion=function(){const previous=Math.random;Math.random=()=>{questionSeedComparison=(Math.imul(questionSeedComparison,1664525)+1013904223)>>>0;return questionSeedComparison/4294967296};try{return questionComparison();}finally{Math.random=previous;}};
window.closeQuestionTest=()=>({target:closeV027.target,word:closeV027.word});
window.startComparisonMatch=()=>{state.mode='over';start();beginMatch();state.mode='playing';};`+anchor);
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  for(const scenario of ['success','pushback']){
   const context=await browser.newContext({viewport:{width:1024,height:768},recordVideo:{dir:out,size:{width:1024,height:768}},reducedMotion:'no-preference'});
   const page=await context.newPage(),errors=[],prefix=path.join(out,`match-${label}-${scenario}`),shots=new Set();
   page.on('pageerror',e=>{errors.push(e.message);console.error(e.message)});
   await page.addInitScript(()=>{
    let seed=42731;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
    let timer;window.__spoken=[];
    Object.defineProperty(window,'speechSynthesis',{value:{cancel(){clearTimeout(timer)},resume(){},getVoices(){return []},speak(u){__spoken.push(u.text);u.onstart?.();timer=setTimeout(()=>u.onend?.(),200)}}});
   });
   await page.route('http://match-feel.test/**',r=>r.fulfill({contentType:'text/html',body:html}));
   await page.goto('http://match-feel.test/?stage=first-court');
   await page.evaluate(scenario=>{
    startComparisonMatch();let started=null;
    window.comparison={scenario,tts:'mocked; audio not verified',frames:0,inputs:[],phases:[],incoming:0,done:false,initial:kemari.getState()};
    let fired=false,lastPhase='',lastTap=-1,previousFlight=Infinity,previousDirection=0;
    const press=()=>document.querySelector('#kick').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'mouse'}));
    function drive(now){
     if(started===null)started=now;
     const c=comparison,s=kemari.getState(),d=kemari.getDuel?.()||{phase:'front'},phase=d.phase;
     c.frames++;c.latest={mode:s.mode,phase,phaseTime:d.time||0,approach:d.approach||0,spacing:d.spacing,hp:s.hp,cpuHp:s.cpuHp,elapsed:(now-started)/1000};
     if(phase!==lastPhase){c.phases.push({...c.latest});lastPhase=phase;}
     if(s.mode==='over'||phase==='done'){c.done=true;c.final=s;c.duration=(now-started)/1000;return;}
     if(s.direction===-1&&(previousDirection!==-1||s.flight<previousFlight-.1)){fired=false;c.incoming++;}
     previousFlight=s.flight;previousDirection=s.direction;
     if(s.mode==='playing'&&phase==='close'){
      const n=kemari.getClose();
      if(n.stage==='ask'&&n.time>=.85){const q=closeQuestionTest(),wrong=scenario==='pushback'&&n.attempts===1;document.querySelector('[data-symbol="'+((q.target+(wrong?1:0))%4)+'"]').click();}
     }else if(s.mode==='playing'&&phase==='rush'){
      if(now-lastTap>=100){press();lastTap=now;}
     }else if(s.mode==='playing'&&['front','back'].includes(phase)&&s.direction===-1&&!fired){
      const wrong=false,slot=(s.target+(wrong?1:0))%4;
      const button=document.querySelector('[data-symbol="'+slot+'"]');if(!button.disabled&&s.selected!==slot)button.click();
      if(s.flight>=s.duration-.012){
       c.inputs.push({question:c.incoming,wrong,target:s.target,word:s.word,duration:s.duration,error:s.flight-s.duration,phase});press();fired=true;
      }
     }
     requestAnimationFrame(drive);
    }
    requestAnimationFrame(drive);
   },scenario);
   const deadline=Date.now()+120000;
   while(Date.now()<deadline){
    const state=await page.evaluate(()=>comparison);
    if(state.latest&&!shots.has(state.latest.phase)){
     shots.add(state.latest.phase);await page.screenshot({path:prefix+'-'+state.latest.phase+'.png'});
    }
    if(state.latest){
     const p=state.latest,detail=p.phase==='break'&&p.phaseTime>=1?'break-middle':p.phase==='charge'&&p.phaseTime>=.30?'charge-middle':p.phase==='rush'&&p.phaseTime>=2.5?'rush-middle':p.phase==='back'&&p.approach>=.5&&p.spacing<.85?'back-close':null;
     if(detail&&!shots.has(detail)){shots.add(detail);await page.screenshot({path:prefix+'-'+detail+'.png'});}
    }
    if(state.done)break;
    await page.waitForTimeout(100);
   }
   const result=await page.evaluate(()=>({...comparison,close:kemari.getClose(),duel:kemari.getDuel?.(),version:kemari.version,spoken:__spoken}));
   await page.screenshot({path:prefix+'-result.png'});
   fs.writeFileSync(prefix+'.json',JSON.stringify(result,null,2));
   const video=page.video();await context.close();await video.saveAs(prefix+'.webm');
   const raw=await video.path();if(raw!==prefix+'.webm')fs.unlinkSync(raw);
   assert(result.done,'match completed within 120s');assert.equal(result.initial.cpuHp,100);assert.equal(result.initial.hp,100);
   assert.equal(result.final.cpuHp,0);assert(result.final.hp>0);assert.equal(result.final.misses,0);
   assert(result.inputs.every(i=>i.phase==='back'?i.duration>=1.5&&i.duration<=3.5:i.duration>=2.2&&i.duration<=2.6),'front flights preserved; back flights bounded');
   assert.equal(result.close.attempts,scenario==='pushback'?2:1);assert(result.phases.some(p=>p.phase==='close'));assert.deepEqual(errors,[]);console.log(JSON.stringify({scenario,version:result.version,seconds:result.duration,misses:result.final.misses,frames:result.frames,video:prefix+'.webm',phases:[...shots]}));
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
