'use strict';
// Close-contact timing and articulated blowback through the production pose chain.
// VM command recording proves timing/geometry, not GPU output or perceived motion.
const assert=require('node:assert/strict');
const assemble=require('./assemble.cjs');
const {vmFixture}=require('./complete-browser-v030.cjs');
const anchor='select(0);refreshHud();requestAnimationFrame(frame);';
const original=assemble();
assert.equal(original.split(anchor).length,2,'unique impact regression seam');
const source=original.replace(anchor,String.raw`
const impactEventsV037={sounds:[],overtones:[],effects:[]};
const noteImpactV037=audio.note.bind(audio);
audio.note=function(...args){
 if(inCloseV027()&&closeV027.stage==='react'&&args[6]!=='music'){
  if([520,88].includes(args[0]))impactEventsV037.sounds.push({time:closeV027.time,args});
  if([1040,180].includes(args[0]))impactEventsV037.overtones.push({time:closeV027.time,args});
 }
 return noteImpactV037(...args);
};
const effectImpactV037=impactMotionV029;
impactMotionV029=function(point,kind,strength){
 if(motion&&state.mode!=='paused'&&inCloseV027()&&closeV027.stage==='react'&&['hit','guard'].includes(kind))impactEventsV037.effects.push({time:closeV027.time,kind,point:[...point]});
 return effectImpactV037(point,kind,strength);
};
function poseImpactV037(){
 return Object.fromEntries([['player',player],['cpu',cpu]].map(([key,f])=>[key,{
  nodes:Object.fromEntries(['n',...KICK_NODES_V011].map(k=>[k,{pos:[...f[k].pos],rot:[...f[k].rot],scale:[...f[k].scale]}])),
  cloth:(f.characterV030?.cloth||[]).map(c=>({pos:[...c.n.pos],rot:[...c.n.rot],scale:[...c.n.scale]}))
 }]));
}
const renderImpactV037=renderer.render.bind(renderer);
renderer.render=function(scene){renderImpactV037(scene);window.impactDrawV037=poseImpactV037();};
window.impactQA={events:impactEventsV037,
 match(){
  campaignV030.phase='match';campaignV030.intro=false;audio.userChoice=true;audio.set(false);
  state.mode='over';start();beginMatch();state.mode='playing';
  for(const key of ['player','cpu']){Object.assign(strideV024[key],{age:99,attack:99});motionV029[key].age=99;}
  updateScene(0);
 },
 ask(turn=0,target=1){
  this.match();duelV022.entered=true;beginCloseV027();closeV027.turn=turn;askCloseV027();
  this.target(target);impactEventsV037.sounds.length=0;impactEventsV037.overtones.length=0;impactEventsV037.effects.length=0;
 },
 target(target){closeV027.target=target;closeV027.word=ACTIVE_DECK.sounds[target].words[0].text;updateScene(0);},
 step(dt){if(state.mode!=='paused')visualTime+=dt;updateGame(dt);updateScene(dt);},
 advance(seconds){
  const saved=renderer.render;renderer.render=()=>{};
  try{for(let t=0;t<seconds-1e-9;t+=1/120){const dt=Math.min(1/120,seconds-t);this.step(dt);}}
  finally{renderer.render=saved;}this.draw();
 },
 draw(){updateScene(0);},
 canonical(){return JSON.stringify(poseImpactV037());},
 contact(){return {foot:dramaV028.foot,point:dramaV028.contact,guard:dramaV028.guard};},
 pool(){return impactsV029.map(p=>({kind:p.kind,age:p.age,duration:p.duration,hidden:p.e.hidden,point:p.point}));},
 close(){const c=closeV027;return {stage:c.stage,time:c.time,turn:c.turn,score:c.score,picked:c.picked,correct:c.correct,hold:c.hold,contactHeld:c.contactHeld,poseStart:c.poseStart};},
 rules(){return JSON.stringify({hp:state.hp,cpuHp:state.cpuHp,rally:state.rally,flight:state.flight,duration:state.duration,phase:duelV022.phase,time:duelV022.time});},
 blowback(time){this.match();beginDepthV022();duelV022.time=time;updateScene(0);},
 setBlowbackTime(time){duelV022.time=time;updateScene(0);}
};
`+anchor);
const copy=value=>JSON.parse(JSON.stringify(value));
const near=(actual,expected,label,tolerance=1e-7)=>assert(Math.abs(actual-expected)<=tolerance,label+': '+actual+' != '+expected);
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const results=[];
function samePose(actual,expected,label){
 const a=typeof actual==='string'?JSON.parse(actual):actual,b=typeof expected==='string'?JSON.parse(expected):expected,differences=[];
 function visit(x,y,path){
  if(differences.length>=6)return;
  if(typeof x==='number'&&typeof y==='number'){if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x-y)>1e-9)differences.push({path,expected:y,actual:x});return;}
  if(x&&y&&typeof x==='object'&&typeof y==='object'){for(const key of new Set([...Object.keys(x),...Object.keys(y)]))visit(x[key],y[key],path?path+'.'+key:key);return;}
  if(x!==y)differences.push({path,expected:y,actual:x});
 }
 visit(a,b,'');assert.equal(differences.length,0,label+': '+JSON.stringify(differences));
}

