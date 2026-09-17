window.otoPatchFailV0115=function(html){
// v0.11.5 — human-readable failure reaction built directly on v0.11.3.
// Success = one of four kicks. Failure = ball hits torso/shoulder; no kick, no spinning head,
// and every temporary pose is restored before the next base pose is calculated.
const marker="$('#start').addEventListener('click',start);";
html=html.replace("version:'0.11.3-distinct-kick-variants'","version:'0.11.5-human-body-hit-reaction'");

// Disable the older v0.10 failure transforms. They used += on live render transforms and could accumulate.
html=html.replace(
 "if(bodyHitV010>0){const k=Math.sin(bodyHitV010/.62*Math.PI);player.n.pos[0]-=k*.16;player.head.rot[2]+=k*.18;}",
 "/* v0.11.5: old BODY RETURN pose disabled */"
);
html=html.replace(
 "if(knockdownV010>0){const t=1-knockdownV010/KNOCKDOWN_DURATION_V010,travel=Math.sin(Math.min(1,t/.72)*Math.PI/2),drop=Math.sin(Math.min(1,t/.58)*Math.PI/2);player.n.pos[2]+=knockDirV010*2.0*travel;player.body.pos[1]-=.48*drop;player.body.rot[0]+=knockDirV010*Math.PI*1.45*travel;player.body.rot[2]+=knockDirV010*.55*travel;player.arm.rot[2]-=knockDirV010*.9*travel;player.farArm.rot[2]+=knockDirV010*.7*travel;}",
 "/* v0.11.5: old cumulative knockdown pose disabled */"
);

// Replace only the v0.10 rescue wrapper. The base rescue still handles HP/return logic;
// this wrapper controls how the failure is presented visually.
const rescueStart="rescue=function(kind){const before=state.misses,word=state.word,target=state.target;";
const rescueAt=html.indexOf(rescueStart);
if(rescueAt>=0){
 const rescueEndToken="return r;};";
 const rescueEnd=html.indexOf(rescueEndToken,rescueAt);
 if(rescueEnd>=0){
  const bodyHitRescue=`rescue=function(kind){
 const before=state.misses,word=state.word,target=state.target;
 const r=_rescueV09(kind);
 // Failure must never read as a kick. Clear any previous temporary kick pose immediately.
 if(typeof resetKickFormV011==='function')resetKickFormV011();
 player.kick=0;player.kickSlot=-1;player.shot='rescue';state.hurt=0;
 const bodyFail=ceremony==='practice'||ceremony==='match';
 if(bodyFail&&state.mode!=='over'){
  bodyHitV010=.68;
  const side=(state.misses%2?1:-1);
  const hitY=kind==='symbol'?1.48:1.39;
  state.flightStart=[player.n.pos[0]+.07,hitY,player.n.pos[2]+side*.08];
  state.flight=0;previousBall=[...state.flightStart];state.hitstop=Math.max(state.hitstop,motion?.06:0);
 }
 if(ceremony==='match'&&state.misses>before&&state.mode!=='over'){
  queueRetryV010();consecutiveFailsV010++;showAnswerCardV010(false);
  const reason=kind==='symbol'?word+' → /'+SOUNDS[target].symbol+'/':kind==='early'?'少し早かった':'間に合わなかった';
  sportNoticeV010('BODY RETURN',reason+' · 体力 −'+CONFIG.missDamage,'miss');
  if(consecutiveFailsV010%3===0){knockdownV010=KNOCKDOWN_DURATION_V010;knockDirV010=state.misses%2?1:-1;state.hitstop=Math.max(state.hitstop,.34);sportNoticeV010('STAGGER',reason+' · 三連続ミス','down');audio.fail();}
 }
 return r;
};`;
  html=html.slice(0,rescueAt)+bodyHitRescue+html.slice(rescueEnd+rescueEndToken.length);
 }
}

// Restore the previous temporary failure pose BEFORE pose(player,dt) computes this frame's natural pose.
html=html.replace(
 "if(state.mode!=='paused'){pose(player,dt);",
 "if(state.mode!=='paused'){resetFailPoseV0115();pose(player,dt);"
);
html=html.replace(
 "resetKickFormV011();poseFoot(dt);applyKickFormV011();applyBowPose();",
 "resetKickFormV011();poseFoot(dt);applyKickFormV011();applyBowPose();applyFailPoseV0115();"
);

const patch=`
const FAIL_POSE_NODES_V0115=['body','head','arm','farArm'];
let failPoseRestoreV0115=null,failRootRestoreV0115=null;
function resetFailPoseV0115(){
 if(failRootRestoreV0115){
  player.n.pos[0]=failRootRestoreV0115[0];player.n.pos[1]=failRootRestoreV0115[1];player.n.pos[2]=failRootRestoreV0115[2];
  failRootRestoreV0115=null;
 }
 if(!failPoseRestoreV0115)return;
 FAIL_POSE_NODES_V0115.forEach(key=>{
  const n=player[key],s=failPoseRestoreV0115[key];
  n.pos[0]=s.pos[0];n.pos[1]=s.pos[1];n.pos[2]=s.pos[2];
  n.rot[0]=s.rot[0];n.rot[1]=s.rot[1];n.rot[2]=s.rot[2];
 });
 failPoseRestoreV0115=null;
}
function snapshotFailPoseV0115(){
 failRootRestoreV0115=[...player.n.pos];
 failPoseRestoreV0115={};
 FAIL_POSE_NODES_V0115.forEach(key=>{const n=player[key];failPoseRestoreV0115[key]={pos:[...n.pos],rot:[...n.rot]};});
}
function applyFailPoseV0115(){
 if((bodyHitV010<=0&&knockdownV010<=0)||player.kick>0)return;
 snapshotFailPoseV0115();
 const side=(state.misses%2?1:-1);
 if(knockdownV010>0){
  // Three misses: a brief human stumble, not a rag-doll tumble. It moves out and naturally returns.
  const t=Math.max(0,Math.min(1,1-knockdownV010/KNOCKDOWN_DURATION_V010));
  const stumble=Math.sin(t*Math.PI);
  player.n.pos[2]+=side*.34*stumble;
  player.body.pos[1]-=.055*stumble;
  player.body.rot[2]+=side*.16*stumble;
  player.body.rot[0]-=.07*stumble;
  player.head.rot[2]+=side*.035*stumble;
  player.arm.rot[2]+=side*.18*stumble;
  player.farArm.rot[2]-=side*.14*stumble;
  return;
 }
 // Single miss: torso/shoulder absorbs the ball. Feet stay planted; head follows the torso only slightly.
 const p=Math.max(0,Math.min(1,(.68-bodyHitV010)/.68));
 const impact=Math.sin(p*Math.PI);
 const flinch=Math.sin(Math.min(1,p/.72)*Math.PI);
 player.body.pos[0]-=.065*impact;
 player.body.pos[1]-=.025*impact;
 player.body.rot[2]+=side*.11*impact;
 player.body.rot[0]-=.055*impact;
 player.head.rot[2]+=side*.035*flinch;
 player.arm.rot[2]+=side*.16*impact;
 player.farArm.rot[2]-=side*.13*impact;
}
`;
html=html.replace(marker,patch+'\n'+marker);
return html;
};
