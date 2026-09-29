window.otoPatchCombatV024=function(html){
 function replaceOnce(from,to){if(html.split(from).length!==2)throw new Error('v0.24 patch anchor: '+from.slice(0,70));html=html.replace(from,to);}
 replaceOnce("version:'0.23.0-match-feel'","version:'0.24.0-step-and-strike'");
 replaceOnce('FIFTEENTH EVER GARDEN — v0.23.0','FIFTEENTH EVER GARDEN — v0.24.0');
 replaceOnce('// No queue: rapid taps fire the current word. Advance only after a recognizable utterance.\n  if(feelV023.voiceAge>=.65&&(feelV023.voiceDone||feelV023.voiceAge>=1.25)){','// Each tap cancels the previous utterance and immediately speaks the next word.\n  {');
 replaceOnce("if(duelV022.phase==='back')duelV022.approach=Math.min(1,duelV022.approach+(feelEnabledV023?.5:.25));","if(duelV022.phase==='back'&&!feelEnabledV023)duelV022.approach=Math.min(1,duelV022.approach+.25);");
 replaceOnce("const target=1.12-(feelEnabledV023?.65:.42)*duelV022.approach;","const target=feelEnabledV023?duelV022.spacing:1.12-.42*duelV022.approach;");
 replaceOnce("$('#start').addEventListener('click',start);",String.raw`
// Actor-specific footwork. These are presentation offsets; logical flight time stays unchanged.
const strideV024={player:{x:0,from:0,to:0,age:99,attack:99,slot:0},cpu:{x:0,from:0,to:0,age:99,attack:99,slot:0},flight:[0,0],cpuTurns:0,pending:false};
function resetStrideV024(){
 for(const key of ['player','cpu'])Object.assign(strideV024[key],{x:0,from:0,to:0,age:99,attack:99,slot:0});
 strideV024.flight=[0,0];strideV024.cpuTurns=0;strideV024.pending=false;
}
const resetV024=resetDuelV022;
resetDuelV022=function(keep=false){resetV024(keep);resetStrideV024();};
const depthV024=beginDepthV022;
beginDepthV022=function(){depthV024();if(!feelEnabledV023)return;
 Object.assign(strideV024.player,{x:-1.2,from:-1.2,to:-1.2});Object.assign(strideV024.cpu,{x:1.2,from:1.2,to:1.2});
};
function stepV024(side,slot){
 const a=strideV024[side],sign=side==='player'?1:-1;
 a.from=a.x;a.to=sign*Math.min(2.4,sign*a.x+1.2);a.age=0;a.attack=0;a.slot=slot;
}
const launchV024=launchShot;
launchShot=function(kind,direction,point){
 const r=launchV024(kind,direction,point);
 if(feelEnabledV023&&duelV022.entered&&duelV022.phase!=='break'){
  // Pin the launch and receive locations: stepping after a kick must not drag the airborne ball.
  strideV024.flight=[strideV024.player.x,strideV024.cpu.x];
  if(direction===-1&&duelV022.phase==='back')stepV024('cpu',strideV024.cpuTurns++%4);
 }
 return r;
};
const kickV024=kick;
kick=function(){
 const before=state.rally,taps=duelV022.taps,r=kickV024();
 if(!feelEnabledV023||state.mode!=='playing'||!duelV022.entered)return r;
 if(state.rally>before){
  if(duelV022.phase==='charge')strideV024.pending=true;
  else if(duelV022.phase==='back')stepV024('player',state.selected);
 }
 if(duelV022.taps>taps){
  rushBallsV022[taps%rushBallsV022.length].offsets=[strideV024.player.x,strideV024.cpu.x];
  if(strideV024.player.attack>=.13){strideV024.player.attack=.08;strideV024.player.slot=taps%4;}
 }
 return r;
};
const gameV024=updateGame;
updateGame=function(dt){
 if(!feelEnabledV023)return gameV024(dt);
 if(state.mode==='paused')return;
 if(state.mode==='playing')for(const key of ['player','cpu']){
  const a=strideV024[key];a.age+=dt;a.attack+=dt;
  a.x=a.from+(a.to-a.from)*easeV023(a.age,.42,.88);
 }
 const phase=duelV022.phase,r=gameV024(dt);
 if(phase==='charge'&&duelV022.phase==='shot'&&strideV024.pending){strideV024.pending=false;stepV024('player',state.selected);}
 if(duelV022.entered&&duelV022.phase!=='break'){
  duelV022.spacing=(8.8+strideV024.cpu.x-strideV024.player.x)/8.8;
  duelV022.approach=clamp01V011((11.2-8.8*duelV022.spacing)/7.2);
 }
 return r;
};
const pointV024=depthPointV022;
depthPointV022=function(p){
 if(!feelEnabledV023||!duelV022.entered)return pointV024(p);
 const offsets=duelV022.phase==='break'?[0,0]:strideV024.flight,left=-3.78+foot.x,u=(p[0]-left)/(3.3-left);
 return [p[0]+offsets[0]*(1-u)+offsets[1]*u,p[1],p[2]+depthOffsetV022()];
};
function legV024(f,key,target,weight){
 const hip=f[key],thigh=f[key==='leg'?'thigh':'backThigh'],knee=f[key==='leg'?'knee':'backKnee'];
 const dx=target[0]-hip.pos[0],dy=target[1]-hip.pos[1],dz=target[2]-hip.pos[2],h=Math.hypot(dx,dz),d=Math.max(.16,Math.min(.95,Math.hypot(h,dy))),bend=Math.acos(d/.96);
 const blend=(v,w)=>v+(w-v)*weight;
 hip.rot[0]*=1-weight;hip.rot[2]*=1-weight;hip.rot[1]=blend(hip.rot[1],Math.atan2(-dz,dx));
 thigh.rot[2]=blend(thigh.rot[2],Math.atan2(h,-dy)+bend);knee.rot[2]=blend(knee.rot[2],-2*bend);
}
function strikePoseV024(f,a,save){
 if(a.attack>=.82&&a.age>=.88)return;
 for(const key of KICK_NODES_V011)save(f[key]);
 const strength=motion?1:.3,t=a.attack;
 if(t<.58){
  const power=heldV011(t,.075,.27,.58)*strength,slot=a.slot;
  const key=(slot%2===(f===cpu?0:1))?'back':'leg',support=key==='leg'?'back':'leg',near=f===cpu?-.48:.48;
  let target;
  if(slot===0)target=[1.06,1.10,.22]; // hard mid-level thrust
  else if(slot===1)target=[.78,1.43,.70*Math.cos(Math.PI*clamp01V011(t/.40))]; // roundhouse across depth
  else if(slot===2)target=[.64,1.90,near]; // full rising kick
  else{const drop=easeV023(t,.19,.42);target=[.64+.30*drop,1.90-1.14*drop,near];} // axe lift and downward cut
  legV024(f,key,target,power);
  legV024(f,support,[f[support].pos[0],.10,f[support].pos[2]],.3*power);
  f.body.rot[2]+=(slot>=2?.32:slot===0?-.32:-.22)*power;
  f.body.rot[1]+=(slot===1?.85*Math.sin(Math.PI*clamp01V011(t/.55)):slot===3?-.4:0)*strength;
  f.arm.rot[2]-=.8*power;f.farArm.rot[2]+=.65*power;f.head.rot[2]+=.12*power;
 }
 const step=easeV023(a.age,.42,.88),lift=Math.sin(step*Math.PI)*strength;
 if(step>0&&step<1&&Math.abs(a.to-a.from)>.001){
  legV024(f,'leg',[.08+.33*lift,.10+.25*lift,.22],1);
  legV024(f,'back',[-.13-.12*lift,.10,-.23],.7);
  f.body.pos[1]+=.055*lift;f.body.rot[2]-=.10*lift;f.arm.rot[2]+=.20*lift;
 }
}
const prepareV024=prepareDepthRenderV022;
prepareDepthRenderV022=function(){
 prepareV024();if(!feelEnabledV023||!duelV022.entered||ceremony!=='match')return;
 const save=n=>{restoreRenderV022.push([n,n.pos,n.rot]);n.pos=[...n.pos];n.rot=[...n.rot]};
 const oldOffset=4.4*(1-duelV022.spacing),progress=depthProgressV022();
 player.n.pos[0]+=strideV024.player.x*progress-oldOffset;cpu.n.pos[0]+=strideV024.cpu.x*progress+oldOffset;
 if(duelV022.phase!=='break'){
  if(motion)renderer.zoom=.90+.26*duelV022.approach+(duelV022.phase==='charge'?.035*easeV023(duelV022.time,0,.7):0);
  if(!['charge','done','settle'].includes(duelV022.phase))strikePoseV024(player,strideV024.player,save);
  if(['back','impact'].includes(duelV022.phase))strikePoseV024(cpu,strideV024.cpu,save);
  for(const b of rushBallsV022)if(b.n.visible&&b.offsets){const u=clamp01V011(b.age/.3);b.n.pos[0]=-3.78+foot.x+(7.08-foot.x)*u+b.offsets[0]*(1-u)+b.offsets[1]*u;}
 }
};
$('#start').addEventListener('click',start);`);
 replaceOnce('select(0);refreshHud();requestAnimationFrame(frame);',`window.kemari.getSteps=()=>({player:{...strideV024.player},cpu:{...strideV024.cpu},flight:[...strideV024.flight]});
select(0);refreshHud();requestAnimationFrame(frame);`);
 return html;
};