function noAnswerReveal(f,label){
 const points=[...f.w.document.querySelectorAll('.close-point')];
 assert.equal(points.length,4,label+' four body choices');
 assert(points.every(e=>!e.hidden&&!e.classList.contains('correct')&&!e.classList.contains('wrong')&&!e.classList.contains('impact-muted')),label+' no answer-colored or dimmed marker');
 const buttons=[...f.w.document.querySelectorAll('[data-symbol]')];
 assert(buttons.every(e=>e.dataset.closePicked==='false'&&e.getAttribute('aria-pressed')==='false'),label+' no selected-answer hint');
}

// Four gameplay outcomes must share the same contact moment. Hold duration is
// chosen by hit/block, not by correctness or which character receives the kick.
{
 const f=vmFixture(source,{url:'http://feg-qa.test/?stage=jingu'}),q=f.w.qa,p=f.w.impactQA;
 try{
  for(const enabled of [true,false])for(const turn of [0,1])for(const correct of [true,false]){
   const guard=(turn===0)===correct,label=`motion=${enabled} turn=${turn} correct=${correct}`,expectedHold=enabled?(guard?.38:.48):0;
   q.setMotion(enabled);p.ask(turn,1);noAnswerReveal(f,label);
   const askPose=JSON.stringify(f.w.impactDrawV037);
   for(let target=0;target<4;target++){p.target(target);noAnswerReveal(f,label);samePose(f.w.impactDrawV037,askPose,label+' ask posture cannot disclose the target');}
   p.target(1);q.answer(correct);assert.equal(q.close.stage,'ask',label+' immediate input ignored');
   p.advance(.249);q.answer(correct);assert.equal(q.close.stage,'ask',label+' input before .25 ignored');
   assert.equal(q.close.score,0,label+' early input cannot score');
   p.step(.001);q.answer(correct);p.draw();
   assert.equal(q.close.stage,'react',label+' input at .25 accepted');
   assert.equal(q.close.score,correct?1:0,label+' answer scored once');
   const committed=copy(p.close());
   for(let n=0;n<5;n++)q.select((q.close.target+n)%4);
   assert.deepEqual(copy(p.close()),committed,label+' repeated reaction input ignored');
   assert.equal(p.events.sounds.length,0,label+' no sound on input');
   assert.equal(p.events.overtones.length,0,label+' no contact overtone on input');
   assert.equal(p.events.effects.length,0,label+' no effect on input');
   p.advance(.239);assert.equal(p.events.sounds.length,0,label+' no sound before contact');
   assert.equal(p.events.overtones.length,0,label+' no contact overtone before contact');
   assert.equal(p.events.effects.length,0,label+' no effect before contact');
   p.step(.001);
   near(q.close.time,.24,label+' contact time');near(q.close.hold,expectedHold,label+' complete hold starts at contact');
   assert.equal(q.close.contactHeld,true,label+' contact latch set');
   assert.equal(p.events.sounds.length,1,label+' contact sound once');near(p.events.sounds[0].time,.24,label+' sound at contact');
   assert.equal(p.events.sounds[0].args[0],guard?520:88,label+' primary cue matches hit or guard');
   assert.equal(p.events.overtones.length,1,label+' contact overtone once');near(p.events.overtones[0].time,.24,label+' overtone scheduled at contact');
   assert.equal(p.events.overtones[0].args[0],guard?1040:180,label+' overtone matches hit or guard');
   assert.equal(p.events.effects.length,enabled?1:0,label+' bounded contact effect');
   if(enabled){assert.equal(p.events.effects[0].kind,guard?'guard':'hit',label+' effect matches outcome');near(p.events.effects[0].time,.24,label+' effect at contact');}
   const contact=copy(p.contact());assert.equal(contact.guard,guard,label+' pose matches outcome');
   assert(distance(contact.foot,contact.point)<.05,label+' foot reaches shared contact');
   const canonical=p.canonical(),heldPose=JSON.stringify(f.w.impactDrawV037);
   for(let n=0;n<5;n++)p.draw();
   samePose(p.canonical(),canonical,label+' repeated contact render restores transforms');
   samePose(f.w.impactDrawV037,heldPose,label+' repeated contact render stable');
   if(enabled){
    p.advance(expectedHold/2);
    near(q.close.time,.24,label+' reaction clock frozen during hold');near(q.close.hold,expectedHold/2,label+' hold counts down');
    samePose(f.w.impactDrawV037,heldPose,label+' posed transforms remain frozen while hold elapses');
    q.pause();p.draw();assert.equal(q.state.mode,'paused',label+' paused');
    const paused=copy(p.close()),pausedPose=JSON.stringify(f.w.impactDrawV037);
    p.step(2);q.select(q.close.target);for(let n=0;n<5;n++)p.draw();
    assert.deepEqual(copy(p.close()),paused,label+' pause preserves hold and score');
    samePose(f.w.impactDrawV037,pausedPose,label+' pause preserves posed transforms');
    q.pause();assert.equal(q.state.mode,'playing',label+' resumed');
    p.advance(expectedHold/2+.02);
   }else p.advance(.02);
   assert.equal(q.close.hold,0,label+' hold releases');
   assert(q.close.time>.24&&q.close.time<.28,label+' animation resumes after hold');
   assert.equal(p.events.sounds.length,1,label+' no repeated sound after held contact');
   assert.equal(p.events.overtones.length,1,label+' no repeated contact overtone');
   assert.equal(p.events.effects.length,enabled?1:0,label+' no repeated effect after held contact');
   p.advance(.799-q.close.time);assert.equal(q.close.stage,'react',label+' original reaction clock retained');
   p.step(.002);assert.equal(q.close.stage,'ask',label+' next question after reaction');
   assert.equal(q.close.turn,turn+1,label+' advances one turn');assert.equal(q.close.score,correct?1:0,label+' no duplicate score at release');
   noAnswerReveal(f,label+' next question');
   results.push({enabled,turn,correct,kind:guard?'guard':'hit',hold:expectedHold});
  }
  q.setMotion(true);p.ask();p.advance(.3);q.answer(true);p.advance(.3);assert(q.close.hold>0,'guard hold active before effects toggle');
  q.setMotion(false);p.step(.02);assert.equal(q.close.hold,0,'effects OFF releases a running hold');assert(q.close.time>.24,'reaction resumes when effects disabled');
  p.advance(.6);assert.equal(q.close.stage,'ask','effects toggle reaches next question');noAnswerReveal(f,'effects toggled mid-hold');
  q.setMotion(true);p.ask();p.advance(3.199);assert.equal(q.close.stage,'ask','ask window remains open before 3.2 seconds');
  // Repeated 1/120 steps can leave the sum a few ulps below the exact boundary.
  p.step(3.2-q.close.time+1e-9);assert.equal(q.close.stage,'react','ask times out at 3.2 seconds');assert.equal(q.close.picked,-1,'timeout keeps no selection');assert.equal(q.close.score,0,'timeout cannot score');
  p.advance(.240001);assert(q.close.hold>0,'timeout reaches a held hit');
  // Campaign start intentionally accepts a retry only from paused/over states.
  q.pause();assert.equal(q.state.mode,'paused','pause held contact before retry');
  q.start();p.draw();assert.equal(q.close.stage,'idle','restart exits close combat');
  assert.equal(q.close.hold,0,'restart clears remaining hold');assert.equal(q.close.contactHeld,false,'restart clears contact latch');
  assert(p.pool().every(e=>e.hidden),'restart clears contact effects');
  const restartSounds=p.events.sounds.length,restartOvertones=p.events.overtones.length,restartEffects=p.events.effects.length;p.advance(.7);
  assert.equal(p.events.sounds.length,restartSounds,'restart cannot replay stale contact sound');assert.equal(p.events.overtones.length,restartOvertones,'restart cannot replay stale contact overtone');assert.equal(p.events.effects.length,restartEffects,'restart cannot replay stale contact effect');
  assert.deepEqual(f.errors,[],'close-contact runtime errors');
 }finally{f.close();}
}

