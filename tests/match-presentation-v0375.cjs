'use strict';
// Production TIME landing, modest defeat stance and their lifecycle boundaries.
// VM records transforms; actual Three.js frames are captured by impact-art-v037.
const assert=require('node:assert/strict'),fs=require('node:fs');
const {vmFixture}=require('./complete-browser-v030.cjs'),assemble=require('./assemble.cjs');
const anchor='select(0);refreshHud();requestAnimationFrame(frame);';
const seam=String.raw`
window.presentationQA={
 match(){campaignV030.phase='match';campaignV030.intro=false;audio.userChoice=true;audio.set(false);state.mode='over';start();beginMatch();state.mode='playing';resetFoot();updateScene(0);},
 time(post){state.flight=state.duration+post;updateScene(0);return [...ball.pos];},
 snapshot(){return JSON.stringify([player.n.pos,player.n.rot,...KICK_NODES_V011.map(k=>[player[k].pos,player[k].rot])]);},
 get age(){return typeof motionV029==='undefined'?99:motionV029.defeatAge;}
};
const presentationRender=renderer.render.bind(renderer);
renderer.render=function(scene){presentationRender(scene);presentationQA.drawn={
 root:[...player.n.pos],body:[...player.body.rot],head:[...player.head.rot],
 knees:[player.knee.rot[2],player.backKnee.rot[2]],
 ball:[...ball.pos],rotation:[...ball.rot]
};};
`;
const source=assemble().replace(anchor,seam+anchor),results=[];
const copy=x=>JSON.parse(JSON.stringify(x));
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
for(const stage of ['jingu','sanjo','shinkyogoku','million'])for(const effects of [true,false]){
 const f=vmFixture(source,{url:'http://feg-qa.test/?stage='+stage}),q=f.w.qa,p=f.w.presentationQA;
 try{
  q.setMotion(effects);p.match();q.beginTimePass();
  const eps=.00001,before=p.time(-eps),contact=p.time(0),after=p.time(eps);
  assert(distance(before,contact)<.0001&&distance(contact,after)<.0001,'TIME position continuous');
  const incoming=contact.map((v,i)=>(v-before[i])/eps),outgoing=after.map((v,i)=>(v-contact[i])/eps);
  assert(distance(incoming,outgoing)<.01,'TIME incoming tangent continues into descent');
  const frames=[];for(let post=0;post<=2.4;post+=1/120)frames.push({post,point:p.time(post)});
  assert(frames.every(a=>a.point[1]>=.245-1e-8),'TIME never sinks below the ground');
  assert(frames[1].point[1]>.9,'TIME begins in the air rather than snapping to the ground');
  const ground=frames.find(a=>a.post>.4&&a.point[1]<.246);assert(ground,'TIME settles onto the ground');
  assert(frames.at(-1).point[0]<contact[0]-1,'TIME retains leftward momentum');
  q.state.flight=q.state.duration+.12;q.draw();q.pause();q.draw();const paused=copy(p.drawn),flight=q.state.flight;
  q.tick(2);assert.equal(q.state.flight,flight,'TIME pause freezes flight');assert.deepEqual(copy(p.drawn),paused,'TIME pause freezes pose and roll');q.pause();
  q.state.flight=q.state.duration+2.479;q.tick(.0005);assert.equal(q.ceremony,'time','TIME existing end remains open');q.tick(.001);assert.equal(q.ceremony,'choice','TIME choice timing unchanged');
  p.match();q.state.hp=0;q.end('hp');assert.equal(q.state.mode,'over','defeat ends immediately');
  q.draw();const first=copy(p.drawn);q.tick(.58);const settled=copy(p.drawn);
  assert(settled.root[1]<.0&&Math.min(...settled.knees)<-.9,'defeat settles into a planted crouch');
  if(effects)assert(settled.root[1]<first.root[1]-.20,'defeat stance settles gradually');
  const canonical=p.snapshot(),age=p.age;for(let i=0;i<30;i++)q.draw();assert.equal(p.snapshot(),canonical,'defeat pose restores after repeated drawing');assert.equal(p.age,age,'drawing cannot consume defeat time');
  assert.deepEqual(copy(p.drawn),settled,'defeat repeated posed frame is stable');
  p.match();q.draw();assert.equal(p.age,99,'retry clears defeat animation');assert(Math.abs(p.drawn.root[1]-.12)<1e-8,'retry restores normal height');
  assert.deepEqual(f.errors,[]);results.push({stage,effects,incoming,outgoing,landingAt:ground.post,defeat:settled});
 }finally{f.close()}
}
if(process.argv[2]){
 const baseline=fs.readFileSync(process.argv[2],'utf8'),flights={};
 for(const [name,html] of [['before',baseline],['after',assemble()]]){
  const f=vmFixture(html.replace(anchor,seam+anchor)),q=f.w.qa,p=f.w.presentationQA;flights[name]=[];
  try{for(const slot of [0,1,2,3])for(const direction of [-1,1]){
   p.match();q.state.rally=3;q.state.selected=slot;q.state.target=slot;q.launchShot('normal',direction,[3.3,1.2,0]);
   flights[name].push({slot,direction,duration:q.state.duration,arc:q.state.arc,samples:[0,.25,.5,.75,1].map(t=>q.sampleBall(t)),window:q.CONFIG.hitWindow,perfect:q.CONFIG.perfectWindow});
  }}finally{f.close()}
 }
 assert.deepEqual(copy(flights.after),copy(flights.before),'normal flight samples and timing remain unchanged');
}
console.log(JSON.stringify({passed:true,results,verification:'Production VM geometry/lifecycle; actual rendering, audible output and physical-device feel are separate'}));
