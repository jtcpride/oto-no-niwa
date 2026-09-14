window.otoPatchKicksV011=function(html){
// v0.11.3 — exaggerate the three non-TH kick silhouettes while keeping pose restoration stable.
// Goal: in PRACTICE, /θ/ /ð/ /ʃ/ /ʒ/ should read as four different techniques at a glance.
const marker="$('#start').addEventListener('click',start);";
html=html.replace("version:'0.10.4-slow-fade-time-ball-bow-hold'","version:'0.11.3-distinct-kick-variants'");
html=html.replace("player.kick=.38;player.shot=kind;launchShot(kind,1,contact);","player.kick=.92;player.kickSlot=state.selected;player.shot=kind;launchShot(kind,1,contact);");
html=html.replace("poseFoot(dt);applyBowPose();","resetKickFormV011();poseFoot(dt);applyKickFormV011();applyBowPose();");
const patch=`
const KICK_DURATION_V011=.92;
const KICK_NODES_V011=['body','head','arm','farArm','leg','back'];
let kickPoseRestoreV011=null;
function clamp01V011(v){return Math.max(0,Math.min(1,v));}
function smoothV011(v){v=clamp01V011(v);return v*v*(3-2*v);}
function heldV011(t,rise,hold,fall){
 if(t<=0)return 0;
 if(t<rise)return smoothV011(t/rise);
 if(t<hold)return 1;
 if(t<fall)return 1-smoothV011((t-hold)/(fall-hold));
 return 0;
}
function snapshotKickPoseV011(){
 kickPoseRestoreV011={};
 KICK_NODES_V011.forEach(key=>{
  const n=player[key];
  kickPoseRestoreV011[key]={pos:[...n.pos],rot:[...n.rot]};
 });
}
function resetKickFormV011(){
 if(!kickPoseRestoreV011)return;
 KICK_NODES_V011.forEach(key=>{
  const n=player[key],s=kickPoseRestoreV011[key];
  n.pos[0]=s.pos[0];n.pos[1]=s.pos[1];n.pos[2]=s.pos[2];
  n.rot[0]=s.rot[0];n.rot[1]=s.rot[1];n.rot[2]=s.rot[2];
 });
 kickPoseRestoreV011=null;
}
function applyKickFormV011(){
 if(player.kick<=0||player.shot==='rescue')return;
 snapshotKickPoseV011();
 const t=clamp01V011(1-player.kick/KICK_DURATION_V011);
 const slot=Number.isInteger(player.kickSlot)?player.kickSlot:state.selected;

 if(slot===0){
  // /θ/ THINK — vertical front snap. Narrow, upright, sharp.
  const chamber=heldV011(t,.07,.17,.34);
  const k=heldV011(t,.12,.30,.62);
  player.body.pos[1]+=.045*chamber;
  player.leg.pos[1]+=.40*k;
  player.leg.pos[0]+=.11*k;
  player.leg.rot[2]+=1.92*k;
  player.leg.rot[0]-=.10*k;
  player.back.rot[2]-=.18*k;
  player.body.rot[2]-=.16*k;
  player.body.rot[0]+=.08*k;
  player.arm.rot[2]-=.62*k;
  player.farArm.rot[2]+=.38*k;
  player.head.rot[2]-=.09*k;
 }else if(slot===1){
  // /ð/ THIS — rear-leg inside sweep. Low setup, wide depth arc, strong hip turn.
  const prep=heldV011(t,.07,.19,.34);
  const k=heldV011(t,.19,.47,.82);
  const sweep=Math.sin(clamp01V011((t-.08)/.74)*Math.PI);
  player.body.pos[1]-=.085*prep;
  player.body.pos[2]+=.28*sweep;
  player.back.pos[1]+=.25*k;
  player.back.pos[2]+=.32*sweep;
  player.back.rot[2]+=1.34*k;
  player.back.rot[0]-=1.48*k;
  player.leg.rot[2]-=.38*k;
  player.leg.rot[0]+=.18*k;
  player.body.rot[1]-=.98*k;
  player.body.rot[2]-=.34*k;
  player.body.rot[0]+=.14*k;
  player.arm.rot[2]-=.92*k;
  player.farArm.rot[2]+=.78*k;
  player.head.rot[2]-=.18*k;
 }else if(slot===2){
  // /ʃ/ SHIP — hopping outside side kick. Clear upward hop plus opposite depth cut.
  const hop=Math.sin(clamp01V011(t/.70)*Math.PI);
  const k=heldV011(t,.13,.36,.72);
  const slash=Math.sin(clamp01V011((t-.05)/.58)*Math.PI);
  player.body.pos[1]+=.17*hop;
  player.body.pos[2]-=.34*hop;
  player.leg.pos[1]+=.26*k+.05*hop;
  player.leg.pos[2]-=.34*k;
  player.leg.rot[2]+=.92*k+.24*slash;
  player.leg.rot[0]+=1.58*k;
  player.back.rot[2]-=.58*k;
  player.back.rot[0]-=.28*k;
  player.body.rot[1]+=1.02*k;
  player.body.rot[2]+=.25*hop;
  player.body.rot[0]-=.24*k;
  player.arm.rot[2]-=.28*k;
  player.farArm.rot[2]+=1.02*k;
  player.head.rot[2]+=.14*hop;
 }else{
  // /ʒ/ VISION — sink, pause, then scoop. Deepest two-beat silhouette.
  const sink=heldV011(t,.09,.30,.48);
  const scoop=heldV011(t,.27,.57,.89);
  const rebound=heldV011(t,.50,.68,.91);
  player.body.pos[1]-=.27*sink;
  player.body.pos[1]+=.08*rebound;
  player.body.pos[2]+=.06*scoop;
  player.back.pos[1]+=.48*scoop;
  player.back.pos[0]+=.12*scoop;
  player.back.rot[2]+=2.05*scoop;
  player.back.rot[0]+=.62*scoop;
  player.leg.rot[2]-=.58*sink;
  player.leg.rot[0]+=.14*rebound;
  player.body.rot[1]-=.22*scoop;
  player.body.rot[2]-=.50*sink+.18*rebound;
  player.body.rot[0]-=.34*sink+.10*rebound;
  player.arm.rot[2]-=1.06*scoop;
  player.farArm.rot[2]+=.62*scoop;
  player.head.rot[2]-=.22*sink+.09*rebound;
 }
}
`;
html=html.replace(marker,patch+'\n'+marker);
return html;
};
