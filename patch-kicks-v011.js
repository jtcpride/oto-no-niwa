window.otoPatchKicksV011=function(html){
// v0.11.1 — four unmistakably different player kick forms, one per IPA slot.
// Success uses a deliberate kick silhouette; BODY RETURN remains a no-kick recoil.
const marker="$('#start').addEventListener('click',start);";
html=html.replace("version:'0.10.4-slow-fade-time-ball-bow-hold'","version:'0.11.1-four-distinct-kick-forms'");
html=html.replace("player.kick=.38;player.shot=kind;launchShot(kind,1,contact);","player.kick=.88;player.kickSlot=state.selected;player.shot=kind;launchShot(kind,1,contact);");
html=html.replace("poseFoot(dt);applyBowPose();","poseFoot(dt);applyKickFormV011();applyBowPose();");
const patch=`
const KICK_DURATION_V011=.88;
function clamp01V011(v){return Math.max(0,Math.min(1,v));}
function smoothV011(v){v=clamp01V011(v);return v*v*(3-2*v);}
function heldV011(t,rise,hold,fall){
 if(t<=0)return 0;
 if(t<rise)return smoothV011(t/rise);
 if(t<hold)return 1;
 if(t<fall)return 1-smoothV011((t-hold)/(fall-hold));
 return 0;
}
function applyKickFormV011(){
 if(player.kick<=0||player.shot==='rescue')return;
 const t=clamp01V011(1-player.kick/KICK_DURATION_V011);
 const slot=Number.isInteger(player.kickSlot)?player.kickSlot:state.selected;

 // Every success travels into the rally. BODY RETURN is the only motion that recoils backward.
 player.n.pos[0]+=.04;

 if(slot===0){
  // /θ/ — sharp rising front kick. Tall, narrow silhouette; almost no depth rotation.
  const k=heldV011(t,.10,.23,.57);
  const lift=heldV011(t,.06,.18,.43);
  player.n.pos[0]+=.19*k;
  player.n.pos[1]+=.055*lift;
  player.leg.pos[1]+=.31*k;
  player.leg.rot[2]=1.78*k;
  player.leg.rot[0]=-.08*k;
  player.back.rot[2]=-.12*k;
  player.back.rot[0]=0;
  player.body.rot[1]=0;
  player.body.rot[2]=-.13*k;
  player.body.rot[0]+=.04*k;
  player.arm.rot[2]=-.58*k;
  player.farArm.rot[2]=.32*k;
  player.head.rot[2]=-.08*k;
 }else if(slot===1){
  // /ð/ — broad inside sweep with the rear leg. Long arc across the 2.5D plane.
  const k=heldV011(t,.18,.40,.78);
  const arc=Math.sin(clamp01V011(t/.72)*Math.PI);
  player.n.pos[0]+=.12*k;
  player.n.pos[2]+=.34*arc;
  player.back.pos[1]+=.18*k;
  player.back.rot[2]=1.02*k;
  player.back.rot[0]=-1.12*k;
  player.leg.rot[2]=-.28*k;
  player.leg.rot[0]=.10*k;
  player.body.rot[1]=-.66*k;
  player.body.rot[2]=-.28*k;
  player.body.rot[0]+=.12*k;
  player.arm.rot[2]=-.76*k;
  player.farArm.rot[2]=.62*k;
  player.head.rot[2]=-.15*k;
 }else if(slot===2){
  // /ʃ/ — hopping outside side kick. The whole body cuts to the opposite depth lane.
  const k=heldV011(t,.13,.31,.69);
  const hop=Math.sin(clamp01V011(t/.64)*Math.PI);
  player.n.pos[0]+=.15*k;
  player.n.pos[1]+=.14*hop;
  player.n.pos[2]-=.40*hop;
  player.leg.pos[1]+=.19*k;
  player.leg.rot[2]=.72*k;
  player.leg.rot[0]=1.28*k;
  player.back.rot[2]=-.42*k;
  player.back.rot[0]=-.18*k;
  player.body.rot[1]=.78*k;
  player.body.rot[2]=.18*k;
  player.body.rot[0]-=.16*k;
  player.arm.rot[2]=-.30*k;
  player.farArm.rot[2]=.82*k;
  player.head.rot[2]=.10*k;
 }else{
  // /ʒ/ — sink, then scoop high with the rear leg. Two-beat rhythm and deepest silhouette.
  const sink=heldV011(t,.12,.31,.49);
  const k=heldV011(t,.25,.48,.84);
  const rebound=heldV011(t,.43,.61,.86);
  player.n.pos[0]+=.20*k;
  player.body.pos[1]-=.18*sink;
  player.body.pos[1]+=.055*rebound;
  player.back.pos[1]+=.34*k;
  player.back.rot[2]=1.82*k;
  player.back.rot[0]=.48*k;
  player.leg.rot[2]=-.46*k-.12*sink;
  player.leg.rot[0]=.08*k;
  player.body.rot[1]=-.16*k;
  player.body.rot[2]=-.38*k+.12*rebound;
  player.body.rot[0]-=.22*sink;
  player.arm.rot[2]=-.86*k;
  player.farArm.rot[2]=.48*k;
  player.head.rot[2]=-.18*k+.06*rebound;
 }
}
`;
html=html.replace(marker,patch+'\n'+marker);
return html;
};
