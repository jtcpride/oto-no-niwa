// Motion-only refinement: keep questions, timings, damage and phase transitions intact.
window.otoPatchMotionV029=function(html){
 function once(a,b){if(html.split(a).length!==2)throw Error('v0.29 anchor: '+a.slice(0,65));html=html.replace(a,b);}
 once("version:'0.28.0-pursuit-and-impact'","version:'0.29.0-motion-and-contact'");
 once('FIFTEENTH EVER GARDEN — v0.28.0','FIFTEENTH EVER GARDEN — v0.29.0');
 once('poseFoot(dt);applyKickFormV011();','poseFoot(dt);if(!layeredMotionV029())applyKickFormV011();');
 once("const k=f!==player&&f.kick>0?Math.sin((.38-f.kick)/.38*Math.PI):0;","const k=!['practice','match'].includes(ceremony)&&f!==player&&f.kick>0?Math.sin((.38-f.kick)/.38*Math.PI):0; /* Rally CPU uses the articulated pose; TIME keeps its pass. */");
 once('.245+Math.abs(Math.sin(r*Math.PI*2.6))*.02*(1-r)', '.245+.07*Math.exp(-8*r)*Math.abs(Math.sin(r*Math.PI*6))');
 once('</style>',`
 .motion-impact-v029{position:absolute;z-index:3;pointer-events:none;transform:translate(-50%,-50%);color:#ffe3a5;width:28px;height:28px}
 .motion-impact-v029 .ring{position:absolute;inset:4px;border:2px solid currentColor;border-radius:50%}
 .motion-impact-v029 .ray{position:absolute;left:50%;top:50%;width:2px;height:10px;background:currentColor;transform-origin:50% 0}
 .motion-impact-v029.guard{color:#a5e6ff}.motion-impact-v029.guard .ring{border-radius:30%;border-style:double}
 .motion-impact-v029.dust{color:#b9baa5}.motion-impact-v029.dust .ring{border:0}.motion-impact-v029.dust .ray{width:4px;height:4px;border-radius:50%}
 </style>`);
 once("$('#start').addEventListener('click',start);",String.raw`
const motionV029={player:{age:99,slot:0,point:null},cpu:{age:99,slot:0,point:null},spin:0,serial:0,closeCue:false,land:[],rushImpact:99};
const impactsV029=Array.from({length:10},()=>{const e=document.createElement('div');e.className='motion-impact-v029';e.hidden=true;
 const ring=document.createElement('i');ring.className='ring';e.appendChild(ring);
 const rays=[];for(let i=0;i<4;i++){const ray=document.createElement('i');ray.className='ray';e.appendChild(ray);rays.push(ray);}
 $('#arena').appendChild(e);return {e,rays,age:99,duration:.3,point:[0,0,0],kind:'kick',strength:1};});
function impactMotionV029(point,kind='kick',strength=1){
 if(!motion||state.mode==='paused')return;
 const p=impactsV029[motionV029.serial++%impactsV029.length];
 Object.assign(p,{age:0,point:[...point],kind,strength,duration:kind==='guard'?.20:kind==='kick'?.24:kind==='dust'?.30:.32});
}
const resetMotionV029=resetDuelV022;
resetDuelV022=function(keep=false){resetMotionV029(keep);for(const key of ['player','cpu'])Object.assign(motionV029[key],{age:99,slot:0,point:null});Object.assign(motionV029,{spin:0,serial:0,closeCue:false,land:[],rushImpact:99});impactsV029.forEach(p=>{p.age=99;p.e.hidden=true;});};
function layeredMotionV029(){
 return (feelEnabledV023&&duelV022.entered&&ceremony==='match')||motionV029.player.age<.72;
}
const launchMotionV029=launchShot;
launchShot=function(kind,direction,point){const r=launchMotionV029(kind,direction,point);
 if(['practice','match'].includes(ceremony)&&['front','back'].includes(duelV022.phase)){
  const side=direction===1?'player':'cpu',a=motionV029[side];
  Object.assign(a,{age:0,slot:direction===1?state.selected:(feelEnabledV023&&duelV022.entered?strideV024.cpu.slot:state.rally%4),point:depthPointV022(point)});
  if(direction===-1)impactMotionV029(a.point,'kick',.7);
 }
 return r;
};
// Replace broad random particles with brief, bounded contact accents. Rush has
// world-space endpoints already, so it must not use the old generic burst point.
burst=function(pos){
 if(['rush','settle','done'].includes(duelV022.phase))return;
 const hit=state.flight>=state.duration*.95&&state.direction===1;
 impactMotionV029(depthPointV022(pos),hit?'hit':'kick',hit?1.2:state.shot==='perfect'?1:.7);
};
const gameMotionV029=updateGame;
updateGame=function(dt){
 if(state.mode==='paused')return;
 for(const p of impactsV029)p.age+=dt;
 for(const key of ['player','cpu'])motionV029[key].age+=dt;
 motionV029.rushImpact+=dt;
 const before=state.mode,phase=duelV022.phase,stage=closeV027.stage,closeAge=closeV027.time;
 const balls=['rush','settle'].includes(phase)?rushBallsV022.filter(b=>b.volley&&b.age<.3).map(b=>[b,b.age]):[];
 const steps=feelEnabledV023?['player','cpu'].map(key=>({key,age:strideV024[key].age})):[];
 const r=gameMotionV029(dt);
 if(before==='ready'&&state.mode==='playing'&&['practice','match'].includes(ceremony)){
  Object.assign(motionV029.cpu,{age:0,slot:0,point:depthPointV022(state.flightStart)});impactMotionV029(motionV029.cpu.point,'kick',.7);
 }
 for(const [b,age] of balls)if(age<.3&&b.age>=.3){impactMotionV029(b.volley.to,'hit',.8);motionV029.rushImpact=0;}
 if(inCloseV027()&&stage==='react'&&closeV027.stage==='react'&&closeAge<.20&&closeV027.time>=.20)motionV029.closeCue=true;
 for(const {key,age} of steps){const a=strideV024[key];if(age<.88&&a.age>=.88&&Math.abs(a.to-a.from)>.01&&['back','impact'].includes(duelV022.phase))motionV029.land.push(key);}
 return r;
};
const rotateMotionV029=rotateBallV018;
rotateBallV018=function(dt,pos){
 if(state.mode==='paused')return;
 if(!['practice','match'].includes(ceremony))return rotateMotionV029(dt,pos);
 if(!motion)return;
 // One dominant spin axis with a small tilt: the colored seams remain legible.
 const speed=Math.min(8,Math.max(2.6,Math.abs(flightSpinV012)))*(state.direction===1?-1:1);
 motionV029.spin+=dt*speed;ball.rot=[.16*Math.sin(motionV029.spin*.35),flightCurveV012*.28,motionV029.spin];
};
function localMotionV029(f,p){
 const x=p[0]-f.n.pos[0],y=p[1]-f.n.pos[1],z=p[2]-f.n.pos[2],a=f.n.rot[1];
 return [Math.cos(a)*x-Math.sin(a)*z,y,Math.sin(a)*x+Math.cos(a)*z];
}
function footMotionV029(f,key){
 const chain=key==='leg'?[f.shoe,f.knee,f.thigh,f.leg,f.n]:[f.backShoe,f.backKnee,f.backThigh,f.back,f.n];
 return chain.reduce((p,n)=>transformDramaV028(p,n),[0,0,0]);
}
function kickMotionV029(f,slot,age,point,save,back=false){
 if(age>=.72)return;
 for(const key of KICK_NODES_V011)save(f[key]);
 const strength=motion?1:.3,hold=1-easeV023(age,.12,.52),settle=Math.sin(Math.PI*easeV023(age,.45,.72));
 const style=KICKS_V012[slot],key=f===cpu?(style.leg==='leg'?'back':'leg'):style.leg,support=key==='leg'?'back':'leg';
 const supportPoint=transformDramaV028([f[support].pos[0],.09,f[support].pos[2]],f.n);
 // Bring the hip within the two-link leg's reach, without moving the flying ball.
 const contact=point||transformDramaV028([.70,.72,.22],f.n),local=localMotionV029(f,contact),hip=f[key];
 const distance=Math.hypot(local[0]-hip.pos[0],local[1]-hip.pos[1],local[2]-hip.pos[2]);
 if(distance>.91){save(f.n);const shift=Math.min(.32,distance-.90)*hold*strength;f.n.pos[0]+=Math.cos(f.n.rot[1])*shift;f.n.pos[2]-=Math.sin(f.n.rot[1])*shift;}
 const hit=localMotionV029(f,contact),follow=easeV023(age,0,.18),returning=easeV023(age,.18,.50);
 let end=[hit[0]+.18,hit[1]+.20,hit[2]];
 if(slot===1)end=[hit[0]+.08,hit[1]+.26,hit[2]+.58];
 if(slot===2)end=back?[.64,1.95,hip.pos[2]-.40]:[hit[0]+.02,hit[1]+.38,hit[2]-.48];
 if(slot===3)end=back?[.66+.24*easeV023(age,.18,.35),1.95-.90*easeV023(age,.18,.35),hip.pos[2]]:[hit[0]+.05,hit[1]+.48*(1-easeV023(age,.10,.27)),hit[2]-.15];
 const chamber=[.25,1.05,hip.pos[2]],swing=hit.map((v,i)=>v+(end[i]-v)*follow),target=swing.map((v,i)=>v+(chamber[i]-v)*returning);
 legV024(f,key,target,hold*strength);
 legV024(f,support,localMotionV029(f,supportPoint),Math.min(1,hold+.35*settle)*strength);
 f.body.pos[1]-=(.055*hold+.045*settle)*strength;
 f.body.rot[2]+=(slot===2?.20:slot===3?.12:-.18)*hold*strength;
 f.body.rot[1]+=(slot===1?.62:slot===2?-.40:0)*Math.sin(Math.PI*easeV023(age,0,.52))*strength;
 f.arm.rot[2]-=(.55*hold-.18*settle)*strength;f.farArm.rot[2]+=(.48*hold+.12*settle)*strength;
 f.head.rot[2]-=.04*hold*strength;
 f[key==='leg'?'shoe':'backShoe'].rot[2]-=.20*hold*strength;
 f[support==='leg'?'shoe':'backShoe'].rot[2]=0;
 if(age<.08)motionV029.contactFoot={side:f===player?'player':'cpu',foot:footMotionV029(f,key),point:contact};
}
// Back-court and rush have one pose layer, rather than adding a second normal kick.
strikePoseV024=function(f,a,save){
 if(a.attack>=.72&&a.age>=.88)return;
 const phase=duelV022.phase,point=['rush','settle'].includes(phase)?null:motionV029[f===player?'player':'cpu'].point;
 if(a.attack<.72)kickMotionV029(f,a.slot,a.attack,point,save,true);
 const step=easeV023(a.age,.42,.88),lift=Math.sin(step*Math.PI)*(motion?1:.3);
 if(step>0&&step<1&&Math.abs(a.to-a.from)>.001){
  for(const key of ['leg','thigh','knee','back','backThigh','backKnee','body','arm','farArm'])save(f[key]);
  legV024(f,'leg',[.08+.42*lift,.09+.22*lift,.22],1);legV024(f,'back',[-.13-.10*lift,.09,-.23],1);
  f.body.pos[1]-=.035*lift;f.body.rot[2]-=.11*lift;f.arm.rot[2]+=.24*lift;f.farArm.rot[2]-=.20*lift;
 }
};
const prepareMotionV029=prepareDepthRenderV022;
prepareDepthRenderV022=function(){
 prepareMotionV029();
 const save=saveDramaV028,phase=duelV022.phase;
 if(['front','back'].includes(phase)&&['practice','match'].includes(ceremony)&&state.mode!=='over'&&!(feelEnabledV023&&duelV022.entered)){
  for(const [key,f] of [['player',player],['cpu',cpu]]){const a=motionV029[key];if(f.shot!=='rescue'||f===cpu)kickMotionV029(f,a.slot,a.age,a.point,save);}
 }
 if(feelEnabledV023&&phase==='break'&&motion){
  const run=easeV023(duelV022.time,.3,2.8),stride=Math.sin(run*Math.PI*12)*Math.sin(run*Math.PI);
  for(const key of ['leg','thigh','knee','back','backThigh','backKnee'])save(player[key]);
  legV024(player,'leg',[.08,.09+.24*Math.max(0,stride),.22-.46*stride],1);
  legV024(player,'back',[-.13,.09+.24*Math.max(0,-stride),-.23+.46*stride],1);
 }
 if(inCloseV027()&&closeV027.stage==='react'){
  const c=closeV027,receiver=c.turn%2?cpu:player,guard=(c.turn%2===0)===c.correct;
  const give=easeV023(c.time,.22,.32)*(1-easeV023(c.time,.40,.79));
  // Delayed head/shoulder response and a planted supporting knee. Do not change
  // the torso/root target after the shared foot-to-IPA solve.
  for(const key of ['head','arm','farArm'])save(receiver[key]);
  receiver.head.rot[0]+=(guard?.035:.11)*give*(motion?1:.3);receiver.farArm.rot[0]-=.18*give;
  if(motionV029.closeCue){impactMotionV029(dramaV028.contact,guard?'guard':'hit',guard?.8:1.1);motionV029.closeCue=false;}
 }
 if(feelEnabledV023&&phase==='rush'&&motion){
  save(cpu.body);save(cpu.head);const snap=(1-easeV023(motionV029.rushImpact,0,.22));cpu.body.rot[0]+=.10*snap;cpu.head.rot[2]-=.10*snap;
 }
 for(const key of motionV029.land){const f=key==='player'?player:cpu;impactMotionV029([f.n.pos[0],.08,f.n.pos[2]],'dust',.6);}motionV029.land=[];
 if(ball.visible){
  const pulse=state.flight<.14&&['front','back','shot','breakShot'].includes(phase)&&['practice','match'].includes(ceremony)?Math.max(0,1-state.flight/.14)*(state.shot==='perfect'?.13:.08):0;
  ball.scale=motion?[1+pulse,1-pulse,1]:[1,1,1];
  const high=Math.min(1,Math.max(0,(ball.pos[1]-.25)/3));shadow.pos[1]=.025;shadow.scale=[.27+.12*high,.012,.20+.08*high];
 }
 for(const b of rushBallsV022)if(b.n.visible&&b.volley&&motion){const t=clamp01V011(b.age/.3);b.n.scale=[1+.16*Math.sin(t*Math.PI),1-.08*Math.sin(t*Math.PI),1];}
};
const sceneMotionV029=updateScene;
updateScene=function(dt){
 const scaled=[ball,shadow,...rushBallsV022.map(b=>b.n)].map(n=>[n,[...n.scale]]);
 try{sceneMotionV029(dt);}finally{for(const [n,scale] of scaled)n.scale=scale;}
 if(motion)contactV028.hidden=true; // The same contact is drawn by the bounded pool.
 for(const p of impactsV029){
  p.e.hidden=!motion||state.mode==='paused'||p.age>=p.duration;if(p.e.hidden)continue;
  const [x,y]=renderer.project(p.point),t=p.age/p.duration;
  p.e.className='motion-impact-v029 '+p.kind;p.e.style.left=x+'px';p.e.style.top=y+'px';
  const size=(p.kind==='dust'?20:p.kind==='kick'?22:p.kind==='guard'?52:44)*p.strength*(.90+.70*t);
  p.e.style.width=size+'px';p.e.style.height=size+'px';p.e.style.opacity=String((1-t)*(p.kind==='dust'?.55:.9));
  p.rays.forEach((ray,i)=>{ray.style.transform='rotate('+(i*90+35)+'deg) translateY('+(-5-t*10)+'px)';});
 }
};
$('#start').addEventListener('click',start);`);
 return html;
};
