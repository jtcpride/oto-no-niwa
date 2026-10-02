// Seven original low-poly silhouettes on the established v0.29.1 contact skeleton.
// This file is loaded before the stage compiler; its runtime patch runs AFTER joints.
window.FEGCharacterRigs=window.FEGCharacterRigs||{};
window.FEGCharacterRigs.seven=function({root,group,mesh},x,appearance,face){
 const a=appearance,id=a.model||'toru',isShadow=!!a.shadow;
 const profiles={
  toru:{head:1.40,shoulder:1.08,width:.34,headWidth:.26,headHeight:.47,height:2.96,stance:-.045,signature:'angular-suit-tie',bow:.77},
  saku:{head:1.45,shoulder:1.12,width:.39,headWidth:.235,headHeight:.53,height:3.48,stance:.018,signature:'wide-court-sleeves-tall-cap',bow:.31},
  sokichi:{head:1.07,shoulder:.83,width:.42,headWidth:.28,headHeight:.43,height:2.58,stance:-.21,signature:'hunched-vest-white-brows',bow:.46},
  sumi:{head:1.40,shoulder:1.09,width:.31,headWidth:.25,headHeight:.48,height:2.95,stance:.01,signature:'triangle-hakama-ponytail-boots',bow:.56},
  nagi:{head:1.31,shoulder:1.0,width:.29,headWidth:.25,headHeight:.46,height:2.86,stance:-.14,signature:'short-jacket-slim-trousers-sneakers',bow:.48},
  kota:{head:.76,shoulder:.51,width:.32,headWidth:.32,headHeight:.48,height:2.34,stance:-.02,signature:'small-hoodie-cap-shorts',bow:.83},
  luka:{head:1.83,shoulder:1.40,width:.32,headWidth:.255,headHeight:.54,height:3.43,stance:.045,signature:'tall-split-longcoat',bow:.35}
 };
 const p=profiles[id]||profiles.toru,n=group(root,[x,.12,0]);n.rot[1]=face<0?Math.PI:0;
 const body=group(n,[0,1.08,0]),head=group(body,[.03,p.head,0]);
 const visible=[],glow=[],cloth=[];
 function part(parent,shape,color,pos,scale,rot=[0,0,0],tag=''){
  const o=mesh(parent,shape,isShadow?'#111018':color,pos,scale,rot);o.fegPart=tag;visible.push(o);return o;
 }
 function edge(parent,pos,scale,rot=[0,0,0]){const e=mesh(parent,'box','#ffe8a8',pos,scale,rot,1);e.visible=false;glow.push(e);return e;}
 function panel(parent,pos,scale,color,rot=[0,0,0],tag='cloth'){
  const g=group(parent,pos);g.rot=rot;part(g,'box',color,[0,0,0],scale,[0,0,0],tag);cloth.push({n:g,rest:[...rot],kind:tag});return g;
 }
 // Put eyes and brows on the actual cheek facets. Fixed box coordinates made
 // them float outside the hexagonal head, especially in a three-quarter view.
 const faceMesh=part(head,id==='kota'?'ico':'head',a.skin,[0,0,0],[p.headWidth,id==='kota'?p.headHeight*.60:p.headHeight,p.headWidth],[0,.12,0],'face');
 function faceFeature(y,z,width,height,color,tag,tilt=0){
  const geo=faceMesh.geo,verts=[];let hit=null;
  for(let i=0;i<geo.p.length;i+=3){const x=geo.p[i]*faceMesh.scale[0],zz=geo.p[i+2]*faceMesh.scale[2];verts.push([x*Math.cos(.12)+zz*Math.sin(.12),geo.p[i+1]*faceMesh.scale[1],-x*Math.sin(.12)+zz*Math.cos(.12)]);}
  for(let i=0;i<verts.length;i+=3){
   const [v,w,q]=verts.slice(i,i+3),den=(w[2]-q[2])*(v[1]-q[1])+(q[1]-w[1])*(v[2]-q[2]);if(Math.abs(den)<1e-8)continue;
   const u=((w[2]-q[2])*(y-q[1])+(q[1]-w[1])*(z-q[2]))/den,b=((q[2]-v[2])*(y-q[1])+(v[1]-q[1])*(z-q[2]))/den;
   if(u<0||b<0||u+b>1)continue;const x=u*v[0]+b*w[0]+(1-u-b)*q[0];if(hit&&hit.x>=x)continue;
   const d=w.map((n,j)=>n-v[j]),e=q.map((n,j)=>n-v[j]),nx=d[1]*e[2]-d[2]*e[1],nz=d[0]*e[1]-d[1]*e[0],len=Math.hypot(nx,nz)||1;hit={x,nx:Math.abs(nx)/len,nz:(nx<0?-nz:nz)/len};
  }
  if(!hit)return;
  part(head,'box',color,[hit.x+hit.nx*.009,y,z+hit.nz*.009],[.014,height,width],[tilt,Math.atan2(-hit.nz,hit.nx),0],tag);
 }
 const expression={toru:[.040,.084,.030,.16,-.005],saku:[.028,.076,.023,.07,.0],sokichi:[.033,.090,.073,-.10,-.006],sumi:[.034,.071,.022,-.07,.0],nagi:[.035,.084,.031,-.22,.007],kota:[.045,.070,.027,.12,.012],luka:[.034,.081,.025,-.05,.0]}[id]||[.038,.080,.027,0,0];
 for(const z of [-1,1]){
  faceFeature(.044,z*p.headWidth*.38,expression[1],expression[0],a.eyes,'eye');
  faceFeature(.111,z*p.headWidth*.38,expression[1]*1.22,expression[2],a.hair,id==='sokichi'?'thick-white-brow':'brow',z*expression[3]);
  faceFeature(-.133+expression[4],z*.028,.060,id==='kota'?.020:.014,a.nose,'mouth',z*(id==='kota'?.22:expression[4]*4));
  part(head,'ico',a.skin,[-.04,-.055,z*p.headWidth*.91],[.068,.095,.05],[0,0,0],'ear');
 }
 part(head,'box',a.nose,[p.headWidth*.91,-.04,0],[id==='sokichi'?.14:id==='saku'?.085:.10,id==='luka'?.13:.09,id==='saku'?.095:.115],[0,0,0],'nose');
 const hairTop=p.headHeight*.45;
 part(head,'box',a.hair,[-.06,hairTop,0],[p.headWidth*1.67,.14,p.headWidth*1.70],[0,0,-.045],'hair');
 part(head,'box',a.hair,[-p.headWidth*.69,.085,0],[.11,.32,p.headWidth*1.65],[0,0,-.12],'back-hair');
 if(id==='toru'){
  part(head,'box',a.hair,[.07,hairTop+.05,.05],[.27,.08,.36],[0,0,.10],'parted-hair');
  part(head,'cone',a.hair,[-.10,hairTop+.12,-.03],[.07,.21,.08],[0,0,-.65],'stray-lock');
 }else if(id==='saku'){
  part(head,'box',a.cap,[-.075,.43,0],[.38,.28,.40],[0,0,-.12],'cap-base');
  part(head,'box',a.cap,[-.13,.66,0],[.22,.48,.27],[0,0,-.18],'high-eboshi');
  part(head,'box',a.trim,[.09,.34,.215],[.03,.23,.022],[0,0,-.08],'cap-cord');
 }else if(id==='sokichi'){
  for(const z of [-.21,.21]){
   part(head,'box',a.hair,[.08,-.12,z],[.13,.05,.055],[0,0,.15],'white-sideburn');
  }
  part(head,'box',a.hair,[.12,-.205,0],[.24,.08,.25],[0,0,0],'short-white-beard');
 }else if(id==='sumi'){
  part(head,'box',a.hair,[-.09,.18,0],[.38,.23,.48],[0,0,.15],'swept-hair');
  const pony=panel(head,[-.25,-.22,-.02],[.15,.69,.17],a.hair,[0,0,-.18],'ponytail');
  part(head,'box',a.trim,[-.255,-.025,-.02],[.19,.08,.20],[0,0,0],'hair-tie');
 }else if(id==='nagi'){
  part(head,'box',a.hair,[-.06,.15,.03],[.42,.24,.47],[0,0,.22],'short-slanted-hair');
  part(head,'box',a.hair,[.07,.20,.18],[.28,.11,.11],[0,0,.40],'fringe');
 }else if(id==='kota'){
  part(head,'head',a.cap,[-.025,.25,0],[.34,.20,.33],[0,0,0],'red-cap');
  part(head,'box',a.cap,[-.31,.235,0],[.36,.045,.48],[0,0,-.06],'backward-cap-brim');
  part(head,'box',a.shirt,[.265,.25,0],[.04,.07,.16],[0,0,0],'cap-strap');
 }else{
  part(head,'box',a.hair,[-.12,.12,0],[.30,.36,.45],[0,0,-.08],'swept-back-hair');
  part(head,'ico',a.hair,[-.34,.05,0],[.13,.11,.12],[0,0,0],'tied-hair');
 }
 // Upper body design. All trims are actual low-poly geometry.
 if(id==='toru'){
  part(body,'box',a.trousers,[0,.07,0],[.47,.27,.59],[0,0,0],'suit-waist');
  part(body,'box',a.robe,[0,.65,0],[.53,1.08,.72],[0,0,0],'suit-jacket');
  part(body,'box',a.shirt,[.285,.86,0],[.035,.60,.40],[0,0,0],'white-shirt');
  for(const z of [-1,1]){
   part(body,'box',a.robe,[.315,.84,z*.23],[.05,.62,.16],[z*.30,0,0],'jacket-lapel');
   part(body,'box',a.shirt,[.325,1.08,z*.105],[.045,.19,.14],[z*.45,0,0],'shirt-collar');
   edge(body,[.337,.84,z*.20],[.018,.60,.018],[z*.30,0,0]);
  }
  const tie=panel(body,[.34,.74,0],[.035,.47,.105],a.trim,[.05,0,-.08],'tie');
  part(body,'box',a.trim,[.325,1.015,0],[.065,.09,.115],[0,0,-.07],'loosened-tie-knot');
  part(body,'box',a.accent,[.28,.56,.25],[.025,.028,.19],[0,0,0],'pocket');
  for(const y of [.58,.39])part(body,'box',a.accent,[.282,y,-.035],[.025,.035,.035],[0,0,0],'button');
  for(const z of [-1,1])panel(body,[-.06,.18,z*.24],[.44,.30,.22],a.robe,[0,0,-.035],'jacket-hem');
 }else if(id==='saku'){
  part(body,'robe',a.robe,[0,.67,0],[.44,1.05,.44],[0,0,0],'court-robe');
  part(body,'box',a.shirt,[.26,1.08,0],[.25,.23,.32],[0,0,-.22],'crossed-collar');
  part(body,'box',a.trim,[.02,.32,0],[.69,.13,.81],[0,0,0],'court-belt');
  for(const z of [-1,1])panel(body,[.05,.12,z*.29],[.57,.65,.29],a.trousers,[z*.02,0,0],'court-hakama');
  part(body,'box',a.accent,[.38,.78,.23],[.035,.60,.06],[0,0,-.10],'robe-seam');
 }else if(id==='sokichi'){
  part(body,'robe',a.robe,[.03,.43,0],[.42,.85,.42],[0,0,0],'work-shirt');
  part(body,'box',a.trim,[-.17,.55,0],[.32,.92,.79],[0,0,.10],'vest-back');
  for(const z of [-1,1]){
   part(body,'box',a.trim,[.18,.50,z*.28],[.26,.79,.23],[0,0,-.06],'vest-front');
   part(body,'box',a.accent,[.32,.26,z*.27],[.045,.18,.18],[0,0,0],'vest-pocket');
  }
  part(body,'box',a.shirt,[.23,.64,0],[.08,.52,.27],[0,0,-.17],'work-shirt-collar');
 }else if(id==='sumi'){
  part(body,'robe',a.robe,[0,.78,0],[.34,.87,.35],[0,0,0],'white-kosode');
  part(body,'box',a.shirt,[.27,1.0,0],[.08,.43,.38],[0,0,-.24],'cross-collar');
  part(body,'box',a.trousers,[0,.34,0],[.66,.19,.77],[0,0,0],'hakama-obi');
  // Two large faceted panels preserve the broad triangular hem and split for kicks.
  for(const z of [-1,1]){
   const skirt=group(body,[0,-.09,z*.27]);
   part(skirt,'robe',a.trousers,[0,0,0],[.47,.79,.36],[0,0,0],'hakama-panel');
   cloth.push({n:skirt,rest:[0,0,0],kind:'hakama'});
   for(const x of [-.20,.08,.30])part(skirt,'box',a.trim,[x,-.08,z*.29],[.02,.63,.035],[0,0,x*.12],'hakama-pleat');
  }
  part(body,'box',a.trim,[.35,.32,.05],[.08,.20,.34],[0,0,-.15],'hakama-knot');
 }else if(id==='nagi'){
  part(body,'box',a.trousers,[0,.04,0],[.40,.22,.52],[0,0,0],'sports-waist');
  part(body,'box',a.shirt,[.02,.51,0],[.43,1.02,.57],[0,0,-.04],'sports-top');
  part(body,'box',a.robe,[-.03,.85,0],[.46,.62,.67],[0,0,0],'cropped-windbreaker');
  part(body,'box',a.trim,[.22,.85,0],[.035,.63,.035],[0,0,0],'jacket-zip');
  for(const z of [-1,1]){
   part(body,'box',a.trim,[.06,.63,z*.32],[.33,.045,.03],[0,0,.18],'diagonal-reflector');
   part(body,'box',a.robe,[.02,1.17,z*.18],[.35,.13,.19],[0,0,-.22],'sports-collar');
  }
 }else if(id==='kota'){
  part(body,'box',a.robe,[0,.32,0],[.60,.65,.76],[0,0,0],'oversize-yellow-hoodie');
  part(body,'ico',a.trim,[-.18,.52,0],[.30,.29,.37],[0,0,0],'hood');
  part(body,'box',a.robe,[.24,.30,0],[.21,.42,.70],[0,0,0],'hoodie-front');
  part(body,'box',a.trim,[.35,.23,0],[.025,.17,.39],[0,0,0],'kangaroo-pocket');
  for(const z of [-.11,.11])part(body,'box',a.shirt,[.35,.50,z],[.025,.23,.024],[0,0,z],'drawstring');
 }else{
  part(body,'cyl',a.skin,[0,1.53,0],[.12,.32,.12],[0,0,0],'neck');
  part(body,'box',a.shirt,[0,.86,0],[.47,1.19,.62],[0,0,0],'rust-inner');
  part(body,'box',a.robe,[-.24,.83,0],[.20,1.45,.77],[0,0,.035],'coat-back');
  for(const z of [-1,1]){
   part(body,'box',a.robe,[.13,.90,z*.29],[.37,1.16,.23],[0,0,0],'sleeveless-coat-front');
   part(body,'box',a.accent,[.27,1.37,z*.22],[.10,.34,.18],[z*.18,0,-.15],'coat-lapel');
   panel(body,[-.075,-.04,z*.28],[.60,.85,.28],a.robe,[z*.045,0,-.07],'longcoat-tail');
   part(body,'box',a.trim,[.34,.65,z*.29],[.035,.04,.20],[0,0,0],'coat-pocket');
  }
  part(body,'box',a.trim,[0,.41,0],[.61,.13,.72],[0,0,0],'travel-belt');
 }
 const arm=group(body,[.025,p.shoulder,.40]),farArm=group(body,[.025,p.shoulder,-.40]),arms=[];
 for(const [i,shoulder] of [arm,farArm].entries()){
  const elbow=group(shoulder,[.07,-.35,0]),wrist=group(elbow,[.05,-.35,0]);arms.push(elbow,wrist);
  const clothColor=id==='luka'?a.shirt:a.robe,wide=id==='saku'?.43:id==='sumi'?.32:id==='kota'?.29:.21;
  if(id==='luka'){
   part(shoulder,'robe',a.skin,[.025,-.16,0],[.145,.38,.145],[0,0,.08],'bare-upper-arm');
   part(elbow,'robe',a.skin,[.025,-.16,0],[.125,.35,.125],[0,0,.08],'bare-forearm');
  }else{
   part(shoulder,'robe',clothColor,[.015,-.16,0],[wide,.37,wide],[0,0,.08],id==='saku'?'court-upper-sleeve':'upper-sleeve');
   part(elbow,'robe',clothColor,[.015,-.16,0],[wide*.88,.35,wide*.90],[0,0,.08],'fore-sleeve');
  }
  if(id==='saku'){
   const sleeve=panel(elbow,[-.14,-.11,0],[.50,.50,.68],a.robe,[0,0,-.15],'hanging-court-sleeve');
   part(sleeve,'box',a.trim,[.25,-.23,0],[.025,.045,.69],[0,0,0],'sleeve-border');
  }
  if(id==='nagi')part(elbow,'box',a.trim,[.01,-.12,(i?-.18:.18)],[.24,.045,.03],[0,0,-.12],'sleeve-reflector');
  if(id==='toru')part(elbow,'box',a.shirt,[.04,-.31,0],[.23,.08,.24],[0,0,0],'shirt-cuff');
  part(wrist,'ico',a.skin,[0,-.035,0],[id==='sokichi'?.16:.13,.15,.13],[0,0,0],'hand');
 }
 // Fixed hip / knee / ankle / toe pivots: contact solver and shot timing are unchanged.
 const leg=group(n,[.08,1.05,.22]),back=group(n,[-.13,1.05,-.23]),joints=[],toes=[];
 for(const l of [leg,back]){
  const thigh=group(l),knee=group(thigh,[0,-.48,0]),shoe=group(knee,[0,-.48,0]),toe=group(shoe,[.16,0,0]);joints.push(thigh,knee,shoe);toes.push(toe);
  const wide=id==='saku'?.29:id==='sumi'?.27:id==='sokichi'?.245:id==='kota'?.235:.19;
  part(thigh,id==='toru'||id==='nagi'?'box':'robe',a.trousers,[0,-.22,0],[id==='toru'||id==='nagi'?wide*1.70:wide,.47,wide*1.14],[0,0,0],id==='kota'?'navy-shorts':'upper-trousers');
  part(knee,id==='toru'||id==='nagi'?'box':'robe',id==='kota'?a.skin:a.trousers,[0,-.22,0],[id==='toru'||id==='nagi'?wide*1.50:wide*.80,.46,wide*.98],[0,0,0],id==='kota'?'bare-shin':'lower-trousers');
  if(id==='sokichi'){
   part(knee,'robe',a.trim,[0,-.31,0],[.19,.27,.21],[0,0,0],'gaiter');
   for(const y of [-.22,-.30,-.38])part(knee,'box',a.accent,[.17,y,.01],[.026,.025,.31],[0,0,0],'gaiter-tie');
  }
  if(id==='sumi'){
   part(knee,'box',a.shoes,[.03,-.31,.005],[.27,.31,.28],[0,0,0],'boot-shaft');
   for(const y of [-.22,-.29,-.36])part(knee,'box',a.accent,[.18,y,.01],[.024,.02,.12],[0,0,0],'boot-lace');
  }
  if(id==='kota')part(knee,'cyl',a.shirt,[0,-.35,0],[.145,.20,.145],[0,0,0],'white-sock');
  part(shoe,'box',a.shoes,[.025,0,.02],[.27,.16,.29],[0,0,0],'heel');
  part(toe,'box',a.shoes,[.08,0,.02],[.19,.16,.29],[0,0,0],'square-toe');
  part(shoe,'box',id==='nagi'||id==='kota'?a.shirt:a.eyes,[.035,-.08,.02],[.29,.035,.31],[0,0,0],'sole');
  part(toe,'box',id==='nagi'||id==='kota'?a.shirt:a.eyes,[.08,-.08,.02],[.20,.035,.31],[0,0,0],'toe-sole');
  if(id==='nagi'||id==='kota')for(const xx of [.005,.07])part(shoe,'box',a.shirt,[xx,.085,.02],[.027,.018,.21],[0,0,0],'sneaker-lace');
  edge(shoe,[.04,-.042,.176],[.30,.02,.018]);
 }
 // Small attached emissive edging floats with the same suit/model; no replacement body.
 for(const z of [-1,1]){edge(body,[-.02,.18,z*.39],[.48,.025,.02]);edge(head,[-.055,hairTop+.075,z*p.headWidth*.83],[.40,.015,.015]);}
 const actor={n,body,head,arm,farArm,leg,back,thigh:joints[0],knee:joints[1],shoe:joints[2],backThigh:joints[3],backKnee:joints[4],backShoe:joints[5],elbow:arms[0],wrist:arms[1],farElbow:arms[2],farWrist:arms[3],toe:toes[0],backToe:toes[1],kick:0,phase:face<0?1.7:0};
 for(let i=0;i<2;i++)joints[i*3+2].toe=toes[i];
 actor.chestHeight=1.08+p.shoulder-.19;
 actor.characterV030={id,isShadow,profile:p,parts:visible,glow,cloth,godMode:false,pose:'idle',headHeight:p.head,meshCount:visible.length,markers:[[.26,p.head,.22],[.34,p.shoulder-.19,.24],[.34,id==='kota'?-.10:.27,.24],[.05,id==='kota'?.45:.55,.24]],poses:['idle','bow','kick','stagger','pursuit','win'],contactContract:'garden-v0291:hip=1.05;segments=.48;toe=.16'};
 return actor;
};

