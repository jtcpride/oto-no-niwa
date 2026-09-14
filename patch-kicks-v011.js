window.otoPatchKicksV011=function(html){
// v0.11.2 — four unmistakably different player kick forms, one per IPA slot.
// Fixes cumulative transform drift by restoring the prior render pose before poseFoot runs.
const marker="$('#start').addEventListener('click',start);";
html=html.replace("version:'0.10.4-slow-fade-time-ball-bow-hold'","version:'0.11.2-stable-distinct-kick-forms'");
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
  // /θ/ — straight front snap. A tall, narrow silhouette with a high front foot.
  const chamber=heldV011(t,.07,.17,.35);
  const k=heldV011(t,.12,.30,.63);
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
  // /ð/ — rear-leg inside sweep. Wide horizontal arc and strong torso twist toward depth.
  const prep=heldV011(t,.08,.18,.34);
  const k=heldV011(t,.20,.48,.82);
  const arc=Math.sin(clamp01V011((t-.10)/.72)*Math.PI);
  player.body.pos[1]-=.055*prep;
  player.body.pos[2]+=.14*arc;
  player.back.pos[1]+=.22*k;
  player.back.pos[2]+=.22*arc;
  player.back.rot[2]+=1.12*k;
  player.back.rot[0]-=1.34*k;
  player.leg.rot[2]-=.34*k;
  player.leg.rot[0]+=.14*k;
  player.body.rot[1]-=.82*k;
  player.body.rot[2]-=.30*k;
  player.arm.rot[2]-=.86*k;
  player.farArm.rot[2]+=.72*k;
  player.head.rot[2]-=.16*k;
 }else if(slot===2){
  // /ʃ/ — hopping outside side kick. Front leg opens outward while the torso cuts the other way.
  const hop=Math.sin(clamp01V011(t/.72)*Math.PI);
  const k=heldV011(t,.14,.36,.72);
  player.body.pos[1]+=.15*hop;
  player.body.pos[2]-=.18*hop;
  player.leg.pos[1]+=.25*k;
  player.leg.pos[2]-=.26*k;
  player.leg.rot[2]+=.78*k;
  player.leg.rot[0]+=1.48*k;
  player.back.rot[2]-=.50*k;
  player.back.rot[0]-=.24*k;
  player.body.rot[1]+=.94*k;
  player.body.rot[2]+=.22*k;
  player.body.rot[0]-=.20*k;
  player.arm.rot[2]-=.26*k;
  player.farArm.rot[2]+=.96*k;
  player.head.rot[2]+=.12*k;
 }else{
  // /ʒ/ — deep sink then rear-leg scoop. Deliberate two-beat motion with the deepest crouch.
  const sink=heldV011(t,.10,.30,.47);
  const k=heldV011(t,.28,.56,.88);
  const rebound=heldV011(t,.50,.67,.90);
  player.body.pos[1]-=.24*sink;
  player.body.pos[1]+=.07*rebound;
  player.back.pos[1]+=.43*k;
  player.back.pos[0]+=.10*k;
  player.back.rot[2]+=1.98*k;
  player.back.rot[0]+=.58*k;
  player.leg.rot[2]-=.54*k+.16*sink;
  player.body.rot[1]-=.18*k;
  player.body.rot[2]-=.44*k;
  player.body.rot[0]-=.28*sink;
  player.arm.rot[2]-=1.00*k;
  player.farArm.rot[2]+=.58*k;
  player.head.rot[2]-=.20*k+.07*rebound;
 }
}
`;
html=html.replace(marker,patch+'\n'+marker);
return html;
};
