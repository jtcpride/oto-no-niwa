window.otoPatchDramaV028=function(html){
 function once(a,b){if(html.split(a).length!==2)throw Error('v0.28 anchor: '+a.slice(0,65));html=html.replace(a,b);}
 once("version:'0.27.0-close-exchange'","version:'0.28.0-pursuit-and-impact'");
 once('FIFTEENTH EVER GARDEN — v0.27.0','FIFTEENTH EVER GARDEN — v0.28.0');
 once("'impact','settle','close'].includes(duelV022.phase)","'impact','settle','close','breakCharge','breakShot'].includes(duelV022.phase)");
 once('state.duration=Math.max(1.5,base*distance/span);','state.duration=Math.max(1.85,base*distance/span+.18);');
 once('const pressure=clamp01V011((base-state.duration)/(base-1.5));','const pressure=clamp01V011((base-state.duration)/(base-1.85));');
 // Replace the old generic recoil with distinct kick / guard / hit poses below.
 const a=html.indexOf(" if(c.stage==='react'){\n  const defending=c.turn%2===0,attacker="),b=html.indexOf(" if(c.stage==='win'){cpu.body",a);
 if(a<0||b<a)throw Error('v0.28 close reaction anchor');html=html.slice(0,a)+html.slice(b);
 once("audio.note(c.correct?(defending?440:110):75,.14,.075,defending?'triangle':'sine',0,c.correct?180:42);","// Contact sound is scheduled at the strike pose, not at button-down.");
 once('</style>',`
 #arena.close-exchange .close-point{width:32px;height:32px;padding:0;display:grid;place-items:center;border-radius:50%;border:2px solid #e2d9bb;background:#13302acd;font:600 16px/1 Georgia,serif;box-shadow:0 1px 5px #0008}
 #arena.close-exchange .close-point small{display:none}
 #arena.close-exchange .close-point.correct{background:#226344;border-color:#baf4cd}
 #arena.close-exchange .close-point.wrong{background:#793d30;border-color:#ffc7ac}
 #contactV028{position:absolute;z-index:6;width:38px;height:38px;border:4px double #ffd289;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;box-shadow:0 0 12px #ffd28988}
 #contactV028.guard{border-color:#a5e6ff;box-shadow:0 0 10px #a5e6ff88;border-radius:35%}
 </style>`);
 once("$('#start').addEventListener('click',start);",String.raw`
const dramaV028={targets:[],contact:null,guard:false};
closePointsV027.forEach((e,i)=>{e.textContent=SOUNDS[i].symbol;e.setAttribute('aria-label',['頭','胸','腹','脚'][i]+' /'+SOUNDS[i].symbol+'/');});
const contactV028=document.createElement('i');contactV028.id='contactV028';contactV028.hidden=true;$('#arena').appendChild(contactV028);
function clearDramaV028(){contactV028.hidden=true;dramaV028.targets=[];dramaV028.contact=null;}
const resetDramaV028=resetDuelV022;
resetDuelV022=function(keep=false){clearDramaV028();return resetDramaV028(keep);};
const kickDramaV028=kick;
kick=function(){const phase=duelV022.phase,rally=state.rally,r=kickDramaV028();
 if(feelEnabledV023&&ceremony==='match'&&state.mode==='playing'&&phase==='front'&&!duelV022.entered&&state.rally>rally&&state.cpuHp>CONFIG.maxCpuHp/2&&state.cpuHp-state.pendingDamage<=CONFIG.maxCpuHp/2){
  duelV022.phase='breakCharge';duelV022.time=0;state.flight=0;state.hitstop=0;player.kick=0;answerCardTimerV010=0;audio.stopVoice();audio.applyMix();audio.note(110,.58,.04,'sine',0,240);
 }
 return r;
};
const sampleDramaV028=sampleBall;
sampleBall=function(p=state.flight/state.duration){if(duelV022.phase==='breakCharge')return [...state.flightStart];return sampleDramaV028(p);};
const mixDramaV028=audio.applyMix.bind(audio);
audio.applyMix=function(){mixDramaV028();if(feelEnabledV023&&duelV022.phase==='breakCharge'&&this.ctx&&this.musicBus)this.musicBus.gain.setTargetAtTime(this.musicVolume*.12,this.ctx.currentTime,.06);};
const gameDramaV028=updateGame;
updateGame=function(dt){
 if(state.mode==='paused')return;
 const phase=duelV022.phase;
 if(feelEnabledV023&&state.mode==='playing'){
  if(phase==='breakCharge'){
   duelV022.time+=dt;if(duelV022.time>=.7){duelV022.phase='breakShot';duelV022.time=0;state.duration=.30;state.flight=0;state.arc=.5;player.kick=.72;audio.hit(false,3,true);audio.applyMix();}return;
  }
  if(phase==='breakShot'){
   duelV022.time+=dt;state.flight=Math.min(state.duration,state.flight+dt);
   if(state.flight>=state.duration)cpuV023(); // damage once, then the existing beginDepth chain
   return;
  }
  if(phase==='break'){
   duelV022.time+=dt;if(duelV022.time>=(motion?3.4:.6)){duelV022.phase='back';duelV022.time=0;duelV022.spacing=11.2/8.8;trail=[];cpuV016();$('#kick').disabled=false;audio.applyMix();}return;
  }
 }
 const stage=closeV027.stage,age=closeV027.time,r=gameDramaV028(dt);
 if(inCloseV027()&&stage==='react'&&closeV027.stage==='react'&&age<.20&&closeV027.time>=.20){
  const guard=(closeV027.turn%2===0)===closeV027.correct;
  audio.note(guard?520:88,guard?.07:.17,guard?.065:.10,guard?'triangle':'sine',0,guard?290:36);
 }
 return r;
};
const progressDramaV028=depthProgressV022;
depthProgressV022=function(){if(feelEnabledV023&&duelV022.phase==='break')return motion?easeV023(duelV022.time,0,2.3):smoothDepthV022(duelV022.time/.6);return progressDramaV028();};
function saveDramaV028(n){restoreRenderV022.push([n,n.pos,n.rot]);n.pos=[...n.pos];n.rot=[...n.rot];}
function transformDramaV028(p,n){let [x,y,z]=p;let c=Math.cos(n.rot[0]),s=Math.sin(n.rot[0]);[y,z]=[y*c-z*s,y*s+z*c];c=Math.cos(n.rot[1]);s=Math.sin(n.rot[1]);[x,z]=[x*c+z*s,-x*s+z*c];c=Math.cos(n.rot[2]);s=Math.sin(n.rot[2]);[x,y]=[x*c-y*s,x*s+y*c];return [x+n.pos[0],y+n.pos[1],z+n.pos[2]];}
function markerDramaV028(f,i){
 const p=i===3?[.05,.55,.24]:transformDramaV028([[.25,1.49,.18],[.35,.82,.20],[.35,.28,.20]][i],f.body);
 return transformDramaV028(p,f.n);
}
function closePoseDramaV028(){
 const c=closeV027,t=c.time;if(c.stage!=='react')return;
 const defending=c.turn%2===0,attacker=defending?cpu:player,receiver=defending?player:cpu;
 const slot=defending?c.target:(c.picked<0?c.target:c.picked),guard=defending===c.correct;
 const power=heldV011(t,.18,.30,.68),chamber=Math.sin(Math.PI*clamp01V011(t/.18))*(t<.18?1:0),recoil=easeV023(t,.20,.29)*(1-easeV023(t,.39,.79)),strength=motion?1:.32;
 for(const f of [attacker,receiver])for(const key of KICK_NODES_V011)saveDramaV028(f[key]);
 // Chamber, snap into the target, then withdraw. Upper attacks pivot; low attacks stay planted.
 const key=attacker===player?'leg':'back';
 legV024(attacker,key,[.35,1.35,attacker[key].pos[2]],chamber);
 attacker.body.rot[2]+=(slot===0?.22:-.16)*power*strength;
 attacker.arm.rot[2]-=.85*power*strength;attacker.farArm.rot[2]+=.45*power*strength;
 if(guard){
  receiver.body.pos[1]-=.10*recoil;receiver.body.rot[2]+=.10*recoil;
  if(slot===3)legV024(receiver,receiver===player?'leg':'back',[.48,.92,.26],recoil);
  else{receiver.arm.rot[2]=-(slot===0?2.25:1.25)*recoil;receiver.farArm.rot[2]=-1.35*recoil;receiver.body.rot[1]+=.25*recoil;}
  receiver.n.pos[0]+=(defending?-.10:.10)*recoil;
 }else{
  receiver.n.pos[0]+=(defending?-.50:.50)*recoil*strength;
  receiver.body.rot[2]+=(slot<2?-.48:.52)*recoil*strength;
  receiver.body.pos[1]-=(slot===3?.3:.12)*recoil*strength;
  receiver.head.rot[2]-=(slot===0?.22:.08)*recoil*strength;
  receiver.arm.rot[2]+=.8*recoil*strength;receiver.farArm.rot[2]-=.6*recoil*strength;
  receiver.back.rot[2]-=.32*recoil*strength;receiver.backKnee.rot[2]-=.5*recoil*strength;
 }
 // Solve the foot to the same world point used by the IPA ring. The lunge and
 // high-kick lift supply reach instead of stretching the leg beyond its rig length.
 const target=markerDramaV028(receiver,slot),sign=attacker===player?1:-1,hip=attacker[key];
 const lift=Math.max(0,target[1]-.12-hip.pos[1]-.65),dy=target[1]-(.12+lift)-hip.pos[1];
 const reach=Math.sqrt(Math.max(.08,.90*.90-dy*dy));
 const rootX=target[0]-sign*(hip.pos[0]+reach),rootZ=target[2]-sign*hip.pos[2];
 attacker.n.pos[0]+=(rootX-attacker.n.pos[0])*power;attacker.n.pos[2]+=(rootZ-attacker.n.pos[2])*power;attacker.n.pos[1]=.12+lift*power;
 legV024(attacker,key,[sign*(target[0]-attacker.n.pos[0]),target[1]-attacker.n.pos[1],sign*(target[2]-attacker.n.pos[2])],power);
 const chain=key==='leg'?[attacker.shoe,attacker.knee,attacker.thigh,attacker.leg,attacker.n]:[attacker.backShoe,attacker.backKnee,attacker.backThigh,attacker.back,attacker.n];
 dramaV028.foot=chain.reduce((p,n)=>transformDramaV028(p,n),[0,0,0]);
 dramaV028.guard=guard;dramaV028.contact=markerDramaV028(receiver,slot);
 if(motion&&t>=.20&&t<.32&&state.mode!=='paused')renderer.shake=[Math.sin(t*160)*(guard?.008:.023),Math.cos(t*120)*.01];
}
const prepareDramaV028=prepareDepthRenderV022;
prepareDepthRenderV022=function(){
 prepareDramaV028();if(!feelEnabledV023)return;
 const p=duelV022.phase,t=duelV022.time;
 if(p==='breakCharge'){
  for(const key of ['body','arm','farArm','leg','thigh','knee'])saveDramaV028(player[key]);
  const q=easeV023(t,0,.5);player.body.pos[1]-=.22*q;player.body.rot[2]=-.28*q;player.arm.rot[2]-=.65*q;player.farArm.rot[2]+=.5*q;legV024(player,'leg',[.35,.85,.25],q);ball.visible=true;
 }
 if(p==='breakShot'){for(const key of KICK_NODES_V011)saveDramaV028(player[key]);strikePoseV024(player,{attack:.18+t*.8,age:99,slot:0},saveDramaV028);}
 if(p==='break'&&motion){
  const fly=easeV023(t,0,1.25),run=easeV023(t,.3,2.8),recover=easeV023(t,1.4,2.6),orbit=easeV023(t,.25,1.1)*(1-easeV023(t,2.15,3.4));
  frontSceneryV022.visible=t<.16;backSceneryV022.visible=t>=.16;
  cpu.n.pos=[4.4+1.2*fly,.12+1.9*Math.sin(Math.PI*fly)*(1-recover),-8*fly];cpu.n.rot[0]=1.6*Math.sin(Math.PI*fly)*(1-recover);cpu.n.rot[2]=-.9*Math.sin(Math.PI*fly)*(1-recover);
  player.n.pos=[-4.4+foot.x*(1-run)-1.2*run+3.2*Math.sin(run*Math.PI),.12,-8*run];
  player.n.rot[1]=.75*Math.sin(run*Math.PI);cpu.n.rot[1]=Math.PI;
  for(const key of ['body','leg','back','knee','backKnee','arm','farArm'])saveDramaV028(player[key]);
  const stride=Math.sin(run*Math.PI*12)*Math.sin(run*Math.PI);
  player.leg.rot[2]=.68*stride;player.back.rot[2]=-.68*stride;player.knee.rot[2]=-Math.max(0,-stride)*.9;player.backKnee.rot[2]=-Math.max(0,stride)*.9;
  player.arm.rot[2]=-.7*stride;player.farArm.rot[2]=.7*stride;player.body.rot[2]=-.15*Math.sin(run*Math.PI);player.body.pos[1]+=.08*Math.abs(stride);
  // Settle onto the back-court lens before control returns; its starting zoom is .90.
  const yaw=.073+.23*run-1.42*orbit,z=-8*run;renderer.eye=[Math.sin(yaw)*17,5.6-orbit*.8,z+Math.cos(yaw)*17];const air=Math.sin(Math.PI*fly);renderer.target=[0,1.9+.9*air,z];renderer.zoom=1-.15*orbit-.10*air-.10*easeV023(t,2.6,3.4);
  ball.visible=false;shadow.visible=false;
 }
 if(inCloseV027()){
  // Keep body-mounted IPA readable on narrow screens; ease the framing on entry.
  const enter=closeV027.stage==='enter'?easeV023(closeV027.time,0,.85):1,leave=['win','lose'].includes(closeV027.stage)?easeV023(closeV027.time,0,.85):0;
  const readableZoom=52*Math.max(12.3,renderer.width/renderer.height*6.8)/renderer.width;
  renderer.zoom+=(Math.max(renderer.zoom,readableZoom)-renderer.zoom)*(motion?enter*(1-leave):1);
  player.n.rot=[0,0,0];cpu.n.rot=[0,Math.PI,0];closePoseDramaV028();const f=closeV027.turn%2?cpu:player;dramaV028.targets=[0,1,2,3].map(i=>markerDramaV028(f,i));
 }
};
const sceneDramaV028=updateScene;
updateScene=function(dt){
 sceneDramaV028(dt);
 const active=inCloseV027()&&state.mode==='playing'&&['ask','react'].includes(closeV027.stage);
 if(!active){clearDramaV028();}else{
  const points=dramaV028.targets.map(p=>renderer.project(p));
  const gaps=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
  const size=Math.min(34,Math.max(22,Math.min(...gaps)-3));
  for(let i=0;i<4;i++){
   const [x,y]=points[i],e=closePointsV027[i];e.style.left=x+'px';e.style.top=y+'px';e.style.width=size+'px';e.style.height=size+'px';e.style.fontSize=(size<27?14:17)+'px';
  }
  contactV028.hidden=closeV027.stage!=='react'||closeV027.time<.20||closeV027.time>.43||!dramaV028.contact;
  if(!contactV028.hidden){const p=renderer.project(dramaV028.contact);contactV028.style.left=p[0]+'px';contactV028.style.top=p[1]+'px';contactV028.classList.toggle('guard',dramaV028.guard);contactV028.style.opacity=String(1-(closeV027.time-.20)/.30);}
 }
 if(['breakCharge','breakShot'].includes(duelV022.phase)&&state.mode==='playing'){wordV023.hidden=false;wordV023.textContent=duelV022.phase==='breakCharge'?'…':'突破';}
};
$('#start').addEventListener('click',start);`);
 return html;
};