window.otoPatchCharactersV030=function(html){
 function once(a,b){if(html.split(a).length!==2)throw Error('v0.30 characters anchor: '+a.slice(0,90));html=html.replace(a,b);}
 // Resolve a shadow at runtime from the selected player, including future player choices.
 once('const CPU_CHARACTER=STAGE_CONTENT.characters.find(c=>c.id===ACTIVE_STAGE.opponent);',`const CPU_SOURCE_CHARACTER=STAGE_CONTENT.characters.find(c=>c.id===ACTIVE_STAGE.opponent);
const CPU_CHARACTER=CPU_SOURCE_CHARACTER.derivedFromPlayer?{...PLAYER_CHARACTER,id:'shadow',name:CPU_SOURCE_CHARACTER.name,derivedFromPlayer:true,appearance:{...PLAYER_CHARACTER.appearance,shadow:true}}:CPU_SOURCE_CHARACTER;`);
 once(' const actor=CHARACTER_RIGS[character.rig]({root,group,mesh},x,character.appearance,face);',' const actor=CHARACTER_RIGS[character.rig]({root,group,mesh},x,character.appearance,face);actor.characterId=character.id;actor.characterName=character.name;');
 once("$('#start').addEventListener('click',start);",String.raw`
// Pose accents are render-only. The canonical two-link legs remain untouched.
// All saves participate in the existing reverse restore stack, including pauses.
function characterPoseV030(f,key){
 const c=f.characterV030;if(!c)return;
 const p=c.profile,phase=duelV022.phase,age=feelEnabledV023&&duelV022.entered?strideV024[key].attack:motionV029[key].age;
 const bow=bowAmountV0104(),inClose=inCloseV027(),win=f===player&&state.cpuDefeated;
 const hurt=f===cpu?state.cpuHurt:Math.max(bodyHitV010,knockdownV010,state.hurt),chasing=phase==='break';
 const k=age<.72?1-easeV023(age,.12,.60):0,strength=motion?1:.3;
 c.pose=bow>0?'bow':win?'win':chasing?'pursuit':hurt>0?'stagger':k>0||inClose?'kick':'idle';
 const sway=motion?Math.sin(visualTime*(c.id==='kota'?5.8:2.1)+f.phase):0;
 for(const node of [f.body,f.head,f.arm,f.farArm,f.elbow,f.farElbow,f.wrist,f.farWrist])saveDramaV028(node);
 // Close-combat torso anchors are already used by the foot solver. Preserve them.
 if(!inClose){
  f.body.rot[2]+=p.stance*(bow>0?.25:1);
  if(c.id==='toru'){
   f.arm.rot[2]-=.08+.13*k;f.farArm.rot[2]+=.07+.12*k;f.head.rot[2]+=.04;
   f.elbow.rot[2]+=.07;f.farElbow.rot[2]+=.08;
   if(win){f.body.rot[2]+=.10;f.head.rot[2]-=.12;f.arm.rot[2]-=.18;f.farArm.rot[2]-=.10;}
  }else if(c.id==='saku'){
   f.arm.rot[2]-=.24;f.farArm.rot[2]-=.24;f.elbow.rot[2]+=.47;f.farElbow.rot[2]+=.47;
   f.head.rot[2]-=.025;f.body.rot[1]+=.06*k;f.body.pos[1]-=.009*sway;
   if(win){f.elbow.rot[2]+=.40;f.farElbow.rot[2]+=.40;f.head.rot[2]+=.05;}
  }else if(c.id==='sokichi'){
   f.head.rot[2]+=.13;f.arm.rot[2]-=.29;f.farArm.rot[2]-=.26;f.elbow.rot[2]+=.18;f.farElbow.rot[2]+=.18;
   f.body.pos[1]-=.08;f.body.rot[2]-=.08*Math.max(0,hurt)*strength;
   if(duelV022.entered)f.body.rot[2]+=.10;
   if(win){f.body.rot[2]+=.12;f.farArm.rot[2]+=1.0;f.farElbow.rot[2]+=.30;}
  }else if(c.id==='sumi'){
   f.body.rot[1]+=.10+.24*k*strength;f.arm.rot[2]-=.17;f.farArm.rot[2]+=.12;f.head.rot[1]-=.10;
   f.elbow.rot[2]+=.22;f.farElbow.rot[2]+=.18;
   if(win){f.arm.rot[2]-=.25;f.farArm.rot[2]-=.25;f.head.rot[2]+=.07;}
  }else if(c.id==='nagi'){
   f.arm.rot[2]+=.18+.20*k;f.farArm.rot[2]-=.16+.17*k;f.elbow.rot[2]+=.48;f.farElbow.rot[2]+=.35;
   f.head.rot[2]+=.10;f.body.pos[1]-=.015*(sway+1)*strength;
   if(win){f.arm.rot[2]+=1.03;f.elbow.rot[2]+=.53;f.body.rot[2]+=.12;}
  }else if(c.id==='kota'){
   f.body.pos[1]+=.018*Math.max(0,sway)*strength;f.arm.rot[0]-=.27+.58*k;f.farArm.rot[0]+=.27+.58*k;
   f.elbow.rot[2]+=.45;f.farElbow.rot[2]+=.40;f.head.rot[2]+=.055*sway*strength;
   if(win){f.arm.rot[0]-=.95;f.farArm.rot[0]+=.95;f.elbow.rot[2]+=.3;f.farElbow.rot[2]+=.3;}
  }else{
   f.arm.rot[2]-=.22;f.farArm.rot[2]+=.14;f.elbow.rot[2]+=.25;f.farElbow.rot[2]+=.20;
   f.body.rot[1]+=.10*k*strength;f.head.rot[2]-=.045;
   if(win){f.arm.rot[2]+=.6;f.elbow.rot[2]+=1.05;f.head.rot[2]+=.08;}
  }
  if(chasing&&motion){
   const run=Math.sin(duelV022.time*(c.id==='kota'?21:c.id==='luka'?12:16));
   f.arm.rot[2]+=run*(c.id==='saku'?.12:.18);f.farArm.rot[2]-=run*(c.id==='saku'?.12:.18);
   f.elbow.rot[2]+=.2;f.farElbow.rot[2]+=.2;
  }
  if(hurt>0&&!win){f.head.rot[2]+=(c.id==='kota'?-.16:c.id==='sokichi'?.05:-.07)*Math.min(1,hurt)*strength;}
 }
 for(const cloth of c.cloth){
  saveDramaV028(cloth.n);const speed=chasing?Math.sin(duelV022.time*14)*.11:0;
  const flutter=(.018*sway+.16*k+speed)*strength+(c.godMode?.11:0);
  cloth.n.rot[2]+=cloth.kind==='ponytail'?-flutter:flutter;
  if(cloth.kind==='hakama')cloth.n.rot[0]+=(cloth.n.pos[2]>0?1:-1)*.24*k*strength;
  if(cloth.kind==='tie'&&c.godMode){cloth.n.rot[2]-=.28;cloth.n.rot[0]+=.15*Math.sin(visualTime*2)*strength;}
 }
 for(const e of c.glow)e.visible=c.godMode&&!c.isShadow;
}
// Individual bows retain the exact ceremony clock and repeated-bow behavior.
applyBowPose=function(){
 const k=bowAmountV0104();if(k<=0)return;
 for(const f of [player,cpu]){
  const c=f.characterV030,p=c?.profile,amount=p?p.bow:.62;
  f.body.rot[2]-=k*amount;f.body.pos[1]-=k*(c?.id==='sokichi'?.11:.07);f.head.rot[2]+=k*.16;
  f.arm.rot[2]-=k*(c?.id==='luka'?-.38:c?.id==='sokichi'?.43:.12);f.farArm.rot[2]-=k*.12;
  // Named elbows are transient in the final presentation layer, so use shoulders here.
  if(c?.id==='kota')f.head.rot[2]-=k*.14;
 }
};
const markerCharactersV030=markerDramaV028;
markerDramaV028=function(f,i){
 const c=f.characterV030;if(!c)return markerCharactersV030(f,i);
 const local=c.markers[i];return transformDramaV028(i===3?local:transformDramaV028(local,f.body),f.n);
};
const prepareCharactersV030=prepareDepthRenderV022;
prepareDepthRenderV022=function(){prepareCharactersV030();characterPoseV030(player,'player');characterPoseV030(cpu,'cpu');
 if(inCloseV027()&&(closeV027.turn%2?cpu:player).characterV030?.id==='kota'){
  // Child-body markers remain on the model; frame them at a readable pixel scale.
  renderer.zoom=Math.max(renderer.zoom,62*Math.max(12.3,renderer.width/renderer.height*6.8)/renderer.width);
  renderer.target[1]=Math.min(renderer.target[1],1.65);
 }
};
function setGodModeCharactersV030(enabled){
 const c=player.characterV030;if(!c)return false;c.godMode=!!enabled;
 for(const e of c.glow)e.visible=c.godMode;
 for(const o of c.parts){if(!o.fegBaseColor)o.fegBaseColor=[...o.color];o.color=c.godMode?o.fegBaseColor.map((v,i)=>Math.min(1,v*.75+[.29,.25,.17][i])):[...o.fegBaseColor];}
 return c.godMode;
};
function getCharactersV030(){return [player,cpu].map(f=>{const c=f.characterV030;return {id:f.characterId,name:f.characterName,model:c?.id,shadow:!!c?.isShadow,godMode:!!c?.godMode,pose:c?.pose,height:c?.profile.height,chestHeight:f.chestHeight,signature:c?.profile.signature,meshCount:c?.meshCount,poses:c?.poses,contactContract:c?.contactContract};});};
$('#start').addEventListener('click',start);`);
 once('select(0);refreshHud();requestAnimationFrame(frame);','window.kemari.setGodMode=setGodModeCharactersV030;window.kemari.getCharacters=getCharactersV030;\nselect(0);refreshHud();requestAnimationFrame(frame);');
 return html;
};
