window.otoPatchCeremonyV0104=function(html){
// v0.10.4 — let the TIME ball drift away slowly while visually fading,
// and make the mutual bow pause for 0.5s at its deepest point.
const marker="$('#start').addEventListener('click',start);";
const patch=`
const TIME_ROLL_SECONDS_V0104=2.4;
const TIME_FADE_START_V0104=.45;
const TIME_FADE_END_V0104=2.25;
const timeBallColorsV0104=ball.children.map(n=>Array.from(n.color));
const timeShadowColorV0104=Array.from(shadow.color);
const timeFadeColorV0104=G.color('#668077');
function mixColorV0104(a,b,t){return a.map((v,i)=>v+(b[i]-v)*t);}
function restoreTimeBallV0104(){
 ball.visible=true;shadow.visible=true;ball.scale=[1,1,1];
 ball.children.forEach((n,i)=>{n.color=[...timeBallColorsV0104[i]];});
 shadow.color=[...timeShadowColorV0104];
 const label=$('#ballLabel');if(label)label.style.opacity='';
}
function fadeTimeBallV0104(post){
 const raw=Math.max(0,Math.min(1,(post-TIME_FADE_START_V0104)/(TIME_FADE_END_V0104-TIME_FADE_START_V0104)));
 const f=raw*raw*(3-2*raw);
 ball.children.forEach((n,i)=>{n.color=mixColorV0104(timeBallColorsV0104[i],timeFadeColorV0104,f);});
 shadow.color=mixColorV0104(timeShadowColorV0104,timeFadeColorV0104,Math.min(1,f*1.12));
 const label=$('#ballLabel');if(label)label.style.opacity=String(1-f);
 if(f>=.995){ball.visible=false;shadow.visible=false;}
}
const _sampleBallV0103=sampleBall;
sampleBall=function(progress=state.flight/state.duration){
 if(ceremony==='time'&&state.flight>state.duration){
  const post=Math.max(0,state.flight-state.duration),r=Math.min(1,post/TIME_ROLL_SECONDS_V0104);
  const ease=r*r*(3-2*r),targetZ=state.aimZ||0;
  return [-3.3-3.3*ease,.225+Math.abs(Math.sin(r*Math.PI*2.6))*.04*(1-r),targetZ+.24*ease];
 }
 return _sampleBallV0103(progress);
};
const _updateGameV0103=updateGame;
updateGame=function(dt){
 if(ceremony==='time'&&state.mode==='playing'){
  state.flight+=dt;state.aimZ+=(0-state.aimZ)*Math.min(1,dt*5);$('#time').textContent='--';
  const post=Math.max(0,state.flight-state.duration);fadeTimeBallV0104(post);
  if(post>TIME_ROLL_SECONDS_V0104+.08){ball.visible=false;shadow.visible=false;enterTimeChoiceV09();}
  return;
 }
 return _updateGameV0103(dt);
};
const _startV0103=start;
start=function(){restoreTimeBallV0104();return _startV0103();};
const _beginMatchV0103=beginMatch;
beginMatch=function(){restoreTimeBallV0104();return _beginMatchV0103();};

const BOW_TOTAL_V0104=1.80,BOW_DOWN_V0104=.65,BOW_HOLD_V0104=.50,BOW_UP_V0104=.65;
function smoothBowV0104(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);}
function bowAmountV0104(){
 if(bowAnim<=0)return 0;
 const e=BOW_TOTAL_V0104-bowAnim;
 if(e<BOW_DOWN_V0104)return smoothBowV0104(e/BOW_DOWN_V0104);
 if(e<BOW_DOWN_V0104+BOW_HOLD_V0104)return 1;
 return 1-smoothBowV0104((e-BOW_DOWN_V0104-BOW_HOLD_V0104)/BOW_UP_V0104);
}
$('#bowBtn').addEventListener('click',()=>{
 if(ceremony==='bow-wait'){
  bowAnim=BOW_TOTAL_V0104;
  bowWait=3.0;
 }
});
applyBowPose=function(){
 const k=bowAmountV0104();
 if(k>0){
  player.body.rot[2]-=k*.62;player.body.pos[1]-=k*.08;player.head.rot[2]+=k*.22;player.arm.rot[2]-=k*.14;player.farArm.rot[2]+=k*.10;
  cpu.body.rot[2]-=k*.62;cpu.body.pos[1]-=k*.08;cpu.head.rot[2]+=k*.22;cpu.arm.rot[2]-=k*.14;cpu.farArm.rot[2]+=k*.10;
 }
 if(bodyHitV010>0){const h=Math.sin(bodyHitV010/.62*Math.PI);player.n.pos[0]-=h*.16;player.head.rot[2]+=h*.18;}
 if(knockdownV010>0){const t=1-knockdownV010/KNOCKDOWN_DURATION_V010,travel=Math.sin(Math.min(1,t/.72)*Math.PI/2),drop=Math.sin(Math.min(1,t/.58)*Math.PI/2);player.n.pos[2]+=knockDirV010*2.0*travel;player.body.pos[1]-=.48*drop;player.body.rot[0]+=knockDirV010*Math.PI*1.45*travel;player.body.rot[2]+=knockDirV010*.55*travel;player.arm.rot[2]-=knockDirV010*.9*travel;player.farArm.rot[2]+=knockDirV010*.7*travel;}
};
`;
html=html.replace("version:'0.10.3-time-clear-slow-bow'","version:'0.10.4-slow-fade-time-ball-bow-hold'");
html=html.replace(marker,patch+'\n'+marker);
return html;
};