// Articulation must change the limbs themselves, not merely rotate the root.
// Wide sleeves, the child rig, and the tall rig use the same unchanged skeleton.
const blowback=[];
for(const stage of ['jingu','shinkyogoku','million']){
 const f=vmFixture(source,{url:'http://feg-qa.test/?stage='+stage}),q=f.w.qa,p=f.w.impactQA;
 try{
  q.setMotion(true);p.blowback(0);const neutral=copy(f.w.impactDrawV037.cpu.nodes),air=[];
  for(const time of [.18,.4,.75,1.12,1.5,2.1,2.8,3.39]){
   p.setBlowbackTime(time);const canonical=p.canonical(),rules=p.rules(),drawn=JSON.stringify(f.w.impactDrawV037);
   for(let n=0;n<4;n++)p.draw();
   samePose(p.canonical(),canonical,stage+' blowback transforms restored at '+time);
   samePose(f.w.impactDrawV037,drawn,stage+' blowback repeat pose stable at '+time);
   assert.equal(p.rules(),rules,stage+' rendering cannot advance gameplay at '+time);
   if(time<1.25){const nodes=copy(f.w.impactDrawV037.cpu.nodes);air.push({time,nodes,armDifference:distance(nodes.arm.rot,nodes.farArm.rot),kneeDifference:distance(nodes.knee.rot,nodes.backKnee.rot)});}
  }
  assert(air.filter(a=>a.armDifference>.1&&a.kneeDifference>.1).length>=2,stage+' airborne arms and knees need visible asymmetry');
  for(const key of ['arm','farArm','knee','backKnee'])assert(Math.max(...air.map(a=>distance(a.nodes[key].rot,neutral[key].rot)))>.15,stage+' '+key+' must articulate during flight');
  p.setBlowbackTime(.75);q.pause();p.draw();const paused=p.canonical(),drawn=JSON.stringify(f.w.impactDrawV037),time=q.duel.time;
  p.step(2);for(let n=0;n<4;n++)p.draw();assert.equal(q.duel.time,time,stage+' pause freezes blowback time');samePose(p.canonical(),paused,stage+' paused blowback restores transforms');samePose(f.w.impactDrawV037,drawn,stage+' paused blowback pose stable');
  blowback.push({stage,air:air.map(({time,armDifference,kneeDifference})=>({time,armDifference,kneeDifference}))});assert.deepEqual(f.errors,[],stage+' runtime errors');
 }finally{f.close();}
}
console.log(JSON.stringify({passed:true,close:results,blowback,verification:'VM production timing, DOM, and posed-transform recording; GPU rendering, audible contact, perceived motion, and physical devices unverified'}));
