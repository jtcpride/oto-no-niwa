window.otoPatchKicksV011=function(html){
// v0.11 — four readable player kick forms, one per IPA slot.
// Successful kicks should read as intentional, rhythmic actions; BODY RETURN remains a recoil with no kick.
const marker="$('#start').addEventListener('click',start);";
html=html.replace("version:'0.10.4-slow-fade-time-ball-bow-hold'","version:'0.11.0-four-dynamic-kicks'");
html=html.replace("player.kick=.38;player.shot=kind;launchShot(kind,1,contact);","player.kick=.68;player.kickSlot=state.selected;player.shot=kind;launchShot(kind,1,contact);");
html=html.replace("poseFoot(dt);applyBowPose();","poseFoot(dt);applyKickFormV011();applyBowPose();");
const patch=`
const KICK_DURATION_V011=.68;
function clamp01V011(v){return Math.max(0,Math.min(1,v));}
function smoothV011(v){v=clamp01V011(v);return v*v*(3-2*v);}
function kickEnvelopeV011(t){
 // Fast contact, readable follow-through, then a clean recovery.
 const attack=smoothV011(t/.18);
 const release=1-smoothV011((t-.50)/.18);
 return Math.min(attack,release);
}
function applyKickFormV011(){
 if(player.kick<=0||player.shot==='rescue')return;
 const t=clamp01V011(1-player.kick/KICK_DURATION_V011);
 const hit=kickEnvelopeV011(t);
 const snap=Math.sin(clamp01V011(t/.34)*Math.PI);
 const follow=Math.sin(clamp01V011((t-.14)/.54)*Math.PI);
 const recover=smoothV011((t-.50)/.18);
 const slot=Number.isInteger(player.kickSlot)?player.kickSlot:state.selected;

 // Successful actions move toward the rally, never backward. That keeps them visually distinct from BODY RETURN.
 player.n.pos[0]+=.10*hit+.055*follow;
 player.body.pos[1]+=.025*snap;

 if(slot===0){
  // /θ/ — straight rising instep: compact chamber, crisp vertical snap.
  player.leg.pos[1]+=.18*hit;
  player.leg.rot[2]=1.46*hit-.12*recover;
  player.leg.rot[0]=-.10*follow;
  player.back.rot[2]=-.16*hit;
  player.body.rot[2]=-.18*hit+.05*recover;
  player.body.rot[0]+=.06*follow;
  player.arm.rot[2]=-.42*hit+.08*recover;
  player.farArm.rot[2]=.34*hit-.06*recover;
  player.head.rot[2]=-.10*hit;
 }else if(slot===1){
  // /ð/ — inside sweep: rear leg comes through with hip rotation and a broad counter-arm.
  player.back.pos[1]+=.15*hit;
  player.back.rot[2]=1.18*hit;
  player.back.rot[0]=-.66*hit+.16*recover;
  player.leg.rot[2]=-.22*hit;
  player.body.rot[1]-=.36*hit;
  player.body.rot[2]=-.24*hit;
  player.n.pos[2]+=.14*follow;
  player.arm.rot[2]=-.52*hit;
  player.farArm.rot[2]=.48*hit;
  player.head.rot[2]=-.13*hit;
 }else if(slot===2){
  // /ʃ/ — outside arc: front leg cuts outward, torso counter-rotates through the 2.5D plane.
  player.leg.pos[1]+=.16*hit;
  player.leg.rot[2]=1.10*hit;
  player.leg.rot[0]=.78*hit-.18*recover;
  player.back.rot[2]=-.30*hit;
  player.body.rot[1]+=.40*hit;
  player.body.rot[2]=-.11*hit;
  player.n.pos[2]-=.16*follow;
  player.arm.rot[2]=-.34*hit;
  player.farArm.rot[2]=.56*hit;
  player.head.rot[2]=-.06*hit;
 }else{
  // /ʒ/ — deep scoop: weight sinks, rear leg rises high, then the whole body rebounds upright.
  const sink=smoothV011(t/.16)*(1-smoothV011((t-.26)/.28));
  player.body.pos[1]-=.12*sink;
  player.back.pos[1]+=.23*hit;
  player.back.rot[2]=1.52*hit;
  player.back.rot[0]=.26*follow;
  player.leg.rot[2]=-.34*hit;
  player.body.rot[2]=-.30*hit+.10*recover;
  player.body.rot[0]-=.14*sink;
  player.n.pos[0]+=.06*follow;
  player.arm.rot[2]=-.60*hit;
  player.farArm.rot[2]=.42*hit;
  player.head.rot[2]=-.14*hit+.05*recover;
 }
}
`;
html=html.replace(marker,patch+'\n'+marker);
return html;
};
