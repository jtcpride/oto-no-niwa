window.otoPatchFailV0114=function(html){
// v0.11.4 — failed returns are body impacts only: no kick animation, no root-position drift.
// Applied after v0.11.3 so the four successful kick forms remain untouched.
const marker="$('#start').addEventListener('click',start);";
html=html.replace("version:'0.11.3-distinct-kick-variants'","version:'0.11.4-body-hit-fail-only'");

// Remove the older BODY RETURN pose that nudged the player root every frame.
html=html.replace(
 "if(bodyHitV010>0){const k=Math.sin(bodyHitV010/.62*Math.PI);player.n.pos[0]-=k*.16;player.head.rot[2]+=k*.18;}",
 "/* v0.11.4 BODY RETURN pose is applied separately without changing player root position. */"
);

// Replace only the v0.10 rescue wrapper. Practice and MATCH failures both cancel the kick immediately.
const rescueStart="rescue=function(kind){const before=state.misses,word=state.word,target=state.target;";
const rescueAt=html.indexOf(rescueStart);
if(rescueAt>=0){
 const rescueEndToken="return r;};";
 const rescueEnd=html.indexOf(rescueEndToken,rescueAt);
 if(rescueEnd>=0){
  const bodyHitRescue=`rescue=function(kind){
 const before=state.misses,word=state.word,target=state.target;
 const r=_rescueV09(kind);
 // A failure must never read as a kick. Cancel any rescue kick before the next rendered frame.
 player.kick=0;player.kickSlot=-1;player.shot='rescue';
 const bodyFail=ceremony==='practice'||ceremony==='match';
 if(bodyFail&&state.mode!=='over'){
  bodyHitV010=.68;
  const side=(state.misses%2?1:-1);
  const hitY=kind==='symbol'?1.50:1.40;
  state.flightStart=[player.n.pos[0]+.08,hitY,player.n.pos[2]+side*.10];
  state.flight=0;previousBall=[...state.flightStart];state.hitstop=Math.max(state.hitstop,motion?.07:0);
 }
 if(ceremony==='match'&&state.misses>before&&state.mode!=='over'){
  queueRetryV010();consecutiveFailsV010++;showAnswerCardV010(false);
  const reason=kind==='symbol'?word+' → /'+SOUNDS[target].symbol+'/':kind==='early'?'少し早かった':'間に合わなかった';
  sportNoticeV010('BODY RETURN',reason+' · 体力 −'+CONFIG.missDamage,'miss');
  if(consecutiveFailsV010%3===0){knockdownV010=KNOCKDOWN_DURATION_V010;knockDirV010=state.misses%2?1:-1;state.hitstop=Math.max(state.hitstop,1.05);sportNoticeV010('DOWN',reason+' · 三連続ミス','down');audio.fail();}
 }
 return r;
};`;
  html=html.slice(0,rescueAt)+bodyHitRescue+html.slice(rescueEnd+rescueEndToken.length);
 }
}

// Restore the prior local failure pose before poseFoot, then apply a fresh impact pose after normal posing.
if(html.includes("resetKickFormV011();poseFoot(dt);applyKickFormV011();applyBowPose();")){
 html=html.replace(
  "resetKickFormV011();poseFoot(dt);applyKickFormV011();applyBowPose();",
  "resetKickFormV011();resetFailPoseV0114();poseFoot(dt);applyKickFormV011();applyBowPose();applyFailPoseV0114();"
 );
}else{
 html=html.replace(
  "poseFoot(dt);applyKickFormV011();applyBowPose();",
  "resetFailPoseV0114();poseFoot(dt);applyKickFormV011();applyBowPose();applyFailPoseV0114();"
 );
}

const patch=`
const FAIL_POSE_NODES_V0114=['body','head','arm','farArm'];
let failPoseRestoreV0114=null;
function resetFailPoseV0114(){
 if(!failPoseRestoreV0114)return;
 FAIL_POSE_NODES_V0114.forEach(key=>{
  const n=player[key],s=failPoseRestoreV0114[key];
  n.pos[0]=s.pos[0];n.pos[1]=s.pos[1];n.pos[2]=s.pos[2];
  n.rot[0]=s.rot[0];n.rot[1]=s.rot[1];n.rot[2]=s.rot[2];
 });
 failPoseRestoreV0114=null;
}
function applyFailPoseV0114(){
 if(bodyHitV010<=0||knockdownV010>0)return;
 failPoseRestoreV0114={};
 FAIL_POSE_NODES_V0114.forEach(key=>{const n=player[key];failPoseRestoreV0114[key]={pos:[...n.pos],rot:[...n.rot]};});
 const elapsed=.68-bodyHitV010;
 const p=Math.max(0,Math.min(1,elapsed/.68));
 const impact=Math.sin(Math.min(1,p/.62)*Math.PI);
 const recoil=Math.sin(Math.min(1,p/.82)*Math.PI);
 const side=(state.misses%2?1:-1);
 // Upper-body hit only. Deliberately do not touch player.n, leg, or back.
 player.body.pos[0]-=.09*impact;
 player.body.rot[2]+=side*.34*impact;
 player.body.rot[0]-=.16*impact;
 player.head.rot[2]+=side*.28*recoil;
 player.head.rot[0]-=.10*impact;
 player.arm.rot[2]+=side*.46*impact;
 player.farArm.rot[2]-=side*.38*impact;
}
`;
html=html.replace(marker,patch+'\n'+marker);
return html;
};
