// Add articulation inside the existing low-poly silhouette, without changing rules.
window.otoPatchJointsV0291=function(html){
 function once(a,b){if(html.split(a).length!==2)throw Error('v0.29.1 anchor: '+a.slice(0,65));html=html.replace(a,b);}
 once("version:'0.29.0-motion-and-contact'","version:'0.29.1-articulated-motion'");
 once('FIFTEENTH EVER GARDEN — v0.29.0','FIFTEENTH EVER GARDEN — v0.29.1');
 once("const arm=group(body,[.06,1.05,.4]);mesh(arm,'robe',tint,[.04,-.32,0],[.32,.66,.3],[0,0,.18]);mesh(arm,'ico',skin,[.12,-.73,0],[.15,.16,.14]);const farArm=group(body,[.06,1.05,-.4]);mesh(farArm,'robe',tint,[.07,-.3,0],[.28,.64,.29],[0,0,.25]);",String.raw`
const arm=group(body,[.06,1.05,.4]),farArm=group(body,[.06,1.05,-.4]),arms=[];
for(const a of [arm,farArm]){
 mesh(a,'robe',tint,[.035,-.17,0],[.30,.35,.29],[0,0,.10]);
 const elbow=group(a,[.07,-.35,0]);mesh(elbow,'robe',tint,[.025,-.16,0],[.27,.34,.27],[0,0,.10]);
 const wrist=group(elbow,[.05,-.35,0]);mesh(wrist,'ico',skin,[0,-.03,0],[.15,.16,.14]);arms.push(elbow,wrist);
}`);
 once("mesh(shoe,'box',shoes,[.12,0,.02],[.40,.14,.29]);joints.push(thigh,knee,shoe);", "mesh(shoe,'box',shoes,[.04,0,.02],[.24,.14,.29]);const toe=group(shoe,[.16,0,0]);mesh(toe,'box',shoes,[.08,0,.02],[.16,.14,.29]);joints.push(thigh,knee,shoe);shoe.toe=toe;");
 once('backShoe:joints[5],kick:0,phase:', 'backShoe:joints[5],elbow:arms[0],wrist:arms[1],farElbow:arms[2],farWrist:arms[3],toe:joints[2].toe,backToe:joints[5].toe,kick:0,phase:');
 once("for(const joint of ['n','body','head','arm','farArm','leg','back','thigh','knee','shoe','backThigh','backKnee','backShoe'])", "for(const joint of ['n','body','head','arm','farArm','leg','back','thigh','knee','shoe','backThigh','backKnee','backShoe','elbow','wrist','farElbow','farWrist','toe','backToe'])");
 once("const KICK_NODES_V011=['body','head','arm','farArm','leg','back','thigh','knee','shoe','backThigh','backKnee','backShoe'];", "const KICK_NODES_V011=['body','head','arm','farArm','leg','back','thigh','knee','shoe','backThigh','backKnee','backShoe','elbow','wrist','farElbow','farWrist','toe','backToe'];");
 once("$('#start').addEventListener('click',start);",String.raw`
const JOINTS_V0291=['elbow','wrist','farElbow','farWrist','toe','backToe'];
const prepareJointsV0291=prepareDepthRenderV022;
prepareDepthRenderV022=function(){
 prepareJointsV0291();const s=motion?1:.3,p=duelV022.phase;
 for(const [key,f] of [['player',player],['cpu',cpu]]){
  for(const joint of JOINTS_V0291)saveDramaV028(f[joint]);
  const a=feelEnabledV023&&duelV022.entered?strideV024[key].attack:motionV029[key].age;
  const power=a<.72?1-easeV023(a,.12,.52):0;
  f.elbow.rot[2]=.30+.65*power*s;f.farElbow.rot[2]=.42+.55*power*s;
  f.wrist.rot[2]=-.10-.13*power*s;f.farWrist.rot[2]=-.10+.15*power*s;
  f.wrist.rot[1]=.12*power*s;f.toe.rot[2]=.18*power*s;f.backToe.rot[2]=-.13*power*s;
  if(f===player&&state.mode==='over'&&motionV029.defeatAge<99){
   const down=motion?easeV023(motionV029.defeatAge,0,.58):1;
   f.elbow.rot[2]=.30+.35*down;f.farElbow.rot[2]=.42+.28*down;
   f.wrist.rot[2]=-.10-.10*down;f.farWrist.rot[2]=-.10-.08*down;
  }
  if(feelEnabledV023&&p==='break'&&motion){
   if(f===player){f.elbow.rot[2]=.95;f.farElbow.rot[2]=1.05;}
   else{
    const t=duelV022.time,{limbSnap:snap,tuck,brace}=pursuitSignalsV028(t);
    f.elbow.rot[2]+=-.18*snap+.85*tuck+.48*brace;f.farElbow.rot[2]+=.15*snap+.58*tuck+.72*brace;
    f.wrist.rot[2]+=.24*snap-.15*brace;f.farWrist.rot[2]-=.18*snap+.10*brace;
    f.toe.rot[2]+=.24*tuck-.16*brace;f.backToe.rot[2]-=.15*snap+.12*tuck;
   }
  }
 }
 if(inCloseV027()){
  const c=closeV027,defending=c.turn%2===0,receiver=defending?player:cpu,attacker=defending?cpu:player;
  // Ready guard has the same posture for all four sounds. Only a committed
  // answer selects a guard height, preserving the listening task.
  if(c.stage==='ask'){
   receiver.elbow.rot[2]=1.1;receiver.farElbow.rot[2]=1.2;
  }else if(c.stage==='react'){
   const guard=defending===c.correct,slot=defending?c.target:(c.picked<0?c.target:c.picked),snap=heldV011(c.time,.18,.30,.68);
   attacker.elbow.rot[2]=.4+.80*snap*s;attacker.farElbow.rot[2]=.55+.80*snap*s;
   receiver.elbow.rot[2]=.3+(guard?1.1:.12)*snap*s;receiver.farElbow.rot[2]=.4+(guard?1.25:.16)*snap*s;
   if(guard&&slot<3){
    saveDramaV028(receiver.arm);saveDramaV028(receiver.farArm);
    const shoulder=[1.30,.65,.05][slot],elbow=[1.38,1.35,.40][slot];
    receiver.arm.rot[2]=shoulder*snap*s;receiver.farArm.rot[2]=(shoulder-.15)*snap*s;
    receiver.arm.rot[0]=.12*snap*s;receiver.farArm.rot[0]=-.28*snap*s;
    receiver.elbow.rot[2]=elbow*snap*s;receiver.farElbow.rot[2]=(elbow+.27)*snap*s;
    receiver.wrist.rot[2]=-.22*snap*s;receiver.farWrist.rot[2]=-.20*snap*s;
   }
   receiver.toe.rot[2]=-.20*snap*s;receiver.backToe.rot[2]=-.15*snap*s;
  }
 }
};
$('#start').addEventListener('click',start);`);
 return html;
};
